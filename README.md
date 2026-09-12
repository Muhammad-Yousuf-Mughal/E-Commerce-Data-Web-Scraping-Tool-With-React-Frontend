# E-Commerce Product Data Web Scraper

<!-- Replace this with your website/project URL -->
https://your-website-here.com

A professional, user-driven **Python web scraping** application that collects product data from e-commerce websites, cleans and validates it, then produces a **side-by-side comparison** with charts and downloadable CSV/Excel exports.

## Features

- **User-driven scraping** — paste product URLs *and/or* a category/search URL, then supply an optional keyword filter.
- **Adapter-based extractors** — site-specific parsers for Amazon, eBay, and Books to Scrape, plus a **generic extractor** that reads embedded `JSON-LD`, microdata, Open Graph tags and heuristics. Works on many real stores.
- **Automatic pagination** — follows "next" links to gather products from listings.
- **Polite scraping** — reads `robots.txt`, rate-limits per domain, rotates User-Agents, retries with backoff, and sets timeouts.
- **Robust error handling** — continues past individual bad products/pages; logs failures.
- **Data cleaning & validation** — deduplicates, normalises names, parses numeric prices, standardises ratings (0-5), and validates records.
- **Storage** — exports to **CSV** and **Excel**.
- **Analysis** — total products, average/min/max price, most common rating, available count, top-rated and cheapest products.
- **Visualisation** — price distribution, rating distribution, price-vs-rating, products-by-category charts.

## Tech Stack

- Python 3 — scraping pipeline
- Requests + BeautifulSoup (lxml) — HTTP & parsing
- Pandas + OpenPyXL — data processing & Excel export
- Matplotlib — visualisations
- FastAPI — REST API / job backend (serves the React frontend)
- React 18 + Vite + TypeScript + Tailwind CSS — modern web UI
- Docker — single-container production deployment

## Project Structure

```
Data Web Scraper/
├── scraper/
│   ├── __init__.py          # public API exports
│   ├── logger.py            # rotating file + console logging
│   ├── http_client.py       # retries, UA rotation, rate limiting
│   ├── robots.py            # robots.txt compliance
│   ├── pagination.py        # follow next-page links
│   ├── pipeline.py          # end-to-end orchestration
│   ├── cleaner.py           # dedupe + name/price/rating normalisation
│   ├── validator.py         # record validation & summary
│   ├── storage.py           # CSV + Excel export
│   ├── analysis.py          # descriptive statistics
│   ├── visualization.py     # matplotlib charts
│   └── extractors/
│       ├── base.py          # Product dataclass + extractor ABC
│       ├── generic.py       # JSON-LD / microdata / meta extractor
│       ├── amazon.py        # Amazon selectors
│       ├── ebay.py          # eBay selectors
│       ├── books_to_scrape.py
│       └── registry.py      # domain -> extractor mapping
├── frontend/                # React + Vite web UI
│   ├── public/              # favicon
│   ├── src/
│   │   ├── components/      # UI components (sidebar, form, tables, charts)
│   │   ├── hooks/           # useScrapeJob (background job polling)
│   │   ├── lib/             # formatting helpers
│   │   ├── api.ts           # typed axios API client
│   │   └── types.ts         # shared TypeScript types
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   ├── tsconfig.json
│   └── package.json
├── notebooks/
│   └── analysis.ipynb       # interactive demo
├── data/                    # raw scraped data (gitignored)
├── output/                  # CSV/Excel/charts (gitignored)
├── logs/                    # rotating logs (gitignored)
├── app.py                   # Streamlit UI (legacy, kept for reference)
├── api.py                   # FastAPI backend (new React-friendly API)
├── jobs_store.py            # Pluggable job store (memory / Redis)
├── main.py                  # CLI runner
├── requirements.txt
├── Dockerfile               # Multi-stage: builds React + serves via FastAPI
├── frontend/Dockerfile      # Dev server image
├── docker-compose.yml       # production + frontend-dev profiles
└── .gitignore
```

## Installation

```bash
# Create and activate a virtual environment (recommended)
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Streamlit web app

```bash
streamlit run app.py
```

Open the local URL (usually `http://localhost:8501`), then:

1. Paste product URLs (one per line) **and/or** a category/search URL in the sidebar.
2. Optionally enter a product query to filter results by name.
3. Click **Scrape & Compare**.

