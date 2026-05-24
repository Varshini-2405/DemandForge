import datetime
from datetime import timedelta
import pandas as pd
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from app.database import get_db
from app.models.user import User
from app.models.prediction import Prediction, StoreMaster, CategoryMaster, ProductMaster, HistoricalSale
from app.schemas.prediction import PredictionCreate, PredictionResponse
from app.schemas.forecast import ForecastResult, AIInsights
from app.utils.auth import SECRET_KEY, ALGORITHM, get_password_hash
from app.paths import data_file
import logging

logger = logging.getLogger("KiranaIQ-Predictions")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

FEATURE_COLUMNS = [
    "store_id",
    "product_id",
    "category_id",
    "price",
    "base_price",
    "stock_available",
    "is_weekend",
    "is_festival_near",
    "month",
    "year",
    "day",
    "week",
    "quarter",
    "price_difference",
    "discount_percent",
    "lag_1_units_sold",
    "lag_7_units_sold",
    "rolling_7_day_avg",
    "rolling_14_day_avg",
    "stock_risk",
]

def run_db_migrations(engine):
    """
    Ensures that newly added columns exist in the predictions table.
    """
    inspector = inspect(engine)
    if 'predictions' in inspector.get_table_names():
        columns = [c['name'] for c in inspector.get_columns('predictions')]
        with engine.begin() as conn:
            if 'store_id' not in columns:
                conn.execute(text("ALTER TABLE predictions ADD COLUMN store_id INTEGER"))
            if 'category_id' not in columns:
                conn.execute(text("ALTER TABLE predictions ADD COLUMN category_id INTEGER"))
            if 'is_weekend' not in columns:
                conn.execute(text("ALTER TABLE predictions ADD COLUMN is_weekend INTEGER"))
            if 'is_festival_near' not in columns:
                conn.execute(text("ALTER TABLE predictions ADD COLUMN is_festival_near INTEGER"))
            if 'forecast_date' not in columns:
                conn.execute(text("ALTER TABLE predictions ADD COLUMN forecast_date TEXT"))

def _seed_from_csv(db: Session, path: Path, label: str) -> bool:
    if not path.exists():
        logger.warning("Seed file missing (%s): %s", label, path)
        return False
    return True


def seed_db_data(db: Session):
    """Seed catalog and historical sales from CSV files (monorepo ../data on Render)."""
    raw = data_file("raw", "KiranaIQ_All_5_Stores_Dataset")
    processed = data_file("processed", "kirana_features.csv")

    if db.query(StoreMaster).count() == 0:
        store_csv = raw / "store_master.csv"
        if _seed_from_csv(db, store_csv, "stores"):
            for _, row in pd.read_csv(store_csv).iterrows():
                db.add(
                    StoreMaster(
                        store_id=int(row["store_id"]),
                        store_name=row["store_name"],
                        location=row["location"] if pd.notna(row["location"]) else None,
                        store_type=row["store_type"] if pd.notna(row["store_type"]) else None,
                    )
                )
            db.commit()
            logger.info("Seeded stores")

    if db.query(CategoryMaster).count() == 0:
        cat_csv = raw / "category_master.csv"
        if _seed_from_csv(db, cat_csv, "categories"):
            for _, row in pd.read_csv(cat_csv).iterrows():
                db.add(
                    CategoryMaster(
                        category_id=int(row["category_id"]),
                        category_name=row["category_name"],
                    )
                )
            db.commit()
            logger.info("Seeded categories")

    if db.query(ProductMaster).count() == 0:
        prod_csv = raw / "product_master.csv"
        if _seed_from_csv(db, prod_csv, "products"):
            for _, row in pd.read_csv(prod_csv).iterrows():
                db.add(
                    ProductMaster(
                        product_id=int(row["product_id"]),
                        product_name=row["product_name"],
                        category_id=int(row["category_id"]),
                        category_name=row["category_name"],
                        base_price=float(row["base_price"]),
                        unit=row["unit"] if pd.notna(row["unit"]) else None,
                    )
                )
            db.commit()
            logger.info("Seeded products")

    if db.query(HistoricalSale).count() == 0:
        if _seed_from_csv(db, processed, "historical sales"):
            df = pd.read_csv(processed).head(2000)
            records = [
                HistoricalSale(
                    date=row["date"],
                    store_id=int(row["store_id"]),
                    product_id=int(row["product_id"]),
                    category_id=int(row["category_id"]),
                    price=float(row["price"]),
                    base_price=float(row["base_price"]),
                    units_sold=float(row["units_sold"]),
                    stock_available=int(row["stock_available"])
                    if pd.notna(row["stock_available"])
                    else 0,
                    is_weekend=int(row["is_weekend"]) if pd.notna(row["is_weekend"]) else 0,
                    is_festival_near=int(row["is_festival_near"])
                    if pd.notna(row["is_festival_near"])
                    else 0,
                )
                for _, row in df.iterrows()
            ]
            db.bulk_save_objects(records)
            db.commit()
            logger.info("Seeded %s historical sales rows", len(records))


