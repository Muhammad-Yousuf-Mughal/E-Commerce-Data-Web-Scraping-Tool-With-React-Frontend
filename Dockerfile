#syntax=docker/dockerfile:1

# --------------------------------------------------------------------------- #
# Stage 1 — build the React frontend
# --------------------------------------------------------------------------- #
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies (including dev deps needed to build) and cache the layer.
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund

# Copy source & build.
COPY frontend/ .
RUN npm run build

# --------------------------------------------------------------------------- #
# Stage 2 — Python backend (FastAPI) serving both API and frontend
# --------------------------------------------------------------------------- #
FROM python:3.12-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install Python dependencies first (better layer caching).
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source + the pre-built frontend assets.
COPY scraper/ ./scraper/
COPY *.py ./
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/

# Ensure runtime output/log directories exist.
RUN mkdir -p /app/output /app/logs

EXPOSE 8000

    HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
        CMD python -c "import urllib.request,sys; \
        urllib.request.urlopen('http://localhost:${PORT:-8000}/api/health', timeout=5); \
        sys.exit(0)" || exit 1

CMD ["sh", "-c", "exec uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${UVICORN_WORKERS:-1}"]
