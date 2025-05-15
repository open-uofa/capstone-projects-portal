FROM debian:bookworm AS frontend-builder

WORKDIR /app

RUN apt-get update \
    \
    && apt-get install -y curl \
    \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install

COPY frontend/ ./frontend

ENV NODE_ENV=production

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_ADMIN_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL

# Build the frontend assets into /app/frontend/build
RUN npm --prefix frontend run build

FROM caddy:2-alpine

COPY --from=frontend-builder /app/frontend/build /app/frontend/build