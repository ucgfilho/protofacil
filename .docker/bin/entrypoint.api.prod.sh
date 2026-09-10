#!/bin/sh

load_secret() {
    var_name="$1"
    file_path="$2"
    if [ -f "$file_path" ]; then
        export "$var_name=$(cat "$file_path")"
    fi
}

load_secret DB_PASSWORD "/run/secrets/protofacil_db_password"
load_secret SESSION_SECRET "/run/secrets/protofacil_session_secret"

set -e

echo "Starting Production Entrypoint..."

cd /app

# Garantir links para public e migrations
if [ -d "apps/api/public" ] && [ ! -d "public" ]; then
    ln -sf /app/apps/api/public /app/public
fi

if [ -d "apps/api/src/database/migrations" ] && [ ! -d "apps/api/dist/apps/api/src/database/migrations" ]; then
    mkdir -p apps/api/dist/apps/api/src/database
    ln -sf /app/apps/api/src/database/migrations /app/apps/api/dist/apps/api/src/database/migrations
fi

# Detectar onde o check.js, migrate.js e server.js foram gerados
CHECK_FILE="apps/api/dist/apps/api/src/database/check.js"
if [ ! -f "$CHECK_FILE" ]; then
    CHECK_FILE="apps/api/dist/database/check.js"
fi

MIGRATE_FILE="apps/api/dist/apps/api/src/database/migrate.js"
if [ ! -f "$MIGRATE_FILE" ]; then
    MIGRATE_FILE="apps/api/dist/database/migrate.js"
fi

SERVER_FILE="apps/api/dist/apps/api/src/server.js"
if [ ! -f "$SERVER_FILE" ]; then
    SERVER_FILE="apps/api/dist/server.js"
fi

echo "Checking database connection using $CHECK_FILE..."
until node "$CHECK_FILE"; do
  echo "Waiting for MySQL database..."
  sleep 2
done

echo "Running migrations using $MIGRATE_FILE..."
node "$MIGRATE_FILE" || true

echo "Starting ProtoFácil API (Prod) using $SERVER_FILE..."
exec node "$SERVER_FILE"
