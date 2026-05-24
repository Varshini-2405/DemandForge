from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionCreate(BaseModel):
    """Business-facing inputs only. ML features are computed server-side."""

    store_id: int
    product_id: int
    price: float
    base_price: float
    stock_available: int
    is_weekend: int = 0
    is_festival_near: int = 0
    festival_type: Optional[str] = "None"
    forecast_date: Optional[str] = None
    category_id: Optional[int] = None

    # Internal ML fields — not required from clients
    month: Optional[int] = None
    year: Optional[int] = None
    day: Optional[int] = None
    week: Optional[int] = None
    quarter: Optional[int] = None
    price_difference: Optional[float] = None
    discount_percent: Optional[float] = None
    lag_1_units_sold: Optional[float] = None
    lag_7_units_sold: Optional[float] = None
    rolling_7_day_avg: Optional[float] = None
    rolling_14_day_avg: Optional[float] = None
    stock_risk: Optional[int] = None

class PredictionSave(BaseModel):
    store_id: Optional[int] = None
    product_id: int
    predicted_demand: float
    baseline_demand: Optional[float] = None
    festival_type: Optional[str] = 'None'
    latency_ms: Optional[int] = None
    price: Optional[float] = None
    discount_percent: Optional[float] = None
    stock_available: Optional[int] = None
    forecast_date: Optional[str] = None

class PredictionResponse(PredictionSave):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

