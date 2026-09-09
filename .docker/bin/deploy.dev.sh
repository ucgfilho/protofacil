#!/bin/bash
set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG required}"
CI_REGISTRY_USER="${2:?CI_REGISTRY_USER required}"
CI_REGISTRY_PASSWORD="${3:?CI_REGISTRY_PASSWORD required}"
CI_REGISTRY="${4:?CI_REGISTRY required}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.staging.yml}"
COMPOSE="docker compose -f ${COMPOSE_FILE}"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: compose file not found: $COMPOSE_FILE"
  exit 1
fi

read_env() {
  key="$1"
  default="${2:-}"
  if [ -f .env ]; then
    grep "^${key}=" .env | cut -d= -f2- | tr -d '"' | tr -d "'" || echo "$default"
  else
    echo "$default"
  fi
}

DB_USERNAME="$(read_env DB_USERNAME)"
DB_PASSWORD="$(read_env DB_PASSWORD)"
DB_DATABASE="$(read_env DB_DATABASE)"
PREVIOUS_IMAGE="$(read_env APP_IMAGE)"
BACKUP_FILE="/tmp/db_backup_$(date +%Y%m%d_%H%M%S)_${DB_DATABASE}.sql"

cleanup() {
  rm -f "$BACKUP_FILE"
}
trap cleanup EXIT

if [ -z "$DB_USERNAME" ] || [ -z "$DB_DATABASE" ]; then
  echo "ERROR: DB_USERNAME or DB_DATABASE not found in .env"
  exit 1
fi

echo "Starting database backup: $DB_DATABASE -> $BACKUP_FILE"
$COMPOSE exec -T -e MYSQL_PWD="$DB_PASSWORD" db \
  mysqldump --no-tablespaces -u "$DB_USERNAME" "$DB_DATABASE" > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ] || ! tail -n 5 "$BACKUP_FILE" | grep -qi "Dump completed on"; then
  echo "ERROR: MySQL backup is empty or incomplete"
  exit 1
fi

echo "Backup completed and validated"

rollback() {
  echo ""
  echo "Deploy failed. Starting automatic rollback."
  trap - ERR

  if [ -s "$BACKUP_FILE" ]; then
    echo "Restoring database: $DB_DATABASE"
    $COMPOSE exec -T -e MYSQL_PWD="$DB_PASSWORD" db \
      mysql -u "$DB_USERNAME" "$DB_DATABASE" < "$BACKUP_FILE" || true
    echo "Database restored"
  else
    echo "No valid backup found for restore"
  fi

  if [ -n "$PREVIOUS_IMAGE" ]; then
    echo "Reverting container to previous image: $PREVIOUS_IMAGE"
    if grep -q '^APP_IMAGE=' .env; then
      sed -i "s|^APP_IMAGE=.*|APP_IMAGE=$PREVIOUS_IMAGE|" .env
    else
      echo "APP_IMAGE=$PREVIOUS_IMAGE" >> .env
    fi
    $COMPOSE pull app || true
    $COMPOSE up -d --remove-orphans || true
    echo "Container reverted"
  else
    echo "No previous image registered. Container remains in failed state."
  fi

  exit 1
}

trap 'rollback' ERR

echo "Deploying image: $IMAGE_TAG"
echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"

touch .env

if grep -q '^APP_IMAGE=' .env; then
  sed -i "s|^APP_IMAGE=.*|APP_IMAGE=$IMAGE_TAG|" .env
else
  echo "APP_IMAGE=$IMAGE_TAG" >> .env
fi

$COMPOSE pull app
$COMPOSE up -d --remove-orphans

APP_HEALTH_URL="$(read_env APP_URL http://localhost)"
MAX_RETRIES=30
RETRY_COUNT=0
HEALTHY=false

echo "Waiting for application health: ${APP_HEALTH_URL}/health"

while [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
  if curl -fsSL --max-time 5 "${APP_HEALTH_URL}/health" > /dev/null 2>&1; then
    HEALTHY=true
    break
  fi
  echo "Waiting for boot... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$HEALTHY" = false ]; then
  echo "ERROR: application did not respond at ${APP_HEALTH_URL}/health after $((MAX_RETRIES * 5))s"
  false
fi

docker image prune -f || true
echo "Deploy finished successfully"