def calculate_historical_features(db: Session, store_id: int, product_id: int, category_id: int, forecast_date_str: str):
    """
    Computes lag and rolling average features from DB historical sales and prediction history.
    """
    try:
        forecast_date = datetime.datetime.strptime(forecast_date_str, "%Y-%m-%d").date()
    except Exception:
        forecast_date = datetime.date.today()

    # Fetch sales history
    sales = db.query(HistoricalSale).filter(
        HistoricalSale.store_id == store_id,
        HistoricalSale.product_id == product_id
    ).all()

    # Fetch predictions history
    preds = db.query(Prediction).filter(
        Prediction.store_id == store_id,
        Prediction.product_id == product_id
    ).all()

    # Combine records
    history = {}
    for s in sales:
        try:
            dt = datetime.datetime.strptime(s.date, "%Y-%m-%d").date()
            history[dt] = s.units_sold
        except Exception:
            continue

    for p in preds:
        if p.forecast_date:
            try:
                dt = datetime.datetime.strptime(p.forecast_date, "%Y-%m-%d").date()
                history[dt] = p.predicted_demand
            except Exception:
                continue
        else:
            dt = p.created_at.date()
            history[dt] = p.predicted_demand

    if not history:
        # Fallback to product-level average sales across other stores
        other_sales = db.query(HistoricalSale).filter(HistoricalSale.product_id == product_id).all()
        if other_sales:
            avg_val = sum(s.units_sold for s in other_sales) / len(other_sales)
        else:
            cat_sales = db.query(HistoricalSale).filter(HistoricalSale.category_id == category_id).all()
            if cat_sales:
                avg_val = sum(s.units_sold for s in cat_sales) / len(cat_sales)
            else:
                avg_val = 15.0
        return avg_val, avg_val, avg_val, avg_val

    sorted_dates = sorted(history.keys())
    max_date = sorted_dates[-1]

    # Reference date logic for simulation: shift timeline if forecasting far in future
    if (forecast_date - max_date).days > 1:
        ref_date = max_date + timedelta(days=1)
    else:
        ref_date = forecast_date

    def get_val_at(dt):
        if dt in history:
            return history[dt]
        before_dates = [d for d in sorted_dates if d <= dt]
        if before_dates:
            return history[before_dates[-1]]
        return None

    # Compute lags
    lag_1 = get_val_at(ref_date - timedelta(days=1))
    lag_7 = get_val_at(ref_date - timedelta(days=7))

    # Compute rolling 7-day average
    r7_vals = []
    for i in range(1, 8):
        v = history.get(ref_date - timedelta(days=i))
        if v is not None:
            r7_vals.append(v)
    if r7_vals:
        rolling_7 = sum(r7_vals) / len(r7_vals)
    else:
        rolling_7 = lag_1 if lag_1 is not None else 15.0

    # Compute rolling 14-day average
    r14_vals = []
    for i in range(1, 15):
        v = history.get(ref_date - timedelta(days=i))
        if v is not None:
            r14_vals.append(v)
    if r14_vals:
        rolling_14 = sum(r14_vals) / len(r14_vals)
    else:
        rolling_14 = rolling_7

    if lag_1 is None:
        lag_1 = rolling_7
    if lag_7 is None:
        lag_7 = rolling_14

    return lag_1, lag_7, rolling_7, rolling_14


