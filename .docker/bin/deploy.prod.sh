#!/bin/bash
set -euo pipefail

echo "Starting deploy via Portainer API"

: "${PORTAINER_URL:?PORTAINER_URL is required}"
: "${PORTAINER_ACCESS_TOKEN:?PORTAINER_ACCESS_TOKEN is required}"
: "${PORTAINER_ENDPOINT_ID:?PORTAINER_ENDPOINT_ID is required}"
: "${PORTAINER_STACK_ID:?PORTAINER_STACK_ID is required}"
: "${PORTAINER_CACERT:?PORTAINER_CACERT is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${WEB_IMAGE_TAG:?WEB_IMAGE_TAG is required}"
: "${APP_URL_PROD:?APP_URL_PROD is required}"

COMPOSE_FILE="compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: compose file not found: $COMPOSE_FILE"
  exit 1
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

STACK_FILE="$TMP_DIR/portainer_stack.json"
PAYLOAD_FILE="$TMP_DIR/payload.json"
RESPONSE_FILE="$TMP_DIR/portainer_response.json"

echo "Fetching current stack from Portainer"
GET_STATUS=$(curl -s --cacert "$PORTAINER_CACERT" \
  -o "$STACK_FILE" -w "%{http_code}" \
  -H "X-API-Key: ${PORTAINER_ACCESS_TOKEN}" \
  "${PORTAINER_URL}/api/stacks/${PORTAINER_STACK_ID}")

if [ "$GET_STATUS" -ne 200 ]; then
  echo "ERROR: failed to fetch stack (HTTP $GET_STATUS)"
  cat "$STACK_FILE"
  exit 1
fi

PREVIOUS_APP_IMAGE=$(python3 -c "
import json
with open('$STACK_FILE') as f:
    env = json.load(f).get('Env') or []
print(next((v['value'] for v in env if v['name'] == 'APP_IMAGE'), ''))
")

PREVIOUS_WEB_IMAGE=$(python3 -c "
import json
with open('$STACK_FILE') as f:
    env = json.load(f).get('Env') or []
print(next((v['value'] for v in env if v['name'] == 'WEB_IMAGE'), ''))
")

echo "Previous images: APP=${PREVIOUS_APP_IMAGE:-n/a} | WEB=${PREVIOUS_WEB_IMAGE:-n/a}"

rollback() {
  echo ""
  echo "Deploy failed. Starting Portainer rollback."
  trap - ERR

  if [ -n "$PREVIOUS_APP_IMAGE" ]; then
    echo "Reverting to previous images: APP=$PREVIOUS_APP_IMAGE WEB=${PREVIOUS_WEB_IMAGE:-n/a}"

    ROLLBACK_PAYLOAD="$TMP_DIR/rollback_payload.json"
    ROLLBACK_RESPONSE="$TMP_DIR/rollback_response.json"

    python3 -c "
import sys, json

with open('$STACK_FILE') as f:
    env_vars = json.load(f).get('Env') or []

env_vars = [v for v in env_vars if v.get('name') not in ['APP_IMAGE', 'WEB_IMAGE']]
env_vars.append({'name': 'APP_IMAGE', 'value': '$PREVIOUS_APP_IMAGE'})
if '$PREVIOUS_WEB_IMAGE':
    env_vars.append({'name': 'WEB_IMAGE', 'value': '$PREVIOUS_WEB_IMAGE'})

json.dump({
    'stackFileContent': sys.stdin.read(),
    'env': env_vars,
    'prunable': True,
    'pullImage': True
}, sys.stdout)
" < "$COMPOSE_FILE" > "$ROLLBACK_PAYLOAD"

    ROLLBACK_STATUS=$(curl -s --cacert "$PORTAINER_CACERT" \
      -o "$ROLLBACK_RESPONSE" -w "%{http_code}" \
      -X PUT "${PORTAINER_URL}/api/stacks/${PORTAINER_STACK_ID}?endpointId=${PORTAINER_ENDPOINT_ID}" \
      -H "X-API-Key: ${PORTAINER_ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "@$ROLLBACK_PAYLOAD")

    if [ "$ROLLBACK_STATUS" -eq 200 ]; then
      echo "Rollback sent to Portainer successfully"
    else
      echo "ERROR: rollback failed (HTTP $ROLLBACK_STATUS). Manual intervention is required."
      cat "$ROLLBACK_RESPONSE"
    fi
  else
    echo "No previous image registered. Manual intervention is required."
  fi

  exit 1
}

trap 'rollback' ERR

python3 -c "
import sys, json, os

try:
    with open('$STACK_FILE') as f:
        env_vars = json.load(f).get('Env') or []
except Exception:
    env_vars = []

env_vars = [v for v in env_vars if v.get('name') not in ['APP_IMAGE', 'WEB_IMAGE']]
env_vars.append({'name': 'APP_IMAGE', 'value': os.environ['IMAGE_TAG']})
env_vars.append({'name': 'WEB_IMAGE', 'value': os.environ['WEB_IMAGE_TAG']})

json.dump({
    'stackFileContent': sys.stdin.read(),
    'env': env_vars,
    'prunable': True,
    'pullImage': True
}, sys.stdout)
" < "$COMPOSE_FILE" > "$PAYLOAD_FILE"

echo "Updating Portainer stack ${PORTAINER_STACK_ID}"
HTTP_STATUS=$(curl -s --cacert "$PORTAINER_CACERT" \
  -o "$RESPONSE_FILE" -w "%{http_code}" \
  -X PUT "${PORTAINER_URL}/api/stacks/${PORTAINER_STACK_ID}?endpointId=${PORTAINER_ENDPOINT_ID}" \
  -H "X-API-Key: ${PORTAINER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "@$PAYLOAD_FILE")

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "ERROR: failed to update stack (HTTP $HTTP_STATUS)"
  cat "$RESPONSE_FILE"
  false
fi

echo "Stack accepted by Portainer. Waiting for containers to boot."

MAX_RETRIES=30
RETRY_COUNT=0
HEALTHY=false

while [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
  if curl -fsSL --max-time 5 "${APP_URL_PROD}/health" > /dev/null 2>&1; then
    HEALTHY=true
    break
  fi
  echo "Waiting for boot... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$HEALTHY" = false ]; then
  echo "ERROR: application did not respond at ${APP_URL_PROD}/health after $((MAX_RETRIES * 5))s"
  false
fi

echo "Deploy finished successfully. APP: $IMAGE_TAG"
