# Stage 1 — build
FROM node:20-bullseye AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
RUN npx prisma generate

FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apt-get update && apt-get install -y ca-certificates --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

EXPOSE 3000
RUN groupadd -r app && useradd -r -g app app || true
USER app
CMD ["node", "src/server.js"]