The app shows a comparison table, key differences (cheapest, top rated, best value), summary metrics, charts, and CSV/Excel download buttons.

### CLI

```bash
# Scrape a single product page
python main.py --url "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"

# Scrape a category page (follows pagination) and filter by a keyword
python main.py --url "https://books.toscrape.com/catalogue/category/books/travel_2/index.html" --query travel --max-pages 3

# Scrape multiple product URLs to compare them
python main.py --url "https://example.com/product/123" "https://example.com/product/456" --output output --base-name comparison
```

### React Frontend + FastAPI Backend (recommended UI)

The React frontend is a modern, dark-themed UI that talks to a FastAPI
backend which wraps the scraper pipeline as a REST API.

**Local development**

```bash
# 1. Backend API (separate terminal)
pip install -r requirements.txt
uvicorn api:app --reload --host 0.0.0.0 --port 8000

# 2. Frontend (separate terminal)
npm --prefix frontend install
npm --prefix frontend run dev        # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:8000` (override with
`VITE_PROXY_TARGET` for Dockerised dev).

**How it works**

- `POST /api/scrape` queues a scrape and returns a `jobId`.
- `GET /api/jobs/{id}` returns the job status and, once finished, the
  scraped products, summary statistics, failures and download links.
- `GET /api/download/{id}/csv` and `.../xlsx` stream the exported files.
- Jobs run in background threads; results persist across page reloads.

For multiple uvicorn workers, set `REDIS_URL=redis://redis:6379/0` (and add
a Redis service) so job state is shared.

### Notebook

Open `notebooks/analysis.ipynb` in Jupyter and run the cells to walk through the pipeline interactively.

## Deployment

The app ships as a single, self-contained Docker image that builds the React
frontend and serves it alongside the FastAPI backend.

```bash
# Build & run
docker build -t scraper-app .
docker run -p 8000:8000 scraper-app
# Then open http://localhost:8000  (API: /api/health)

# ...or with Docker Compose (production profile)
docker compose --profile production up --build

# Local full-stack dev (Vite HMR + live-reload backend)
docker compose --profile frontend-dev up --build
# Frontend: http://localhost:5173   Backend API: http://localhost:8000
```

### Railway (one-command deploy)

Railway auto-detects the root `Dockerfile` and deploys a single container
serving both the REST API and the static React frontend.

```bash
# One-time setup
railway login
railway link        # create/link a project (choose "Create a new project")

# Deploy the current branch (auto-builds ./Dockerfile)
railway up --detach
# Watch logs: railway logs
```

Recommended service variables (set in the Railway dashboard → **Variables**):

| Variable           | Value |
| ---                | --- |
| `UVICORN_WORKERS`  | `2` |
| `SCRAPER_WORKERS`  | `2` |
| `FRONTEND_ORIGINS` | *(your Railway app URL)* |

**Live URL:** _(paste your `https://<project>.up.railway.app` URL here once deployed)_

Environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8000` | Host port |
| `UVICORN_WORKERS` | `1` | API workers (set `>1` only with `REDIS_URL`) |
| `SCRAPER_WORKERS` | `2` | Background scrape threads |
| `FRONTEND_ORIGINS` | `http://localhost:5173,http://localhost:3000` | CORS allow-list |
| `REDIS_URL` | _(unset)_ | Shared job store for multi-worker scaling |

## Notes on "realistic" scraping

Most real e-commerce sites apply anti-bot measures. The **generic extractor** reads structured `JSON-LD` data, which most product pages embed, so it works on many stores. Heavy anti-bot sites (e.g. Amazon) may serve CAPTCHAs to plain `requests`; for those you would add a dynamic browser engine (Playwright/Selenium) behind the `HttpClient`. This project keeps the default dependency set lightweight; a dynamic engine can be introduced as an optional extra.

Always respect each site's `robots.txt` and terms of service, and keep request rates low.

## Milestones (Beginner -> Professional)

1. Scrape one page
2. Scrape multiple pages via pagination
3. Clean & validate data
4. Export CSV + Excel
5. Exploratory data analysis
6. Visualisations
7. Logging, error handling, modular structure + interactive UI

## License

For educational use. Scrape responsibly.
