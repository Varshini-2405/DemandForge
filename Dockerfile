# Render default: Dockerfile at repository root (dockerContext: .)
FROM python:3.12.11-slim-bookworm

WORKDIR /app/backend

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    ENVIRONMENT=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --upgrade pip wheel setuptools \
    && pip install -r requirements.txt

COPY backend/ .

# GitHub repo may not include data/; use committed models/demand_forecast_model.pkl
RUN if [ -f models/demand_forecast_model.pkl ]; then \
      echo "Using committed model"; \
    elif [ -f /app/data/processed/kirana_features.csv ]; then \
      python scripts/train_model.py; \
    else \
      echo "ERROR: No model and no training CSV" && exit 1; \
    fi

EXPOSE 8000

CMD gunicorn app.main:app \
    -k uvicorn.workers.UvicornWorker \
    -w 1 \
    -b 0.0.0.0:${PORT:-8000} \
    --timeout 120 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -
