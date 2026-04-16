import Link from "next/link";

import { StatusChip } from "@/components/status-chip";
import type { StoryStatus } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/formatting/format-date";
import { getSummaryLabel } from "@/lib/formatting/get-summary-label";
import {
  canonicalizeCategory,
  categoryLabels,
} from "@/lib/news/contracts/raw-schema";
import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";
import {
  isSupportedRegion,
  regionLabels,
} from "@/lib/news/contracts/regions";

type ArticleCardProps = {
  article: ProcessedArticle;
  statuses?: StoryStatus[];
};

export function ArticleCard({ article, statuses = [] }: ArticleCardProps) {
  const displayCategory = categoryLabels[canonicalizeCategory(article.category)];
  const displayRegion =
    article.sourceCountry && isSupportedRegion(article.sourceCountry)
      ? regionLabels[article.sourceCountry]
      : null;

  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
            {displayCategory}
          </span>
          {displayRegion ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-800">
              {displayRegion}
            </span>
          ) : null}
          {statuses.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
          <span>{article.sourceName}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">
            <Link href={`/articles/${article.slug}`} className="hover:text-amber-700">
              {article.title}
            </Link>
          </h2>

          {article.description ? (
            <p className="text-sm leading-6 text-stone-600">{article.description}</p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {getSummaryLabel(article.summaryType)}
          </p>
          <p className="text-sm leading-6 text-stone-700">{article.summary}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        <Link
          href={`/articles/${article.slug}`}
          className="font-medium text-stone-900 hover:text-amber-700"
        >
          Open detail page
        </Link>
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="text-stone-500 hover:text-stone-900"
        >
          Read original article
        </a>
      </div>
    </article>
  );
}
