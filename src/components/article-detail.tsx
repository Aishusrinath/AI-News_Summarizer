import { formatDate } from "@/lib/formatting/format-date";
import { getSummaryLabel } from "@/lib/formatting/get-summary-label";
import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";

type ArticleDetailProps = {
  article: ProcessedArticle;
};

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-200/60 md:p-12">
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
            {article.category}
          </span>
          <span>{article.sourceName}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-950">
            {article.title}
          </h1>
          {article.description ? (
            <p className="max-w-3xl text-lg leading-8 text-stone-600">
              {article.description}
            </p>
          ) : null}
        </div>
      </header>

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
    </article>
  );
}
