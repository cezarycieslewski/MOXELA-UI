# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

# BUILD_MODE=embed skips the login screen entirely (VITE_EMBED_MODE, see App.jsx and
# .env.embed) — for mounting MOXELA UI inside VideoIPath.
#   docker build --build-arg BUILD_MODE=embed -t moxela-ui:embed .
ARG BUILD_MODE=standard
RUN if [ "$BUILD_MODE" = "embed" ]; then npm run build:embed; else npm run build; fi

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM nginx:alpine

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

# Static app
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx template (processed at startup by entrypoint)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Entrypoint runs envsubst then starts nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Default backend — override with -e MOXELA_BACKEND_URL=http://your-server
ENV MOXELA_BACKEND_URL=http://stark.oslo.nevion.com

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
