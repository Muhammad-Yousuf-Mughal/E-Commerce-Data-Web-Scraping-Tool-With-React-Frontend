import { FiPlay, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";
import Button from "./ui/Button";
import type { FormState } from "../App";
import type { ScrapeRequest } from "../types";
import { cls } from "../lib/cls";

type Status = "idle" | "queued" | "running" | "done" | "failed";

interface ScrapeFormProps {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onStart: (payload: ScrapeRequest) => void;
  status: Status;
  isBusy: boolean;
  error: string | null;
  onClear: () => void;
}

export default function ScrapeForm({
  form,
  onChange,
  onStart,
  status,
  isBusy,
  error,
  onClear,
}: ScrapeFormProps) {
  const handleSubmit = () => {
    const urls = [
      ...form.urlsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      ...(form.listingUrl ? [form.listingUrl.trim()] : []),
    ];
    if (!urls.length) {
      onChange({ productQuery: form.productQuery });
      return;
    }
    const payload: ScrapeRequest = {
      urls,
      productQuery: form.productQuery,
      maxPages: form.maxPages,
      maxProducts: form.maxProducts ?? undefined,
      minDelay: form.minDelay,
    };
    onStart(payload);
  };

  const canScrape = !isBusy && status !== "done";
  const showNote = !isBusy && status !== "done";

  return (
    <section className="flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xl">
          <h2 className="text-center text-xl font-semibold text-text">
            Scrape & Compare
          </h2>
          <p className="mt-1 text-center text-sm text-text-secondary">
            Paste product URLs (one per line) and/or a category/search URL.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Product URLs
              </label>
              <textarea
                value={form.urlsText}
                onChange={(e) => onChange({ urlsText: e.target.value })}
                placeholder="https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html
https://shop.example.com/product/123"
                className="mt-1 block w-full resize-y rounded-lg border border-border bg-background/60 text-text placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Listing / category URL
              </label>
              <input
                type="url"
                value={form.listingUrl}
                onChange={(e) => onChange({ listingUrl: e.target.value })}
                placeholder="https://books.toscrape.com/catalogue/category/books/travel_2/index.html"
                className="mt-1 block w-full rounded-lg border border-border bg-background/60 text-text placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Product query filter (optional)
              </label>
              <input
                type="text"
                value={form.productQuery}
                onChange={(e) => onChange({ productQuery: e.target.value })}
                placeholder="e.g. phone, travel, gaming"
                className="mt-1 block w-full rounded-lg border border-border bg-background/60 text-text placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Max pages
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxPages}
                  onChange={(e) => onChange({ maxPages: parseInt(e.target.value, 10) || 1 })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background/60 text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Max products
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={form.maxProducts ?? ""}
                  onChange={(e) =>
                    onChange({
                      maxProducts: e.target.value === "" ? null : parseInt(e.target.value, 10),
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-border bg-background/60 text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Delay (s)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={form.minDelay}
                  onChange={(e) => onChange({ minDelay: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background/60 text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-800/50 bg-rose-950/40 p-3 text-sm text-rose-300">
              <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={<FiPlay size={16} />}
              disabled={!canScrape || isBusy}
              onClick={handleSubmit}
            >
              {isBusy ? "Scraping…" : status === "queued" || status === "running" ? "Scraping…" : "Scrape & Compare"}
            </Button>
            {onClear && (status === "done" || status === "failed") && (
              <Button variant="ghost" size="sm" icon={<FiX size={14} />} onClick={onClear}>
                New scrape
              </Button>
            )}
          </div>

          {showNote && (
            <div className="mt-3 flex items-start gap-2 text-xs text-text-tertiary">
              <FiInfo size={14} className="mt-0.5 shrink-0 text-accent" />
              <p>
                Demo presets are in the sidebar. For heavily protected sites
                (e.g. Amazon), requests may be blocked by anti-bot measures.
              </p>
            </div>
          )}
        </div>

        {isBusy && status !== "done" && (
          <div className={cls("mt-4 text-center text-sm text-text-secondary")}>
            Status:{" "}
            <span className="font-medium text-accent">
              {status === "queued" ? "Queued — waiting to start" : "Running — fetching pages…"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
