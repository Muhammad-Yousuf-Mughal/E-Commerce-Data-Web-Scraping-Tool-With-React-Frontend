export type Product = {
  name: string | null;
  price: number | null;
  currency: string | null;
  rating: number | null;
  rating_count: number | null;
  available: boolean | null;
  availability: string | null;
  url: string | null;
  category: string | null;
  description: string | null;
  source_site: string | null;
  scraped_at: string | null;
};

export type Failure = { url: string; error: string };

export type Stats = {
  total_products: number;
  products_with_price: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  avg_rating: number | null;
  most_common_rating: number | null;
  available_count: number;
  unavailable_count: number;
  category_counts: Record<string, number>;
  top_rated: Array<Record<string, unknown>>;
  cheapest: Array<Record<string, unknown>>;
  most_expensive: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type ScrapeRequest = {
  urls: string[];
  productQuery?: string;
  maxPages?: number;
  maxProducts?: number | null;
  minDelay?: number;
};

export type JobStatus = "queued" | "running" | "done" | "failed";

export type JobResult = {
  jobId: string;
  status: JobStatus;
  createdAt: string;
  finishedAt: string | null;
  message: string | null;
  products: Product[];
  stats: Stats;
  failures: Failure[];
  csvUrl: string | null;
  excelUrl: string | null;
};

export type DemoPreset = {
  label: string;
  description: string;
  urls: string[];
};
