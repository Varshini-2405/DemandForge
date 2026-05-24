"""
Train RandomForest demand model with the exact API feature schema.
Run from backend/: py -3.12 scripts/train_model.py
"""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

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

import sys

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.paths import MODEL_PATH, data_file

DATA_PATH = data_file("processed", "kirana_features.csv")


def load_training_frame() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df = df.rename(
        columns={
            "price_discount": "price_difference",
            "discount_percentage": "discount_percent",
            "lag1_units_sold": "lag_1_units_sold",
        }
    )
    return df


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Training data not found: {DATA_PATH}. "
            "Ensure repo data/ folder is present (../data from backend on Render)."
        )
    df = load_training_frame()
    X = df[FEATURE_COLUMNS]
    y = df["units_sold"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=18,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"Test MAE: {mae:.2f}")
    print(f"Test R2:  {r2:.4f}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
