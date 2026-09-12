"""FastAPI backend that exposes the E-Commerce Scraper as a REST API.

Scraping jobs are executed in background threads so the API stays
responsive, result artifacts (CSV/Excel) are served for download, and the
pre-built React frontend is served as static files when present.

Run locally:
    uvicorn api:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from jobs_store import (
    JobResponse,
    JobResult,
    JobStore,
    ScrapeRequest,
    get_job_store,
)
from scraper.logger import setup_logging
from scraper.pipeline import scrape_products

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serialize(product: Any) -> dict[str, Any]:
    """Convert a Product dataclass (or dict) into a JSON-safe dict."""
    if hasattr(product, "to_dict"):
        return _to_native(product.to_dict())
    if isinstance(product, dict):
        return _to_native(product)
    return _to_native(getattr(product, "__dict__", {}))


def _to_native(value: Any) -> Any:
    """Recursively convert numpy / Path / non-JSON types to native Python."""
    try:
        import numpy as np
    except Exception:  # pragma: no cover - numpy may be absent
        np = None

    if isinstance(value, dict):
        return {str(k): _to_native(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_to_native(v) for v in value]
    if np is not None:
        if isinstance(value, np.integer):
            return int(value)
        if isinstance(value, np.floating):
            return float(value)
        if isinstance(value, np.bool_):
            return bool(value)
    if isinstance(value, Path):
        return str(value)
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


# --------------------------------------------------------------------------- #
# Job manager
# --------------------------------------------------------------------------- #
class JobManager:
    """Accept scrape requests, run them in background threads, track state."""

    def __init__(self, store: JobStore, max_workers: int = 2) -> None:
        self._store = store
        self._executor = ThreadPoolExecutor(max_workers=max_workers)

    def create(self, request: ScrapeRequest) -> JobResponse:
        job_id = uuid4().hex[:12]
        job = JobResult(jobId=job_id, status="queued", createdAt=_now())
        self._store.create(job)
        self._executor.submit(self._run, job_id, request)
        return JobResponse(jobId=job_id, status="queued")

    def get(self, job_id: str) -> JobResult:
        job = self._store.get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    def list(self) -> list[JobResult]:
        return self._store.list()

    def _run(self, job_id: str, request: ScrapeRequest) -> None:
        self._store.update(job_id, status="running")
        try:
            result = scrape_products(
                urls=request.urls,
                product_query=request.productQuery,
                max_pages=request.maxPages,
                max_products=request.maxProducts,
                min_delay=request.minDelay,
                output_dir=str(OUTPUT_DIR / job_id),
                base_name="products",
                do_save=True,
                do_analyze=True,
                do_visualize=False,
            )
            products = [_serialize(p) for p in result.get("products", [])]
            stats = _to_native(result.get("stats", {}))
            failures = _to_native(result.get("failures", []))
            self._store.update(
                job_id,
                status="done",
                finishedAt=_now(),
                products=products,
                stats=stats,
                failures=failures,
                csvUrl=f"/api/download/{job_id}/csv",
                excelUrl=f"/api/download/{job_id}/xlsx",
            )
        except Exception as exc:  # noqa: BLE001 - surface any scrape error
            import traceback

            traceback.print_exc()
            self._store.update(
                job_id, status="failed", finishedAt=_now(), message=str(exc)
            )


_jobs = JobManager(get_job_store(), max_workers=int(os.getenv("SCRAPER_WORKERS", "2")))


# --------------------------------------------------------------------------- #
# App
# --------------------------------------------------------------------------- #
def _build_app() -> FastAPI:
    setup_logging()
    app = FastAPI(
        title="E-Commerce Scraper API",
        description="Backend powering the React scraper frontend.",
        version="0.1.0",
    )

    frontend_origins = os.getenv(
        "FRONTEND_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in frontend_origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


app = _build_app()


@app.get("/api/health", tags=["system"])
def health() -> dict[str, Any]:
    return {"status": "ok", "time": _now()}


@app.post("/api/scrape", response_model=JobResponse, status_code=202, tags=["scrape"])
def start_scrape(request: ScrapeRequest) -> JobResponse:
    return _jobs.create(request)


@app.get("/api/jobs", tags=["jobs"])
def list_jobs() -> list[JobResult]:
    return _jobs.list()


@app.get("/api/jobs/{job_id}", response_model=JobResult, tags=["jobs"])
def get_job(job_id: str) -> JobResult:
    return _jobs.get(job_id)


@app.get("/api/download/{job_id}/{fmt}", tags=["download"])
def download(job_id: str, fmt: str) -> FileResponse:
    if fmt not in ("csv", "xlsx"):
        raise HTTPException(status_code=400, detail="fmt must be 'csv' or 'xlsx'")
    job = _jobs.get(job_id)
    if job.status != "done":
        raise HTTPException(
            status_code=409, detail=f"Job is {job.status}; not ready"
        )
    file_path = (OUTPUT_DIR / job_id / f"products.{fmt}").resolve()
    try:
        file_path.relative_to(OUTPUT_DIR.resolve())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid path") from exc
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    media = (
        "text/csv"
        if fmt == "csv"
        else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    return FileResponse(file_path, media_type=media, filename=f"products.{fmt}")


# Serve the built React frontend as static files (single-container deploy).
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    async def _serve_index() -> FileResponse:
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def _serve_spa(full_path: str):
        if full_path.startswith(("api/", "assets/")):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        return FileResponse(FRONTEND_DIST / "index.html")
