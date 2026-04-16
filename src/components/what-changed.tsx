import Link from "next/link";

import { StatusChip } from "@/components/status-chip";
import type { DashboardChange } from "@/lib/data/dashboard";
import { categoryLabels, canonicalizeCategory } from "@/lib/news/contracts/raw-schema";

type WhatChangedProps = {
  changes: DashboardChange[];
};

export function WhatChanged({ changes }: WhatChangedProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          What Changed
        </h2>
        <p className="text-sm leading-7 text-stone-600">
          New leaders, fresh arrivals, and stories that moved during the latest refresh.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {changes.map((change) => (
          <article
            key={`${change.article.id}-${change.status}`}
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/60"
          >
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <StatusChip status={change.status} />
              <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
                {categoryLabels[canonicalizeCategory(change.article.category)]}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-lg font-semibold tracking-tight text-stone-950">
                <Link href={`/articles/${change.article.slug}`} className="hover:text-amber-700">
                  {change.article.title}
                </Link>
              </h3>
              <p className="text-sm leading-6 text-stone-600">{change.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
