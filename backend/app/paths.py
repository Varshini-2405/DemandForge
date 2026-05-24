"""Resolve project paths for local dev and Render (rootDir=backend)."""
from pathlib import Path

# backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent
# repo root (parent of backend/) when monorepo is cloned
REPO_ROOT = BACKEND_DIR.parent
MODELS_DIR = BACKEND_DIR / "models"
MODEL_PATH = MODELS_DIR / "demand_forecast_model.pkl"


def get_data_root() -> Path:
    """Find data/ whether running from repo root or backend-only layout."""
    candidates = [
        BACKEND_DIR / "data",
        REPO_ROOT / "data",
    ]
    for root in candidates:
        if (root / "processed" / "kirana_features.csv").exists():
            return root
    return REPO_ROOT / "data"


def data_file(*parts: str) -> Path:
    return get_data_root().joinpath(*parts)
