# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Install deps first (better layer caching) and ensure Prisma schema is available for postinstall
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Copy source
COPY . .

# Prisma client is generated in your postinstall already; if needed, uncomment below:
# RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 8000

# Healthcheck (adjust path if you have a dedicated health endpoint)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
#   CMD wget -qO- http://localhost:8000/api/v1/events || exit 1

# Start script runs migrations then starts server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]