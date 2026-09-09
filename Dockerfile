FROM node:22-alpine AS base
RUN apk add --no-cache mysql-client
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/editor/package.json ./packages/editor/
COPY packages/ui/package.json ./packages/ui/
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build -w packages/shared && \
    npm run build -w packages/editor && \
    npm run build -w packages/ui && \
    npm run build -w apps/api
RUN npm run build -w apps/web
RUN npm prune --omit=dev

FROM base AS prod

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/public ./apps/api/public
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/editor/dist ./packages/editor/dist
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/editor/package.json ./packages/editor/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/src/database/migrations ./apps/api/src/database/migrations
COPY .docker/bin/entrypoint.api.prod.sh /app/entrypoint.prod.sh
RUN chmod +x /app/entrypoint.prod.sh

EXPOSE 3000

CMD ["sh", "/app/entrypoint.prod.sh"]
