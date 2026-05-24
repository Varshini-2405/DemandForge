# Pin Python 3.12 — Render native runtime ignores runtime.txt and defaults to 3.14
FROM python:3.12.11-slim-bookworm

WORKDIR /app/backend

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    ENVIRONMENT=production

# PostgreSQL client library for psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --upgrade pip wheel setuptools \
    && pip install -r requirements.txt

COPY backend/ .
# Training data lives at repo root (../data from backend/)
COPY data/ /app/data/

RUN python scripts/train_model.py

EXPOSE 8000

CMD gunicorn app.main:app \
    -k uvicorn.workers.UvicornWorker \
    -w 1 \
    -b 0.0.0.0:${PORT:-8000} \
    --timeout 120 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -
