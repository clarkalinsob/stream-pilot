FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/
COPY app/package.json ./app/
COPY api/prisma ./api/prisma/

RUN pnpm install --frozen-lockfile --filter stream-pilot-api

COPY api ./api

RUN chmod +x /app/api/docker-entrypoint.sh

WORKDIR /app/api

EXPOSE 3001

ENTRYPOINT ["/app/api/docker-entrypoint.sh"]
CMD ["pnpm", "run", "start:dev:docker"]
