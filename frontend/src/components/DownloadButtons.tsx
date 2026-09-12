import { FiFileText, FiFile } from "react-icons/fi";

interface Props {
  csvUrl?: string | null;
  excelUrl?: string | null;
}

export default function DownloadButtons({ csvUrl, excelUrl }: Props) {
  const hasAny = Boolean(csvUrl || excelUrl);
  if (!hasAny) return null;

  const anchorCls =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover hover:text-accent";

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="text-sm font-medium text-text-secondary">Export data:</span>
      {csvUrl && (
        <a href={csvUrl} download className={anchorCls}>
          <FiFileText size={14} />
          Download CSV
        </a>
      )}
      {excelUrl && (
        <a href={excelUrl} download className={anchorCls}>
          <FiFile size={14} />
          Download Excel
        </a>
      )}
    </section>
  );
}
