import { useEffect, useRef, useState } from "react";
import { ScraperAPI } from "../api";
import type { JobResult, ScrapeRequest } from "../types";

type Status = "idle" | "queued" | "running" | "done" | "failed";

export const useScrapeJob = () => {
  const [job, setJob] = useState<JobResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const clear = () => {
    setJob(null);
    setStatus("idle");
    setError(null);
    localStorage.removeItem("scraper:lastJobId");
  };

  const startJob = async (payload: ScrapeRequest) => {
    clear();
    setError(null);
    setStatus("queued");
    try {
      const created = await ScraperAPI.startScrape(payload);
      const jobId = created.jobId;
      localStorage.setItem("scraper:lastJobId", jobId);
      pollJob(jobId);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to start scrape job.");
      setStatus("failed");
    }
  };

  const pollJob = (jobId: string) => {
    const tick = async () => {
      try {
        const res = await ScraperAPI.getJob(jobId);
        setJob(res);
        setStatus(res.status);
        if (res.status === "done" || res.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch (e: unknown) {
        setError((e as Error)?.message ?? "Failed to fetch job status.");
        setStatus("failed");
      }
    };
    tick(); // immediate first poll
    pollRef.current = window.setInterval(tick, 1500);
  };

  // Rehydrate a job from localStorage on first load.
  useEffect(() => {
    const savedId = localStorage.getItem("scraper:lastJobId");
    if (!savedId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await ScraperAPI.getJob(savedId);
        if (controller.signal.aborted) return;
        setJob(res);
        setStatus(res.status);
        if (res.status === "queued" || res.status === "running") {
          pollJob(savedId);
        }
      } catch {
        // stale id — ignore
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const isBusy = status === "queued" || status === "running";

  return { job, status, isBusy, error, startJob, clear };
};
