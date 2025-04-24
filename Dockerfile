# syntax=docker/dockerfile:1
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Dependencies stage - hanya menginstal dependencies
FROM base AS deps
# Tambahkan dependensi yang diperlukan untuk Prisma
RUN apk update && apk add --no-cache libc6-compat openssl

# Copy prisma files terlebih dahulu
COPY prisma/schema.prisma ./prisma/
COPY prisma/migrations ./prisma/migrations/
COPY prisma/seed.ts ./prisma/

# Salin package.json dan yarn.lock
COPY package.json yarn.lock* ./
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Generate Prisma client jika folder prisma/generated tidak ada
# Ini hanya akan berjalan saat pertama kali build
RUN mkdir -p ./prisma/generated && \
    if [ ! -d ./prisma/generated/client ]; then \
    echo "Generating Prisma client..." && \
    npx prisma generate; \
    else \
    echo "Prisma client already exists, skipping generation"; \
    fi

# Development stage
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma/generated ./prisma/generated
# Tidak perlu copy source code karena akan menggunakan bind mount
ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn", "dev"]

# Testing stage
FROM base AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma/generated ./prisma/generated
# Tidak perlu copy source code karena akan menggunakan bind mount
ENV NODE_ENV=test
ENV USE_BABEL=true
CMD ["yarn", "test"]

# Production build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma/generated ./prisma/generated
COPY . .
RUN yarn build

# Production stage
FROM base AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma/generated ./prisma/generated
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["yarn", "start"]