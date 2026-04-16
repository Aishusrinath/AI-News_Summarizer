import Link from "next/link";

import { ArticleList } from "@/components/article-list";
import { ChatPanel } from "@/components/chat-panel";
import { RefreshStatus } from "@/components/refresh-status";
import { formatDate } from "@/lib/formatting/format-date";
import { getSummaryLabel } from "@/lib/formatting/get-summary-label";
import {
  canonicalizeCategory,
  categoryLabels,
} from "@/lib/news/contracts/raw-schema";
import type {
  ProcessedArticle,
  RefreshStatus as RefreshStatusValue,
} from "@/lib/news/contracts/processed-schema";

type ArticleDetailProps = {
  article: ProcessedArticle;
  relatedStories: ProcessedArticle[];
  refreshStatus: RefreshStatusValue;
  snapshotGeneratedAt: string;
};

export function ArticleDetail({
  article,
  relatedStories,
  refreshStatus,
  snapshotGeneratedAt,
}: ArticleDetailProps) {
  const displayCategory = categoryLabels[canonicalizeCategory(article.category)];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article className="flex flex-col gap-8 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-200/60 md:p-12">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
              {displayCategory}
            </span>
            <span>{article.sourceName}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-stone-950">
              {article.title}
            </h1>
            {article.description ? (
              <p className="max-w-4xl text-lg leading-8 text-stone-600">
                {article.description}
              </p>
            ) : null}
          </div>
        </header>

        <RefreshStatus refreshStatus={refreshStatus} generatedAt={snapshotGeneratedAt} />

        <section className="rounded-3xl bg-amber-50 p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {getSummaryLabel(article.summaryType)}
          </p>
          <p className="text-base leading-8 text-stone-700">{article.summary}</p>
        </section>

        {article.cleanedText ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Available excerpt
            </h2>
            <p className="text-base leading-8 text-stone-700">{article.cleanedText}</p>
          </section>
        ) : null}

        <footer className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6 text-sm">
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-stone-950 px-5 py-3 font-medium text-stone-50 hover:bg-stone-800"
          >
            Read original article
          </a>
          <p className="text-stone-500">
            This summary is a convenience layer over third-party reporting.
          </p>
        </footer>

        <section className="flex flex-col gap-5 border-t border-stone-200 pt-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              Related Current Stories
            </h2>
            <p className="text-sm leading-7 text-stone-600">
              More coverage from the same category in the latest validated snapshot.
            </p>
          </div>

          <ArticleList articles={relatedStories} />
        </section>
      </article>

      <aside className="flex h-fit flex-col gap-5 rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-lg shadow-stone-300/40 xl:sticky xl:top-8">
        <ChatPanel
          compact
          articleSlug={article.slug}
          title="Ask About This Story"
          description="The assistant is biased toward this article first, then the wider current snapshot."
          starterPrompts={[
            "Summarize why this story matters.",
            "Compare this with the latest stories in the same category.",
            "What changed around this story in the latest refresh?",
          ]}
        />

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-300"
        >
          Return to dashboard
        </Link>
      </aside>
    </div>
  );
}
