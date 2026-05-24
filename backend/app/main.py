import os
import logging
import joblib
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

load_dotenv()

from app.database import engine, Base, get_db
from app.routes import auth, predictions
from app.routes.predictions import predict_and_save
from app.schemas.forecast import ForecastResult

# Create DB Tables
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KiranaIQ-Backend-Phase6")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "demand_forecast_model.pkl")

from app.routes.predictions import run_db_migrations, seed_db_data
from app.database import SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Running DB migrations...")
    try:
        run_db_migrations(engine)
        logger.info("Migrations completed successfully.")
    except Exception as e:
        logger.error(f"DB migrations failed: {str(e)}")

    logger.info("Checking and seeding database tables...")
    try:
        db = SessionLocal()
        seed_db_data(db)
        db.close()
        logger.info("Seeding checked/completed successfully.")
    except Exception as e:
        logger.error(f"DB seeding failed: {str(e)}")

    logger.info(f"Loading trained Random Forest model from {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        logger.error(f"Model file not found: {MODEL_PATH}")
    else:
        try:
            app.state.model = joblib.load(MODEL_PATH)
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load the model: {str(e)}")
    yield
    logger.info("Shutting down FastAPI application...")


app = FastAPI(
    title="KiranaIQ Demand Forecasting SaaS API",
    description="Enterprise API with DB and JWT Auth",
    version="2.0.0",
    lifespan=lifespan
)

_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:4173,http://127.0.0.1:4173,"
    "http://localhost:3000,http://127.0.0.1:3000"
)
_cors_raw = os.getenv("CORS_ORIGINS", _default_origins)
_cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.(vercel\.app|trycloudflare\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])

# Primary ML endpoint used by the React frontend
app.add_api_route(
    "/predict",
    predict_and_save,
    methods=["POST"],
    response_model=ForecastResult,
    tags=["Predictions"],
)

@app.get("/", status_code=status.HTTP_200_OK)
def read_root(db: Session = Depends(get_db)):
    """
    Advanced Health Check
    """
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
    }
