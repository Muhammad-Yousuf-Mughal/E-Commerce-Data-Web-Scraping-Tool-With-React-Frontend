import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, CartesianGrid } from "recharts";
import type { Product } from "../types";

interface Props {
  products: Product[];
}

const BAR_COLOR = "#14b8a8";
const AXIS_TICK = "#94a3b8";
const GRID = "#33415b";

function EmptyCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex h-72 w-full items-center justify-center rounded-xl border border-border bg-surface">
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="mt-1 text-xs text-text-tertiary">{note}</p>
      </div>
    </div>
  );
}

export default function Charts({ products }: Props) {
  const prices = products
    .map((p) => p.price)
    .filter((v): v is number => v != null && v > 0);

  const ratings = products
    .map((p) => p.rating)
    .filter((v): v is number => v != null);

  // ---- Price distribution (histogram bins) ----
  const priceBins = (() => {
    if (!prices.length) return [];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return [{ range: `${min.toFixed(0)}`, count: prices.length }];
    const bins = 8;
    const step = (max - min) / bins;
    const counts = Array(bins).fill(0);
    prices.forEach((v) => {
      const idx = Math.min(bins - 1, Math.floor((v - min) / step));
      counts[idx]++;
    });
    return counts.map((count, i) => ({
      range: `${(min + i * step).toFixed(0)}–${(min + (i + 1) * step).toFixed(0)}`,
      count,
    }));
  })();

  // ---- Rating distribution ----
  const ratingCounts = (() => {
    const map = new Map<number, number>();
    ratings.forEach((r) => {
      const rounded = Math.round(r * 2) / 2;
      map.set(rounded, (map.get(rounded) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([value, count]) => ({ rating: value, count }))
      .sort((a, b) => a.rating - b.rating);
  })();

  // ---- Price vs rating scatter ----
  const scatterData = products
    .filter(
      (p) =>
        (p.price ?? null) !== null && (p.rating ?? null) !== null
    )
    .map((p) => ({
      x: p.price as number,
      y: p.rating as number,
      name: p.name ?? "",
    }));

  // ---- Products by category ----
  const categoryData = (() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const c = p.category || "Uncategorized";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  })();

  const chartCls = "h-72 w-full rounded-xl border border-border bg-surface p-3";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-2 text-sm font-medium text-text-secondary">Price distribution</h3>
        {priceBins.length ? (
          <ResponsiveContainer className={chartCls}>
            <BarChart data={priceBins}>
              <CartesianGrid stroke={GRID} vertical={false} opacity={0.3} />
              <XAxis dataKey="range" tick={{ fill: AXIS_TICK, fontSize: 10 }} angle={-45} minTickGap={5} />
              <YAxis tick={{ fill: AXIS_TICK, fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: `1px solid ${GRID}`, borderRadius: 8 }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyCard title="Price distribution" note="No price data available" />
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-text-secondary">Rating distribution</h3>
        {ratingCounts.length ? (
          <ResponsiveContainer className={chartCls}>
            <BarChart data={ratingCounts}>
              <CartesianGrid stroke={GRID} vertical={false} opacity={0.3} />
              <XAxis dataKey="rating" tick={{ fill: AXIS_TICK, fontSize: 11 }} />
              <YAxis tick={{ fill: AXIS_TICK, fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: `1px solid ${GRID}`, borderRadius: 8 }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyCard title="Rating distribution" note="No rating data available" />
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-text-secondary">Price vs rating</h3>
        {scatterData.length ? (
          <ResponsiveContainer className={chartCls}>
            <ScatterChart>
              <CartesianGrid stroke={GRID} opacity={0.3} />
              <XAxis
                type="number"
                dataKey="x"
                name="Price"
                tick={{ fill: AXIS_TICK, fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Rating"
                tick={{ fill: AXIS_TICK, fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "#33415b" }}
                contentStyle={{ backgroundColor: "#1e293b", border: `1px solid ${GRID}`, borderRadius: 8 }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Scatter name="Products" data={scatterData} fill={BAR_COLOR} />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <EmptyCard title="Price vs rating" note="No price/rating data available" />
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-text-secondary">Products by category</h3>
        {categoryData.length ? (
          <ResponsiveContainer className={chartCls}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke={GRID} horizontal={false} opacity={0.3} />
              <XAxis type="number" tick={{ fill: AXIS_TICK, fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: AXIS_TICK, fontSize: 10 }}
                width={120}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: `1px solid ${GRID}`, borderRadius: 8 }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyCard title="Products by category" note="No category data available" />
        )}
      </section>
    </div>
  );
}