def get_guest_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "guest").first()
    if not user:
        user = User(
            username="guest",
            email="guest@kiranaiq.local",
            hashed_password=get_password_hash("guest"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def resolve_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if username:
                user = db.query(User).filter(User.username == username).first()
                if user:
                    return user
        except JWTError:
            pass
    return get_guest_user(db)


def run_prediction(data: PredictionCreate, request: Request, db: Session, user: User) -> ForecastResult:
    # 1. Resolve date and time elements
    if data.forecast_date:
        try:
            f_date = datetime.datetime.strptime(data.forecast_date, "%Y-%m-%d").date()
        except Exception:
            f_date = datetime.date.today()
    else:
        f_date = datetime.date.today()
    
    f_date_str = f_date.strftime("%Y-%m-%d")
    year = f_date.year
    month = f_date.month
    day = f_date.day
    week = f_date.isocalendar()[1]
    quarter = (f_date.month - 1) // 3 + 1

    # 2. Resolve product category ID
    if data.category_id is None:
        prod = db.query(ProductMaster).filter(ProductMaster.product_id == data.product_id).first()
        category_id = prod.category_id if prod else 1
    else:
        category_id = data.category_id

    # 3. Resolve price difference and discount percent
    price_difference = round(data.base_price - data.price, 2)
    discount_percent = round((price_difference / data.base_price) * 100, 2) if data.base_price > 0 else 0.0

    # 4. Automatically compute lag and rolling averages
    lag_1, lag_7, rolling_7, rolling_14 = calculate_historical_features(
        db, data.store_id, data.product_id, category_id, f_date_str
    )

    # 5. Automatically compute stock risk
    stock_risk = 1 if data.stock_available < rolling_7 or data.stock_available < 15 else 0

    # 6. Build model feature mapping in exact required order
    input_dict = {
        "store_id": data.store_id,
        "product_id": data.product_id,
        "category_id": category_id,
        "price": data.price,
        "base_price": data.base_price,
        "stock_available": data.stock_available,
        "is_weekend": data.is_weekend,
        "is_festival_near": data.is_festival_near,
        "month": month,
        "year": year,
        "day": day,
        "week": week,
        "quarter": quarter,
        "price_difference": price_difference,
        "discount_percent": discount_percent,
        "lag_1_units_sold": lag_1,
        "lag_7_units_sold": lag_7,
        "rolling_7_day_avg": rolling_7,
        "rolling_14_day_avg": rolling_14,
        "stock_risk": stock_risk,
    }
    
    df = pd.DataFrame([input_dict])[FEATURE_COLUMNS]

    model = getattr(request.app.state, "model", None)
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Forecasting model is not loaded. Run scripts/train_model.py first.",
        )

    prediction = model.predict(df)
    predicted_units = round(float(prediction[0]), 2)

    db_prediction = Prediction(
        user_id=user.id,
        store_id=data.store_id,
        product_id=data.product_id,
        category_id=category_id,
        predicted_demand=predicted_units,
        festival_type=data.festival_type,
        price=data.price,
        discount_percent=discount_percent,
        stock_available=data.stock_available,
        is_weekend=data.is_weekend,
        is_festival_near=data.is_festival_near,
        forecast_date=f_date_str,
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    sales_count = db.query(HistoricalSale).filter(
        HistoricalSale.store_id == data.store_id,
        HistoricalSale.product_id == data.product_id,
    ).count()
    preds_count = db.query(Prediction).filter(
        Prediction.store_id == data.store_id,
        Prediction.product_id == data.product_id,
    ).count()

    trend = "stable"
    if lag_1 and rolling_7:
        if lag_1 > rolling_7 * 1.08:
            trend = "up"
        elif lag_1 < rolling_7 * 0.92:
            trend = "down"

    store = db.query(StoreMaster).filter(StoreMaster.store_id == data.store_id).first()
    product = db.query(ProductMaster).filter(ProductMaster.product_id == data.product_id).first()

    insights = AIInsights(
        yesterday_sales=round(lag_1, 1),
        last_week_sales=round(lag_7, 1),
        weekly_avg_demand=round(rolling_7, 1),
        fortnight_avg_demand=round(rolling_14, 1),
        discount_percent=discount_percent,
        stock_risk_level="High" if stock_risk else "Low",
        trend_direction=trend,
        data_points_used=sales_count + preds_count,
    )

    return ForecastResult(
        prediction=db_prediction,
        insights=insights,
        product_name=product.product_name if product else None,
        store_name=store.store_name if store else None,
        category_name=product.category_name if product else None,
    )


@router.post("/", response_model=ForecastResult)
def predict_and_save(
    data: PredictionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(resolve_user),
):
    try:
        return run_prediction(data, request, db, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to generate prediction: {str(e)}"
        )


@router.get("/history", response_model=list[PredictionResponse])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(resolve_user),
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return predictions


@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(ProductMaster).all()
    if not products:
        return [
            {"product_id": 1, "product_name": "Toor Dal", "category_id": 1, "category_name": "Staples", "base_price": 140.0, "unit": "1kg"},
            {"product_id": 2, "product_name": "Rice", "category_id": 1, "category_name": "Staples", "base_price": 320.0, "unit": "5kg"},
        ]
    return products


@router.get("/stores")
def get_stores(db: Session = Depends(get_db)):
    stores = db.query(StoreMaster).all()
    if not stores:
        return [
            {"store_id": 1, "store_name": "Rajaji Nagar Kirana", "location": "Bengaluru", "store_type": "Residential"},
            {"store_id": 2, "store_name": "Indiranagar Fresh Mart", "location": "Bengaluru", "store_type": "Premium Area"},
        ]
    return stores
