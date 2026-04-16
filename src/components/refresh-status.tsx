import { formatDate } from "@/lib/formatting/format-date";
import type { RefreshStatus } from "@/lib/news/contracts/processed-schema";

type RefreshStatusProps = {
  refreshStatus: RefreshStatus;
  generatedAt: string;
};

function getStatusCopy(refreshStatus: RefreshStatus, generatedAt: string) {
  if (refreshStatus.status === "failed") {
    return {
      label: "Stale data",
      detail: refreshStatus.lastSuccessfulRefreshAt
        ? `Serving the last successful snapshot from ${formatDate(refreshStatus.lastSuccessfulRefreshAt)}.`
        : "Serving the last available snapshot while the latest refresh is unavailable.",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (refreshStatus.isStale) {
    return {
      label: "Refresh delayed",
      detail: `Current snapshot from ${formatDate(generatedAt)} is still available.`,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Snapshot current",
    detail: `Grounded in the latest completed snapshot from ${formatDate(generatedAt)}.`,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

export function RefreshStatus({ refreshStatus, generatedAt }: RefreshStatusProps) {
  const statusCopy = getStatusCopy(refreshStatus, generatedAt);

  return (
    <div
      className={`rounded-[1.5rem] border px-5 py-4 text-sm shadow-sm ${statusCopy.className}`}
      aria-live="polite"
    >
      <p className="font-semibold uppercase tracking-[0.18em]">{statusCopy.label}</p>
      <p className="mt-2 leading-6">{statusCopy.detail}</p>
    </div>
  );
}
