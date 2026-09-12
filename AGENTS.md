# AGENTS.md — commands to know for this repo

## Backend (FastAPI)
- Install deps: `pip install -r requirements.txt`
- Run API (dev): `uvicorn api:app --reload --host 0.0.0.0 --port 8000`
- Run API (prod): `uvicorn api:app --host 0.0.0.0 --port 8000 --workers 1`
  - The default in-memory job store is single-process. To run multiple
    uvicorn workers, set `REDIS_URL=redis://redis:6379/0` and add Redis.
- Type check backend: `python -m py_compile api.py && python -c "import api"`
- Test health: `curl http://localhost:8000/api/health`

## Frontend (React + Vite)
- Install: `npm --prefix frontend install`
- Dev server: `npm --prefix frontend run dev`
- Lint: `npm --prefix frontend run lint`
- Type check: `npm --prefix frontend run typecheck`
- Build: `npm --prefix frontend run build`

## Streamlit (legacy UI — kept for reference)
- Run: `streamlit run app.py`

## Docker (deployment)
- Build single image: `docker build -t scraper-app .`
- Run: `docker run -p 8000:8000 scraper-app`
- Compose (production, single container): `docker compose --profile production up --build`
- Compose (frontend dev split): `docker compose --profile frontend-dev up --build`
