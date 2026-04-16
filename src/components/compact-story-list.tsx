import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { StatusChip } from "@/components/status-chip";
import type { DashboardStory } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/formatting/format-date";
import { categoryLabels, canonicalizeCategory } from "@/lib/news/contracts/raw-schema";
import { isSupportedRegion, regionLabels } from "@/lib/news/contracts/regions";

type CompactStoryListProps = {
  emptyStateDescription?: string;
  stories: DashboardStory[];
};

function shorten(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export function CompactStoryList({
  emptyStateDescription = "There were no validated articles in this section for the latest snapshot.",
  stories,
}: CompactStoryListProps) {
  if (stories.length === 0) {
    return (
      <EmptyState
        title="No more stories here"
        description={emptyStateDescription}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white/85 shadow-sm shadow-stone-200/60">
      {stories.map(({ article, statuses }, index) => {
        const displayRegion =
          article.sourceCountry && isSupportedRegion(article.sourceCountry)
            ? regionLabels[article.sourceCountry]
            : null;

        return (
          <article
            key={article.id}
            className={[
              "grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_10rem] md:items-center",
              index === 0 ? "" : "border-t border-stone-100",
            ].join(" ")}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-700">
                  {categoryLabels[canonicalizeCategory(article.category)]}
                </span>
                {displayRegion ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                    {displayRegion}
                  </span>
                ) : null}
                {statuses.slice(0, 1).map((status) => (
                  <StatusChip key={status} status={status} />
                ))}
                <span>{article.sourceName}</span>
              </div>

              <h3 className="text-base font-semibold tracking-tight text-stone-950">
                <Link href={`/articles/${article.slug}`} className="hover:text-amber-700">
                  {article.title}
                </Link>
              </h3>
              <p className="text-sm leading-6 text-stone-600">
                {shorten(article.summary)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 md:justify-end md:text-right">
              <span>{formatDate(article.publishedAt)}</span>
              <Link
                href={`/articles/${article.slug}`}
                className="font-semibold text-stone-900 hover:text-amber-700"
              >
                Open
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
