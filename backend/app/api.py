import os
import logging
from contextlib import asynccontextmanager
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KiranaIQ-Backend")

# Dynamic path resolution to ensure the model file is found regardless of where the server is run
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "demand_forecast_model.pkl")

# Exact features and order required by the public API
API_FEATURES_ORDER = [
    'store_id',
    'product_id',
    'category_id',
    'price',
    'base_price',
    'stock_available',
    'is_weekend',
    'is_festival_near',
    'month',
    'year',
    'day',
    'week',
    'quarter',
    'price_difference',
    'discount_percent',
    'lag_1_units_sold',
    'lag_7_units_sold',
    'rolling_7_day_avg',
    'rolling_14_day_avg',
    'stock_risk'
]

# Exact features and order expected by the pre-trained Random Forest model
MODEL_FEATURES_ORDER = [
    'store_id',
    'product_id',
    'category_id',
    'price',
    'base_price',
    'stock_available',
    'is_weekend',
    'is_festival_near',
    'month',
    'year',
    'day',
    'week',
    'quarter',
    'price_discount',       # Mapped from price_difference
    'discount_percentage',   # Mapped from discount_percent
    'lag1_units_sold',       # Mapped from lag_1_units_sold
    'lag_7_units_sold',
    'rolling_7_day_avg',
    'rolling_14_day_avg',
    'stock_risk'
]

# Pydantic BaseModel for Input Validation (using exact user-requested schema)
class PredictionInput(BaseModel):
    store_id: int = Field(..., description="Unique identifier for the store", examples=[1])
    product_id: int = Field(..., description="Unique identifier for the product", examples=[101])
    category_id: int = Field(..., description="Unique identifier for the category", examples=[5])
    price: float = Field(..., description="Current selling price of the item", examples=[45.0])
    base_price: float = Field(..., description="Original base price of the item", examples=[50.0])
    stock_available: int = Field(..., description="Current available stock units", examples=[120])
    is_weekend: int = Field(..., description="Indicator if the day is a weekend (1: Yes, 0: No)", examples=[0])
    is_festival_near: int = Field(..., description="Indicator if a festival is near (1: Yes, 0: No)", examples=[0])
    month: int = Field(..., description="Month of the year (1 to 12)", examples=[5])
    year: int = Field(..., description="Year (e.g. 2026)", examples=[2026])
    day: int = Field(..., description="Day of the month (1 to 31)", examples=[23])
    week: int = Field(..., description="Week number of the year (1 to 53)", examples=[21])
    quarter: int = Field(..., description="Quarter of the year (1 to 4)", examples=[2])
    price_difference: float = Field(..., description="Difference between base price and actual price", examples=[5.0])
    discount_percent: float = Field(..., description="Percentage discount offered", examples=[10.0])
    lag_1_units_sold: float = Field(..., description="Units sold on the previous day (t-1)", examples=[35.0])
    lag_7_units_sold: float = Field(..., description="Units sold 7 days ago (t-7)", examples=[38.0])
    rolling_7_day_avg: float = Field(..., description="7-day rolling average of units sold", examples=[36.2])
    rolling_14_day_avg: float = Field(..., description="14-day rolling average of units sold", examples=[35.8])
    stock_risk: int = Field(..., description="Indicator representing stockout risk level (1: Yes, 0: No)", examples=[0])

# Modern lifespan context manager to handle startup and shutdown tasks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the Random Forest model
    logger.info(f"Loading trained Random Forest model from {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        logger.error(f"Model file not found at path: {MODEL_PATH}")
        raise FileNotFoundError(f"Model file not found at path: {MODEL_PATH}")
    
    try:
        app.state.model = joblib.load(MODEL_PATH)
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load the model: {str(e)}")
        raise e
        
    yield
    # Shutdown: Clean up resources if any
    logger.info("Shutting down FastAPI application...")

# Initialize the FastAPI App
app = FastAPI(
    title="KiranaIQ Demand Forecasting API",
    description="Production-style FastAPI backend providing retail demand forecasting predictions using Random Forest.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local portfolio testing. Lock down to specific URLs in production.
    allow_credentials=True,
    allow_methods=["*"],  # Allows all standard methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all standard headers
)

# Root endpoint for health checking
@app.get("/", status_code=status.HTTP_200_OK)
def read_root():
    """
    Health check and basic API metadata endpoint.
    """
    return {
        "status": "healthy",
        "project": "KiranaIQ",
        "description": "Retail demand forecasting service",
        "loaded_model": "Random Forest Regressor (demand_forecast_model.pkl)",
        "features_expected": len(API_FEATURES_ORDER)
    }

# Prediction endpoint
@app.post("/predict", status_code=status.HTTP_200_OK)
def predict(data: PredictionInput):
    """
    Predict the units sold for a product based on inputs.
    
    - Accepts JSON payload matching PredictionInput (validated by Pydantic)
    - Converts payload to pandas DataFrame preserving exact feature order
    - Maps field names to match the trained Random Forest model expectations:
      * price_difference -> price_discount
      * discount_percent -> discount_percentage
      * lag_1_units_sold -> lag1_units_sold
    - Runs model.predict()
    - Returns predicted units sold as JSON rounded to 2 decimal places
    """
    try:
        # 1. Convert Pydantic model to dictionary using model_dump() (Pydantic v2 practice)
        input_dict = data.model_dump()
        
        # 2. Convert dictionary to Pandas DataFrame preserving exact API features order
        df = pd.DataFrame([input_dict])[API_FEATURES_ORDER]
        
        # 3. Map user-facing API features to the model's exact fit-time features
        column_mapping = {
            'price_difference': 'price_discount',
            'discount_percent': 'discount_percentage',
            'lag_1_units_sold': 'lag1_units_sold'
        }
        df = df.rename(columns=column_mapping)
        
        # 4. Re-order columns to match the trained model's fit-time ordering exactly
        df = df[MODEL_FEATURES_ORDER]
        
        # 5. Run prediction
        model = app.state.model
        prediction = model.predict(df)
        
        # Extract the scalar prediction (a float)
        predicted_units = float(prediction[0])
        
        # 6. Return predicted_units_sold as JSON
        return {
            "predicted_units_sold": round(predicted_units, 2)
        }
        
    except AttributeError as ae:
        logger.error(f"Model is not loaded or is misconfigured: {str(ae)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Forecasting model is currently unavailable or misconfigured."
        )
    except Exception as e:
        logger.error(f"Prediction error occurred: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate prediction: {str(e)}"
        )
