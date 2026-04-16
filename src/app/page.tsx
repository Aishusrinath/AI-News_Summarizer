import { ArticleList } from "@/components/article-list";
import { CategoryFilter } from "@/components/category-filter";
import { DashboardSection } from "@/components/dashboard-section";
import { LiveRefresh } from "@/components/live-refresh";
import { RegionFilter } from "@/components/region-filter";
import { RefreshStatus } from "@/components/refresh-status";
import { WhatChanged } from "@/components/what-changed";
import { getHomepageFeed } from "@/lib/data/get-homepage-feed";
import { formatDate } from "@/lib/formatting/format-date";

export default async function Home({ searchParams }: PageProps<"/">) {
  const rawCategory = (await searchParams)?.category;
  const rawRegion = (await searchParams)?.region;
  const {
    dataset,
    topHighlights,
    categoryLeaders,
    whatChanged,
    latestStories,
    activeCategory,
    activeRegion,
    refreshStatus,
    availableCategories,
    availableRegions,
  } = await getHomepageFeed(
    Array.isArray(rawCategory) ? rawCategory[0] : rawCategory,
    Array.isArray(rawRegion) ? rawRegion[0] : rawRegion,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_28%),linear-gradient(180deg,_#f7f3ea_0%,_#f2eee6_100%)] px-6 py-10 md:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 xl:grid-cols-1">
        <div className="flex flex-col gap-10">
        <section className="rounded-[2rem] border border-stone-200 bg-white/90 p-8 shadow-lg shadow-stone-200/70 md:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                AI News Summarizer
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
                Professional world-news overview with grounded summaries.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                Browse AI-assisted summaries generated from validated news snapshots,
                with every story linked back to its original publisher.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Source-linked",
                  "Updated hourly",
                  "Educational use only",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] bg-stone-950 p-6 text-stone-50 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Last updated
                </p>
                <p className="mt-2 text-lg font-medium">
                  {formatDate(dataset.generatedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                  Current dataset
                </p>
                <p className="mt-2 text-lg font-medium">
                  {dataset.counts.finalArticles} validated articles
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <RefreshStatus
              refreshStatus={refreshStatus}
              generatedAt={dataset.generatedAt}
            />
          </div>

          <div className="mt-4">
            <LiveRefresh generatedAt={dataset.generatedAt} />
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                Explore by category
              </h2>
              <p className="text-sm leading-7 text-stone-600">
                Category filters are URL-driven, so this view stays shareable and
                bookmarkable.
              </p>
            </div>
            <CategoryFilter
              activeCategory={activeCategory}
              activeRegion={activeRegion}
              availableCategories={availableCategories}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-[1.5rem] border border-amber-100 bg-white/60 p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-950">
              Filter by region
            </h2>
            <p className="text-sm leading-7 text-stone-600">
              Compare coverage from US, UK, Canada, Australia, and India feeds.
            </p>
          </div>
          <RegionFilter
            activeCategory={activeCategory}
            activeRegion={activeRegion}
            availableRegions={availableRegions}
          />
        </section>

        <DashboardSection
          title="Top Highlights"
          description="The strongest mix of recency, article quality, and editorial weight in the latest snapshot."
          stories={topHighlights}
        />

        <DashboardSection
          title="Category Leaders"
          description="One standout story for each active category, chosen to keep the dashboard broad and useful."
          stories={categoryLeaders}
        />

        <WhatChanged changes={whatChanged} />

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              Latest Stories
            </h2>
            <p className="text-sm leading-7 text-stone-600">
              A broader scan of the current snapshot, trimmed for a clean first pass.
            </p>
          </div>

          <ArticleList articles={latestStories} />
        </section>

        <footer className="rounded-[1.5rem] border border-stone-200 bg-white/70 px-5 py-4 text-sm text-stone-600 shadow-sm">
          Built by Aishwarya Srinath as an educational AI news summarization
          project.
        </footer>
        </div>
      </div>
    </main>
  );
}
