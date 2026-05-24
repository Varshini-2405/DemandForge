import logging
import os
from contextlib import asynccontextmanager

import joblib
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

load_dotenv()

from app.database import Base, engine, get_db
from app.paths import MODEL_PATH
from app.routes import auth, predictions
from app.routes.predictions import predict_and_save, run_db_migrations, seed_db_data
from app.database import SessionLocal
from app.schemas.forecast import ForecastResult

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KiranaIQ-API")

IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"


def _ensure_model_file() -> None:
    """Train model during build; re-train at startup if artifact missing."""
    if MODEL_PATH.exists():
        return
    logger.warning("Model file missing — running train_model.py ...")
    try:
        import subprocess
        import sys
        from app.paths import BACKEND_DIR

        subprocess.run(
            [sys.executable, str(BACKEND_DIR / "scripts" / "train_model.py")],
            cwd=str(BACKEND_DIR),
            check=True,
            timeout=300,
        )
    except Exception as exc:
        logger.error("Could not auto-train model: %s", exc)


def _load_model(app: FastAPI) -> None:
    if not MODEL_PATH.exists():
        logger.error("Model file not found at %s", MODEL_PATH)
        return
    try:
        app.state.model = joblib.load(MODEL_PATH)
        logger.info("Model loaded from %s", MODEL_PATH)
    except Exception as exc:
        logger.error("Failed to load model: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting KiranaIQ API (production=%s)", IS_PRODUCTION)

    try:
        Base.metadata.create_all(bind=engine)
        run_db_migrations(engine)
    except Exception as exc:
        logger.error("Database init failed: %s", exc)

    try:
        db = SessionLocal()
        seed_db_data(db)
        db.close()
        logger.info("Database seed complete.")
    except Exception as exc:
        logger.error("Database seed failed: %s", exc)

    _ensure_model_file()
    _load_model(app)

    yield
    logger.info("Shutting down KiranaIQ API.")


app = FastAPI(
    title="KiranaIQ Demand Forecasting API",
    description="Retail demand forecasting SaaS API",
    version="2.1.0",
    lifespan=lifespan,
)

_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:4173,http://127.0.0.1:4173"
)
_cors_raw = os.getenv("CORS_ORIGINS", _default_origins)
_cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip() and "*" not in o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=(
        r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
        r"|^https://[a-z0-9-]+\.vercel\.app$"
        r"|^https://[a-z0-9-]+\.onrender\.com$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])

app.add_api_route(
    "/predict",
    predict_and_save,
    methods=["POST"],
    response_model=ForecastResult,
    tags=["Predictions"],
)


@app.get("/", status_code=status.HTTP_200_OK)
def read_root(db: Session = Depends(get_db)):
    db_status = "offline"
    try:
        db.execute(text("SELECT 1"))
        db_status = "online"
    except Exception:
        db_status = "offline"

    model_loaded = hasattr(app.state, "model") and app.state.model is not None

    return {
        "status": "healthy" if db_status == "online" and model_loaded else "degraded",
        "database": db_status,
        "model_loaded": model_loaded,
        "project": "KiranaIQ SaaS",
        "loaded_model": "demand_forecast_model.pkl" if model_loaded else None,
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


@app.get("/health", status_code=status.HTTP_200_OK)
def health_probe(db: Session = Depends(get_db)):
    """Probe for Render + frontend warm-up (always 200 when process is up)."""
    db_status = "offline"
    try:
        db.execute(text("SELECT 1"))
        db_status = "online"
    except Exception:
        db_status = "offline"

    model_loaded = hasattr(app.state, "model") and app.state.model is not None
    ready = model_loaded

    return {
        "status": "ok",
        "ready": ready,
        "model_loaded": model_loaded,
        "database": db_status,
        "environment": os.getenv("ENVIRONMENT", "development"),
    }
