import { useState, useEffect } from "react";
import { FiCloud, FiMoon, FiSun } from "react-icons/fi";
import { cls } from "../lib/cls";

const STORAGE_KEY = "theme";

export default function Header() {
  const [dark, setDark] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as "dark" | "light") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(dark);
    localStorage.setItem(STORAGE_KEY, dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <FiCloud className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">E-Commerce Scraper</h1>
            <p className="text-xs text-text-secondary">Compare products across stores</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDark(dark === "dark" ? "light" : "dark")}
          className={cls(
            "rounded-lg border border-border p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text",
          )}
          aria-label="Toggle light/dark theme"
          title="Toggle light/dark theme"
        >
          {dark === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>
    </header>
  );
}
