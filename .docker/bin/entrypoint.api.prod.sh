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

echo "Checking database connection..."
until node apps/api/dist/database/check.js >/dev/null 2>&1; do
  echo "Waiting for MySQL database..."
  sleep 2
done

echo "Running migrations..."
node apps/api/dist/database/migrate.js || true

echo "Starting ProtoFácil API (Prod)..."
exec node apps/api/dist/server.js
