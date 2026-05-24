from pydantic import BaseModel
from typing import Optional
from app.schemas.prediction import PredictionResponse


class AIInsights(BaseModel):
    yesterday_sales: float
    last_week_sales: float
    weekly_avg_demand: float
    fortnight_avg_demand: float
    discount_percent: float
    stock_risk_level: str
    trend_direction: str
    data_points_used: int


class ForecastResult(BaseModel):
    prediction: PredictionResponse
    insights: AIInsights
    product_name: Optional[str] = None
    store_name: Optional[str] = None
    category_name: Optional[str] = None
