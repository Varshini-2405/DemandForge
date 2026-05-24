# Render build fix (pydantic-core / Python 3.14)

## What went wrong
Render used **Python 3.14** and tried to **compile pydantic-core from Rust**, which fails on Render's read-only build FS.

Your log also showed **old** `requirements.txt` (`pydantic==2.6.4`, `pydantic-core==2.16.3`). Push the latest code from this repo.

## Fix applied
1. `backend/runtime.txt` → `python-3.12.11`
2. `backend/.python-version` → `3.12.11`
3. `PYTHON_VERSION=3.12.11` in `render.yaml`
4. `requirements.txt` — no separate `pydantic-core` pin; uses wheels via `pydantic==2.10.4`
5. `render-build.sh` — fails fast if Python ≠ 3.12

## Render dashboard (if not using Blueprint)
| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Python Version | **3.12.11** |
| Build Command | `bash render-build.sh` |
| Start Command | `gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 1 -b 0.0.0.0:$PORT --timeout 120` |

## After pushing to GitHub
1. Render → Manual Deploy → Clear build cache & deploy
2. Confirm build log shows `Python 3.12.11`, not 3.14
