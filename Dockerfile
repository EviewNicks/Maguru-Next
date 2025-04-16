# syntax=docker/dockerfile:1

ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Dependencies stage - hanya menginstal dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Development stage
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Tidak perlu copy source code karena akan menggunakan bind mount
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Testing stage
FROM base AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Tidak perlu copy source code karena akan menggunakan bind mount
ENV NODE_ENV=test
ENV USE_BABEL=true
CMD ["npm", "test"]

# Production build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]