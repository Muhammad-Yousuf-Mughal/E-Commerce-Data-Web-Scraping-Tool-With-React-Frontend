"""Pluggable, process-safe job store for scrape jobs.

In-memory storage is used by default (single-process deployment). Set the
``REDIS_URL`` environment variable (e.g. ``redis://redis:6379/0``) to share
job state across multiple uvicorn workers / replicas.
"""

from __future__ import annotations

import json
import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol

from fastapi import HTTPException
from pydantic import BaseModel, Field

# --------------------------------------------------------------------------- #
# Shared state & models (kept here so the store can (de)serialise jobs)
# --------------------------------------------------------------------------- #
REDIS_AVAILABLE = False
try:  # pragma: no cover - exercised only when redis is installed
    import redis as redis_lib  # type: ignore

    REDIS_AVAILABLE = True
except Exception:  # pragma: no cover
    redis_lib = None  # type: ignore


class ScrapeRequest(BaseModel):
    urls: list[str] = Field(..., min_length=1)
    productQuery: str = ""
    maxPages: int = Field(default=5, ge=1, le=20)
    maxProducts: int | None = Field(default=None, ge=1, le=500)
    minDelay: float = Field(default=1.0, ge=0.0, le=10.0)


class JobResponse(BaseModel):
    jobId: str
    status: str
    message: str | None = None


class JobResult(BaseModel):
    jobId: str
    status: str
    createdAt: str
    finishedAt: str | None = None
    message: str | None = None
    products: list[dict[str, Any]] = Field(default_factory=list)
    stats: dict[str, Any] = Field(default_factory=dict)
    failures: list[dict[str, Any]] = Field(default_factory=list)
    csvUrl: str | None = None
    excelUrl: str | None = None


# --------------------------------------------------------------------------- #
# Stores
# --------------------------------------------------------------------------- #
class JobStore(Protocol):
    def create(self, job: JobResult) -> None: ...
    def get(self, job_id: str) -> JobResult | None: ...
    def update(self, job_id: str, **fields: Any) -> None: ...
    def list(self) -> list[JobResult]: ...


class MemoryJobStore:
    """In-process dict store. Use with a single uvicorn worker."""

    def __init__(self) -> None:
        self._items: dict[str, dict[str, Any]] = {}

    def create(self, job: JobResult) -> None:
        self._items[job.jobId] = json.loads(job.model_dump_json())

    def get(self, job_id: str) -> JobResult | None:
        raw = self._items.get(job_id)
        if raw is None:
            return None
        return JobResult.model_validate(raw)

    def update(self, job_id: str, **fields: Any) -> None:
        raw = self._items.get(job_id)
        if raw is None:
            return
        raw.update(fields)

    def list(self) -> list[JobResult]:
        ordered = sorted(
            self._items.values(), key=lambda j: j.get("createdAt", ""), reverse=True
        )
        return [JobResult.model_validate(v) for v in ordered][:50]


class RedisJobStore:
    """Shared store backed by Redis — safe across multiple workers."""

    PREFIX = "scraper:job:"
    TTL = 86400  # one day

    def __init__(self, url: str) -> None:
        if not REDIS_AVAILABLE:
            raise RuntimeError("redis is not installed; pip install redis")
        self._client = redis_lib.Redis.from_url(url, decode_responses=True)  # type: ignore[union-attr]

    def _key(self, job_id: str) -> str:
        return f"{self.PREFIX}{job_id}"

    def create(self, job: JobResult) -> None:
        payload = json.dumps(json.loads(job.model_dump_json()))
        self._client.setex(self._key(job.jobId), self.TTL, payload)

    def get(self, job_id: str) -> JobResult | None:
        raw = self._client.get(self._key(job_id))
        if raw is None:
            return None
        return JobResult.model_validate(json.loads(raw))

    def update(self, job_id: str, **fields: Any) -> None:
        raw = self._client.get(self._key(job_id))
        if raw is None:
            return
        data = json.loads(raw)
        data.update(fields)
        self._client.setex(self._key(job_id), self.TTL, json.dumps(data))

    def list(self) -> list[JobResult]:
        jobs: list[JobResult] = []
        for key in self._client.scan_iter(f"{self.PREFIX}*"):  # type: ignore[union-attr]
            raw = self._client.get(key)
            if raw:
                jobs.append(JobResult.model_validate(json.loads(raw)))
        return sorted(jobs, key=lambda j: j.createdAt, reverse=True)[:50]


def get_job_store() -> JobStore:
    url = os.getenv("REDIS_URL")
    if url:
        return RedisJobStore(url)
    return MemoryJobStore()
