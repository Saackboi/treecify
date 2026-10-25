# Same Dockerfile for Docker and Podman; compiler toolchain stays in the build stage.
FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build && npm prune --omit=dev && npm cache clean --force

FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS runtime
ENV NODE_ENV=production PORT=3001 DB_PATH=/data/links.db UPLOAD_DIR=/data/uploads
WORKDIR /app
COPY --from=build --chown=10001:10001 /app/node_modules ./node_modules
COPY --from=build --chown=10001:10001 /app/dist ./dist
COPY --chown=10001:10001 package.json package-lock.json ./
COPY --chown=10001:10001 server/ ./server/
RUN mkdir -p /data/uploads && chown -R 10001:10001 /data
USER 10001:10001
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "server/index.js"]
