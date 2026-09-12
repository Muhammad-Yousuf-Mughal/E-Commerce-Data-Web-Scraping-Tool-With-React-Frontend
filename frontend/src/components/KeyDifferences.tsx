import { FiAward, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import type { Product } from "../types";
import { formatPrice, formatRating } from "../lib/utils";

interface Props {
  products: Product[];
}

interface Highlight {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string | null;
}

export default function KeyDifferences({ products }: Props) {
  const withPrice = products
    .filter((p) => (p.price ?? null) !== null)
    .map((p) => ({ ...p, price: p.price as number }));
  const withRating = products
    .filter((p) => (p.rating ?? null) !== null)
    .map((p) => ({ ...p, rating: p.rating as number }));

  const cheapest = withPrice.reduce((a, b) => (a.price <= b.price ? a : b), withPrice[0]);
  const topRated = withRating.reduce((a, b) => (a.rating >= b.rating ? a : b), withRating[0]);

  const valueProducts = withPrice
    .filter((p) => p.price && p.price > 0)
    .map((p) => ({ ...p, value: (p.rating ?? 0) / p.price }));
  const bestValue = valueProducts.reduce(
    (a, b) => (a.value >= b.value ? a : b),
    valueProducts[0]
  );

  const highlights: Highlight[] = [
    {
      icon: FiDollarSign,
      label: "Cheapest",
      value: cheapest ? formatPrice(cheapest.price, cheapest.currency) : "—",
      sub: cheapest?.name,
    },
    {
      icon: FiAward,
      label: "Top rated",
      value: topRated ? formatRating(topRated.rating) : "—",
      sub: topRated?.name,
    },
    {
      icon: FiTrendingUp,
      label: "Best value",
      value: bestValue ? formatPrice(bestValue.price, bestValue.currency) : "—",
      sub: bestValue?.name,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {highlights.map((h) => (
        <div
          key={h.label}
          className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <h.icon size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-text-secondary">{h.label}</div>
            <div className="truncate text-base font-semibold text-text">{h.value}</div>
            {h.sub && (
              <p className="mt-0.5 line-clamp-1 text-xs text-text-tertiary">{h.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
