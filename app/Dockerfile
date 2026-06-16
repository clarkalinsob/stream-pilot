FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/
COPY app/package.json ./app/

RUN pnpm install --frozen-lockfile --filter stream-pilot-app

COPY app ./app

WORKDIR /app/app

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
