# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/planner/package.json ./packages/planner/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# API stage
FROM base AS api
COPY packages/core ./packages/core
COPY packages/planner ./packages/planner
COPY apps/api ./apps/api

# Build packages
RUN pnpm --filter @ama-planner/core build
RUN pnpm --filter @ama-planner/planner build
RUN pnpm --filter @ama-planner/api build

EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]

# Web stage
FROM base AS web
COPY packages/core ./packages/core
COPY apps/web ./apps/web

# Build web app
RUN pnpm --filter @ama-planner/web build

EXPOSE 3000
CMD ["node", "apps/web/build/index.js"] 