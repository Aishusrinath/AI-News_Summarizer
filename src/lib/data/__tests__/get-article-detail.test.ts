import { getArticleDetail } from "@/lib/data/get-article-detail";

vi.mock("@/lib/data/load-articles", () => ({
  loadArticles: vi.fn(async () => ({
    generatedAt: "2026-04-07T13:00:00.000Z",
    source: "Fixture dataset",
    categories: ["business"],
    counts: {
      fetched: 3,
      normalized: 3,
      dropped: 0,
      deduped: 3,
      summarizedWithAi: 2,
      fallbackSummaries: 1,
      finalArticles: 3,
    },
    articles: [
      {
        id: "selected-article",
        slug: "selected-story",
        title: "Selected story",
        sourceName: "Fixture Source",
        publishedAt: "2026-04-07T12:00:00.000Z",
        category: "business",
        url: "https://example.com/selected-story",
        summary: "A deterministic summary for testing.",
        summaryType: "ai",
      },
      {
        id: "related-article",
        slug: "related-story",
        title: "Related story",
        sourceName: "Fixture Source",
        publishedAt: "2026-04-07T11:00:00.000Z",
        category: "business",
        url: "https://example.com/related-story",
        summary: "A related summary for testing.",
        summaryType: "fallback",
      },
    ],
  })),
  loadRefreshStatus: vi.fn(async () => ({
    currentSnapshotId: "2026-04-07T13:00:00.000Z",
    previousSnapshotId: null,
    lastSuccessfulRefreshAt: "2026-04-07T13:00:00.000Z",
    lastAttemptedRefreshAt: "2026-04-07T13:00:00.000Z",
    isStale: false,
    status: "success",
  })),
}));

describe("getArticleDetail", () => {
  it("returns the selected article with related stories from the same category", async () => {
    const detail = await getArticleDetail("selected-story");

    expect(detail).not.toBeNull();
    expect(detail?.article.id).toBe("selected-article");
    expect(detail?.relatedStories.every((story) => story.slug !== detail.article.slug)).toBe(
      true,
    );
    expect(
      detail?.relatedStories.every((story) => story.category === detail.article.category),
    ).toBe(true);
  });
});
