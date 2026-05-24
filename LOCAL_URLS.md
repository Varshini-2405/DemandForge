# KiranaIQ — Active Local URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://127.0.0.1:8000 |
| **API Docs** | http://127.0.0.1:8000/docs |
| **Health** | http://127.0.0.1:8000/ |

## Start commands

**Backend** (from `backend/`):
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend** (from `frontend/`):
```powershell
npm run dev
```

Or run: `.\scripts\start-local.ps1`
