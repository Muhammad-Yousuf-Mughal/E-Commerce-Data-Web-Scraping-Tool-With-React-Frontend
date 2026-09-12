import { useMemo, useState } from "react";
import {
  FiShuffle,
  FiExternalLink,
  FiCheck,
  FiX,
} from "react-icons/fi";
import type { Product } from "../types";
import { formatPrice, formatRating, truncate } from "../lib/utils";

interface Props {
  products: Product[];
}

type Column = "name" | "price" | "rating" | "rating_count" | "available" | "category" | "source_site";
type Direction = "asc" | "desc";

export default function ProductTable({ products }: Props) {
  const [sortCol, setSortCol] = useState<Column>("price");
  const [direction, setDirection] = useState<Direction>("asc");

  const toggle = (col: Column) => {
    if (sortCol === col) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setDirection(col === "price" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    const getValue = (p: Product, col: Column): number | string => {
      const v = p[col as keyof Product] ?? 0;
      if (col === "available") return p.available ? 1 : 0;
      if (col === "price" || col === "rating" || col === "rating_count") {
        return typeof v === "number" ? v : 0;
      }
      return typeof v === "string" ? v.toLowerCase() : "";
    };
    const copy = [...products];
    copy.sort((a, b) => {
      const av = getValue(a, sortCol);
      const bv = getValue(b, sortCol);
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return direction === "desc" ? copy.reverse() : copy;
  }, [products, sortCol, direction]);

  const columns = [
    { key: "name" as Column, label: "Product" },
    { key: "price" as Column, label: "Price" },
    { key: "rating" as Column, label: "Rating" },
    { key: "available" as Column, label: "Stock" },
    { key: "category" as Column, label: "Category" },
    { key: "source_site" as Column, label: "Source" },
  ];

  if (!products.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-surface-hover/60">
            <tr>
              <th className="w-8 px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">
                #
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="cursor-pointer px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase hover:text-text"
                  onClick={() => toggle(c.key)}
                >
                  <div className="flex items-center gap-1">
                    {c.label}
                    <FiShuffle size={10} className="shrink-0 opacity-50" />
                    {sortCol === c.key && (
                      <span className="text-accent">
                        {direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((p, i) => (
              <tr key={`${p.url}-${i}`} className="transition-colors hover:bg-surface-hover/40">
                <td className="px-3 py-2.5 text-text-tertiary">{i + 1}</td>
                <td className="px-3 py-2.5" title={p.name ?? ""}>
                  <span className="block max-w-[220px] font-medium text-text">
                    {truncate(p.name, 40)}
                  </span>
                  {p.description && (
                    <p className="mt-0.5 max-w-[220px] line-clamp-1 text-xs text-text-tertiary">
                      {truncate(p.description, 60)}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2.5">{formatPrice(p.price, p.currency)}</td>
                <td className="px-3 py-2.5">{formatRating(p.rating)}</td>
                <td className="px-3 py-2.5">
                  {p.available === true ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <FiCheck size={12} /> In stock
                    </span>
                  ) : p.available === false ? (
                    <span className="inline-flex items-center gap-1 text-rose-400">
                      <FiX size={12} /> Out of stock
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5">{p.category ?? "—"}</td>
                <td className="px-3 py-2.5">{truncate(p.source_site, 20) || "—"}</td>
                <td className="px-3 py-2.5">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg p-1 text-accent hover:bg-accent/15"
                      title="Open product page"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
