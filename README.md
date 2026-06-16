# Stream Pilot

Livestream production planning platform (auth foundation in place).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [pnpm](https://pnpm.io/installation) 9.x (or enable via Corepack: `corepack enable`)

## Setup

```bash
pnpm install
cp .env.example .env   # edit secrets as needed
docker compose up --build
docker compose exec api sh -c "cd /app/api && pnpm exec prisma migrate deploy"
```

App: http://localhost:3000  
API: http://localhost:3001

## Local development (without Docker)

```bash
pnpm install
# Start Postgres (or use docker compose up postgres)
pnpm migrate:deploy
pnpm dev:api   # terminal 1
pnpm dev:app   # terminal 2
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev:api` | Run NestJS API in watch mode |
| `pnpm dev:app` | Run Next.js dev server |
| `pnpm build` | Build api + app |
| `pnpm migrate` | Run Prisma migrate dev (api) |
| `pnpm migrate:deploy` | Apply migrations (api) |
