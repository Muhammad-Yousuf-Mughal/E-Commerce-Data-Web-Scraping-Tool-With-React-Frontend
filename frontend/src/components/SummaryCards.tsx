import { FiShoppingBag, FiDollarSign, FiBarChart2, FiCheckCircle } from "react-icons/fi";
import type { Stats } from "../types";
import { formatPrice, formatRating, formatCount, formatPercent } from "../lib/utils";

interface Props {
  stats: Stats;
}

export default function SummaryCards({ stats }: Props) {
  const total = stats.total_products ?? 0;
  const available = stats.available_count ?? 0;
  const metrics = [
    {
      icon: FiShoppingBag,
      label: "Total products",
      value: formatCount(total),
    },
    {
      icon: FiDollarSign,
      label: "Avg price",
      value: formatPrice(stats.avg_price, "USD"),
    },
    {
      icon: FiDollarSign,
      label: "Min price",
      value: formatPrice(stats.min_price, "USD"),
    },
    {
      icon: FiDollarSign,
      label: "Max price",
      value: formatPrice(stats.max_price, "USD"),
    },
    {
      icon: FiBarChart2,
      label: "Most common rating",
      value: formatRating(stats.most_common_rating),
    },
    {
      icon: FiCheckCircle,
      label: "In stock",
      value: `${formatCount(available)} (${formatPercent(available, total)})`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <m.icon size={18} />
          </div>
          <div className="text-xs text-text-secondary">{m.label}</div>
          <div className="text-lg font-semibold text-text">{m.value}</div>
        </div>
      ))}
    </div>
  );
}
