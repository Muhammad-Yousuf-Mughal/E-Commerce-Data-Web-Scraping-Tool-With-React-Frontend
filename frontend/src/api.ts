import axios from "axios";
import type { JobResult, ScrapeRequest } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message =
      err?.response?.data?.detail ||
      err?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export type ScrapeJobCreate = { jobId: string; status: string };

export const ScraperAPI = {
  health: () => api.get<{ status: string }>("/api/health").then((r) => r.data),
  startScrape: (payload: ScrapeRequest) =>
    api.post<ScrapeJobCreate>("/api/scrape", payload).then((r) => r.data),
  getJob: (jobId: string) =>
    api.get<JobResult>(`/api/jobs/${jobId}`).then((r) => r.data),
  listJobs: () => api.get<JobResult[]>("/api/jobs").then((r) => r.data),
};

export default api;
