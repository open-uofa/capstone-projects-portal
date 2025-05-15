FROM debian:bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    \
    && apt-get install -y \
    git \
    curl \
    python3 \
    python3-pip \
    \
    && curl -LsSf https://astral.sh/uv/install.sh | bash

ENV PATH="/root/.local/bin:${PATH}"

COPY pyproject.toml .
COPY uv.lock .
RUN uv sync

COPY backend/ ./backend

WORKDIR /app/backend

RUN --mount=type=secret,id=django-secret-key \
    uv run manage.py collectstatic --noinput

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
