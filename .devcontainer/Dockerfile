FROM debian:bookworm

RUN apt-get update \
    \
    && apt-get install -y \
    git \
    curl \
    python3 \
    python3-pip \
    \
    && curl -LsSf https://astral.sh/uv/install.sh | bash \
    \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    \
    && npx playwright install --with-deps
