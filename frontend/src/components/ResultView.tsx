import { FiBarChart2, FiTable, FiTag } from "react-icons/fi";
import type { JobResult } from "../types";
import SummaryCards from "./SummaryCards";
import KeyDifferences from "./KeyDifferences";
import ProductTable from "./ProductTable";
import Charts from "./Charts";
import FailuresList from "./FailuresList";
import DownloadButtons from "./DownloadButtons";
import Button from "./ui/Button";
import { cls } from "../lib/cls";

interface Props {
  job: JobResult;
  onClear: () => void;
}

export default function ResultView({ job, onClear }: Props) {
  const { products, stats, failures } = job;
  const total = products?.length ?? 0;

  if (!total) {
    return (
      <div className="space-y-6">
        <ResultCard
          icon={FiTag}
          title="No products found"
          description={
            failures?.length
              ? `${failures.length} URL(s) failed to return data. Check the logs for details.`
              : "The scrape returned no products. Try different URLs or reduce the max products filter."
          }
        />
        <FailuresList failures={failures} />
        <Button variant="ghost" size="sm" onClick={onClear}>
          Scrape again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryCards stats={stats} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
            <FiBarChart2 size={18} />
            Key differences
          </h2>
        </div>
        <KeyDifferences products={products} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
            <FiTable size={18} />
            Product comparison
          </h2>
          <span className="text-sm text-text-secondary">{total} products</span>
        </div>
        <ProductTable products={products} />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text">
          <FiBarChart2 size={18} />
          Visualisations
        </h2>
        <Charts products={products} />
      </section>

      <DownloadButtons csvUrl={job.csvUrl} excelUrl={job.excelUrl} />

      <FailuresList failures={failures} />

      <div className="flex justify-end pt-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          New scrape
        </Button>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div
      className={cls(
        "flex items-start gap-4 rounded-xl border border-border bg-surface p-6",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-semibold text-text">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
