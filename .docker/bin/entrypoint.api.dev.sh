#!/bin/sh
set -e

echo "Starting Development Entrypoint..."

cd /app

echo "Updating dependencies..."
npm install

echo "Checking database connection..."
until npm run db:check -w apps/api >/dev/null 2>&1; do
  echo "Waiting for MySQL database..."
  sleep 2
done

echo "Running migrations..."
npm run db:migrate -w apps/api || true

echo "Building shared packages..."
npm run build -w packages/shared || true
npm run build -w packages/editor || true
npm run build -w packages/ui || true

echo "Starting ProtoFácil (API + Vite Dev)..."
exec npm run dev
