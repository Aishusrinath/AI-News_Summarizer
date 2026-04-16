import { CategoryFilter } from "@/components/category-filter";
import { CompactStoryList } from "@/components/compact-story-list";
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
    emptyStateDescription,
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

        <section className="grid gap-4 rounded-[1.75rem] border border-stone-200 bg-white/70 p-5 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-stone-950">
                Shape the briefing
              </h2>
              <p className="text-sm leading-7 text-stone-600">
                Filter the same snapshot by topic or region without losing the
                shareable URL.
              </p>
            </div>
            <CategoryFilter
              activeCategory={activeCategory}
              activeRegion={activeRegion}
              availableCategories={availableCategories}
            />
          </div>

          <div className="space-y-3 rounded-[1.25rem] border border-amber-100 bg-amber-50/60 p-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-stone-950">
                Region lens
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
          </div>
        </section>

        <DashboardSection
          title="Editor’s First Pass"
          description="The strongest mix of recency, article quality, and editorial weight in the latest snapshot."
          emptyStateDescription={emptyStateDescription}
          stories={topHighlights}
        />

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                Category Pulse
              </h2>
              <p className="text-sm leading-7 text-stone-600">
                One non-repeated story per active category, designed for a fast
                cross-topic scan.
              </p>
            </div>
            <CompactStoryList
              stories={categoryLeaders}
              emptyStateDescription={emptyStateDescription}
            />
          </div>

          <WhatChanged changes={whatChanged} />
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              More From This Snapshot
            </h2>
            <p className="text-sm leading-7 text-stone-600">
              A compact back bench of additional stories after the main highlights.
            </p>
          </div>

          <CompactStoryList
            stories={latestStories}
            emptyStateDescription={emptyStateDescription}
          />
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
