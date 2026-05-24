# DemandForge_ (KiranaIQ)

AI-powered retail demand forecasting SaaS — React + FastAPI + scikit-learn.

**GitHub repository name:** `DemandForge_`

## Quick start (local)

### Backend (Python 3.12)

```bash
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python scripts/train_model.py
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Set VITE_API_URL in .env (default http://127.0.0.1:8000)
npm run dev
```

Open http://localhost:5173 — run forecasts on **Forecast** (no sign-in required).

## Deploy

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | [Vercel](https://vercel.com) | Root: `frontend`, env `VITE_API_URL` = your API URL |
| Backend | [Render](https://render.com) | Use `render.yaml`, set `DATABASE_URL` (PostgreSQL) and `CORS_ORIGINS` |

**Render env vars:** `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS` (your Vercel URL), `ENVIRONMENT=production`

**Vercel env:** `VITE_API_URL=https://your-api.onrender.com`

## ML features (exact order)

`store_id`, `product_id`, `category_id`, `price`, `base_price`, `stock_available`, `is_weekend`, `is_festival_near`, `month`, `year`, `day`, `week`, `quarter`, `price_difference`, `discount_percent`, `lag_1_units_sold`, `lag_7_units_sold`, `rolling_7_day_avg`, `rolling_14_day_avg`, `stock_risk`
