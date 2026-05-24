from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class StoreMaster(Base):
    __tablename__ = "store_master"

    store_id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(100), nullable=False)
    location = Column(String(50), nullable=True)
    store_type = Column(String(50), nullable=True)

class CategoryMaster(Base):
    __tablename__ = "category_master"

    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), nullable=False)

class ProductMaster(Base):
    __tablename__ = "product_master"

    product_id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("category_master.category_id"), nullable=True)
    category_name = Column(String(50), nullable=True)
    base_price = Column(Float, nullable=False)
    unit = Column(String(20), nullable=True)

class HistoricalSale(Base):
    __tablename__ = "historical_sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    store_id = Column(Integer, ForeignKey("store_master.store_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    category_id = Column(Integer, nullable=True)
    price = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    units_sold = Column(Float, nullable=False)
    stock_available = Column(Integer, nullable=True)
    is_weekend = Column(Integer, nullable=True)
    is_festival_near = Column(Integer, nullable=True)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, index=True, nullable=False)
    predicted_demand = Column(Float, nullable=False)
    baseline_demand = Column(Float, nullable=True)
    festival_type = Column(String, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    
    # Input Features stored as individual columns
    price = Column(Float, nullable=True)
    discount_percent = Column(Float, nullable=True)
    stock_available = Column(Integer, nullable=True)
    
    # New features required to act as previous prediction history and simplify flow
    store_id = Column(Integer, nullable=True)
    category_id = Column(Integer, nullable=True)
    is_weekend = Column(Integer, nullable=True)
    is_festival_near = Column(Integer, nullable=True)
    forecast_date = Column(String(10), nullable=True)  # YYYY-MM-DD
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # user = relationship("User", back_populates="predictions")

