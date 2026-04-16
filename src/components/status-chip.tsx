import type { StoryStatus } from "@/lib/data/dashboard";

const chipCopy: Record<StoryStatus, string> = {
  new: "New",
  "moved-up": "Moved Up",
  "leader-changed": "Leader Changed",
  updated: "Updated",
};

const chipStyles: Record<StoryStatus, string> = {
  new: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "moved-up": "border-sky-200 bg-sky-50 text-sky-700",
  "leader-changed": "border-amber-200 bg-amber-50 text-amber-700",
  updated: "border-stone-200 bg-stone-100 text-stone-700",
};

type StatusChipProps = {
  status: StoryStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${chipStyles[status]}`}
    >
      {chipCopy[status]}
    </span>
  );
}
