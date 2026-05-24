# KiranaIQ Deployment Guide

## 1. Backend on Render

1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com), **New → Blueprint** and select `render.yaml`.
3. Set environment variables:
   - `DATABASE_URL` — PostgreSQL connection string (Render PostgreSQL free tier)
   - `CORS_ORIGINS` — your Vercel URL, e.g. `https://kiranaiq.vercel.app`
   - `SECRET_KEY` — long random string (Render can auto-generate)
   - `ENVIRONMENT` — `production`
4. Deploy. Note the API URL, e.g. `https://kiranaiq-api.onrender.com`.

The build runs `python scripts/train_model.py` automatically.

## 2. Frontend on Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. **Root Directory:** `frontend`
3. **Environment variable:** `VITE_API_URL` = your Render API URL
4. Deploy.

## 3. Local production test

```powershell
# Backend
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000

# Frontend (new terminal)
cd frontend
$env:VITE_API_URL="http://127.0.0.1:8000"
npm run dev
```

## 4. One-command local start (Windows)

```powershell
.\scripts\start-local.ps1
```
