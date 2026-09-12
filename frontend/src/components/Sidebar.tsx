import { FiInfo, FiLoader, FiZap } from "react-icons/fi";
import type { DemoPreset } from "../types";

const DEMO_PRESETS: DemoPreset[] = [
  {
    label: "Books to Scrape (Travel)",
    description: "A reliable, bot-friendly demo with pagination",
    urls: [
      "https://books.toscrape.com/catalogue/category/books/travel_2/index.html",
    ],
  },
  {
    label: "Books to Scrape (Products)",
    description: "A few individual product pages to compare",
    urls: [
      "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
      "https://books.toscrape.com/catalogue/tipping-the-velvet_993/index.html",
      "https://books.toscrape.com/catalogue/soumission_995/index.html",
    ],
  },
  {
    label: "Gaming Laptops (Amazon)",
    description: "Amazon product pages (may be blocked by anti-bot)",
    urls: [
      "https://www.amazon.com/Katana-15-6-165Hz-Gaming-Laptop/dp/B0DZFVBQLK",
      "https://www.amazon.com/ASUS-ROG-Strix-Gaming-Laptop/dp/B0DZZWMB2L",
      "https://www.amazon.com/dp/B0HF7SXJT8",
      "https://www.amazon.com/dp/B0DW238TXK",
      "https://www.amazon.com/dp/B0FSGJZDNT",
    ],
  },
];

interface SidebarProps {
  onLoadDemo: (urls: string[]) => void;
}

export default function Sidebar({ onLoadDemo }: SidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface/50 p-5">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider">
          <FiZap size={14} />
          Quick presets
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Load demo URLs into the form to test the scraper.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onLoadDemo(preset.urls)}
            className="group text-left rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent/50 hover:bg-surface-hover"
          >
            <div className="flex items-start gap-2">
              <FiLoader
                className="mt-0.5 shrink-0 text-accent group-hover:scale-110"
                size={16}
              />
              <span>
                <span className="block text-sm font-medium text-text">
                  {preset.label}
                </span>
                <span className="block text-xs text-text-secondary">
                  {preset.description}
                </span>
                <span className="mt-1 text-xs text-text-tertiary">
                  {preset.urls.length} URL{preset.urls.length > 1 ? "s" : ""}
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto rounded-xl border border-border bg-surface/60 p-3">
        <div className="flex items-start gap-2 text-xs text-text-secondary">
          <FiInfo size={14} className="mt-0.5 shrink-0 text-accent" />
          <p>
            Paste your own product or listing URLs in the form. Listing URLs are
            followed automatically (up to Max pages).
          </p>
        </div>
      </div>
    </aside>
  );
}
