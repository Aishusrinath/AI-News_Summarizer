import type { ProcessedDataset, RefreshStatus } from "@/lib/news/contracts/processed-schema";
import { buildDashboardFeed } from "@/lib/data/dashboard";

function buildArticle(input: {
  id: string;
  title: string;
  category: "world" | "politics" | "business" | "technology" | "science" | "health";
  publishedAt: string;
  summary?: string;
}) {
  return {
    id: input.id,
    slug: `${input.id}-slug`,
    title: input.title,
    sourceName: "Source",
    publishedAt: input.publishedAt,
    category: input.category,
    url: `https://example.com/${input.id}`,
    summary: input.summary ?? `${input.title} summary`,
    summaryType: "ai" as const,
    description: `${input.title} description`,
  };
}

describe("buildDashboardFeed", () => {
  const refreshStatus: RefreshStatus = {
    currentSnapshotId: "current",
    previousSnapshotId: "previous",
    lastSuccessfulRefreshAt: "2026-04-10T12:00:00.000Z",
    lastAttemptedRefreshAt: "2026-04-10T12:00:00.000Z",
    isStale: false,
    status: "success",
  };

  it("builds curated sections and detects change states from current vs previous snapshots", () => {
    const previousDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T11:00:00.000Z",
      source: "Fixture",
      categories: ["world", "politics", "business", "technology"],
      counts: {
        fetched: 4,
        normalized: 4,
        dropped: 0,
        deduped: 4,
        summarizedWithAi: 4,
        fallbackSummaries: 0,
        finalArticles: 4,
      },
      articles: [
        buildArticle({
          id: "world-old",
          title: "World old",
          category: "world",
          publishedAt: "2026-04-10T09:00:00.000Z",
        }),
        buildArticle({
          id: "politics-old",
          title: "Politics old",
          category: "politics",
          publishedAt: "2026-04-10T08:00:00.000Z",
        }),
        buildArticle({
          id: "business-old",
          title: "Business old",
          category: "business",
          publishedAt: "2026-04-10T07:00:00.000Z",
        }),
        buildArticle({
          id: "technology-old",
          title: "Technology old",
          category: "technology",
          publishedAt: "2026-04-10T06:00:00.000Z",
        }),
      ],
    };

    const currentDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: ["world", "politics", "business", "technology", "science"],
      counts: {
        fetched: 5,
        normalized: 5,
        dropped: 0,
        deduped: 5,
        summarizedWithAi: 5,
        fallbackSummaries: 0,
        finalArticles: 5,
      },
      articles: [
        buildArticle({
          id: "world-new",
          title: "World new",
          category: "world",
          publishedAt: "2026-04-10T11:50:00.000Z",
        }),
        buildArticle({
          id: "politics-old",
          title: "Politics old",
          category: "politics",
          publishedAt: "2026-04-10T11:10:00.000Z",
          summary: "Updated politics summary",
        }),
        buildArticle({
          id: "business-old",
          title: "Business old",
          category: "business",
          publishedAt: "2026-04-10T10:20:00.000Z",
        }),
        buildArticle({
          id: "technology-old",
          title: "Technology old",
          category: "technology",
          publishedAt: "2026-04-10T10:00:00.000Z",
        }),
        buildArticle({
          id: "science-new",
          title: "Science new",
          category: "science",
          publishedAt: "2026-04-10T09:50:00.000Z",
        }),
      ],
    };

    const dashboardFeed = buildDashboardFeed({
      dataset: currentDataset,
      previousDataset,
      activeCategory: "all",
      refreshStatus,
    });

    expect(dashboardFeed.topHighlights).toHaveLength(5);
    expect(dashboardFeed.categoryLeaders).toHaveLength(5);
    expect(dashboardFeed.whatChanged.some((entry) => entry.status === "new")).toBe(true);
    expect(
      dashboardFeed.categoryLeaders.some((entry) =>
        entry.statuses.includes("leader-changed"),
      ),
    ).toBe(true);
    expect(dashboardFeed.latestStories).toHaveLength(5);
    expect(dashboardFeed.availableCategories).toEqual([
      "world",
      "politics",
      "business",
      "technology",
      "science",
    ]);
  });
});
