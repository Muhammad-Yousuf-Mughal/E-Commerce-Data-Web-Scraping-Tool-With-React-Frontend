import { FiAlertTriangle } from "react-icons/fi";
import type { Failure } from "../types";
import { cls } from "../lib/cls";

interface Props {
  failures: Failure[];
}

export default function FailuresList({ failures }: Props) {
  if (!failures?.length) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-rose-300">
        <FiAlertTriangle size={14} />
        <span>{failures.length} URL{failures.length > 1 ? "s" : ""} failed</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {failures.map((f, i) => (
          <div
            key={`${f.url}-${i}`}
            className={cls(
              "flex items-start gap-2 rounded-lg border border-rose-900/40 bg-rose-950/30 p-2.5 text-sm",
            )}
          >
            <span className="mt-0.5 text-rose-400">●</span>
            <div className="min-w-0 flex-1">
              <p className="text-rose-200 break-all">{f.url}</p>
              <p className="mt-0.5 text-xs text-rose-400/80">{f.error}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
