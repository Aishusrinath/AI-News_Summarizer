import {
  createNewsRefreshService,
  type NewsSourcePort,
} from "@/lib/news/pipeline/news-refresh-service";
import type { RawArticle, RawNewsApiResponse } from "@/lib/news/contracts/raw-schema";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import type { SnapshotStore } from "@/lib/storage/snapshot-store";

function buildRawArticle(input: {
  title: string;
  url: string;
  category?: string;
  publishedAt?: string;
  sourceCountry?: string;
}): RawArticle {
  return {
    source: {
      name: "Fixture Source",
    },
    title: input.title,
    description: `${input.title} description`,
    url: input.url,
    publishedAt: input.publishedAt ?? "2026-04-16T20:00:00.000Z",
    category: input.category ?? "technology",
    sourceCountry: input.sourceCountry ?? "us",
  };
}

function createSnapshotStore(currentSnapshot: ProcessedDataset | null = null): SnapshotStore {
  return {
    getCurrentSnapshot: vi.fn(async () => currentSnapshot),
    getPreviousSnapshot: vi.fn(),
    getRefreshStatus: vi.fn(),
    publishSnapshot: vi.fn(),
    markRefreshFailure: vi.fn(),
  };
}

describe("createNewsRefreshService", () => {
  const rawNews: RawNewsApiResponse = {
    status: "ok",
    articles: [
      buildRawArticle({
        title: "AI chip exports expand",
        url: "https://example.com/ai-chip-exports",
      }),
      buildRawArticle({
        title: "Fallback provider story",
        url: "https://example.com/fallback-provider-story",
      }),
    ],
  };

  it("refreshes news into a processed dataset and publishes it by default", async () => {
    const snapshotStore = createSnapshotStore();
    const newsSource: NewsSourcePort = {
      fetchNews: vi.fn(async () => rawNews),
    };
    const service = createNewsRefreshService({
      newsSource,
      snapshotStore,
      clock: {
        now: () => "2026-04-16T21:00:00.000Z",
      },
      summarizerConfig: {
        provider: "gemini",
        source: "Fixture pipeline",
        summarizeArticle: vi.fn(async (article) => {
          if (article.title.includes("Fallback")) {
            throw new Error("Provider unavailable");
          }

          return `AI summary for ${article.title}`;
        }),
      },
    });

    const dataset = await service.refresh();

    expect(newsSource.fetchNews).toHaveBeenCalledTimes(1);
    expect(dataset).toMatchObject({
      generatedAt: "2026-04-16T21:00:00.000Z",
      source: "Fixture pipeline",
      categories: ["technology"],
      counts: {
        fetched: 2,
        normalized: 2,
        dropped: 0,
        deduped: 2,
        summarizedWithAi: 1,
        fallbackSummaries: 1,
        finalArticles: 2,
      },
    });
    expect(dataset.articles.map((article) => article.summaryType)).toEqual([
      "ai",
      "fallback",
    ]);
    expect(snapshotStore.publishSnapshot).toHaveBeenCalledWith(dataset);
  });

  it("can refresh without publishing for diagnostics", async () => {
    const snapshotStore = createSnapshotStore();
    const service = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => rawNews),
      },
      snapshotStore,
      clock: {
        now: () => "2026-04-16T21:00:00.000Z",
      },
      summarizerConfig: {
        provider: "ollama",
        source: "Fixture pipeline",
        summarizeArticle: vi.fn(async (article) => `Summary for ${article.title}`),
      },
    });

    await service.refresh({ publish: false });

    expect(snapshotStore.publishSnapshot).not.toHaveBeenCalled();
  });

  it("keeps extra final articles with fallback summaries after the AI summary cap", async () => {
    const snapshotStore = createSnapshotStore();
    const rawArticles = Array.from({ length: 3 }, (_, index) =>
      buildRawArticle({
        title: `Regional story ${index + 1}`,
        url: `https://example.com/regional-story-${index + 1}`,
      }),
    );
    const service = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => ({
          status: "ok",
          articles: rawArticles,
        })),
      },
      snapshotStore,
      clock: {
        now: () => "2026-04-16T21:00:00.000Z",
      },
      maxFinalArticles: 3,
      summaryArticleLimit: 1,
      summarizerConfig: {
        provider: "gemini",
        source: "Fixture pipeline",
        summarizeArticle: vi.fn(async (article) => `AI summary for ${article.title}`),
      },
    });

    const dataset = await service.refresh({ publish: false });

    expect(dataset.articles).toHaveLength(3);
    expect(dataset.counts).toMatchObject({
      summarizedWithAi: 1,
      fallbackSummaries: 2,
      finalArticles: 3,
    });
    expect(dataset.articles.map((article) => article.summaryType)).toEqual([
      "ai",
      "fallback",
      "fallback",
    ]);
  });

  it("reuses existing AI summaries before spending provider calls", async () => {
    const firstSummarizer = vi.fn(async (article) => `Cached AI summary for ${article.title}`);
    const firstService = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => ({
          status: "ok",
          articles: [
            buildRawArticle({
              title: "Reusable story",
              url: "https://example.com/reusable-story",
            }),
          ],
        })),
      },
      snapshotStore: createSnapshotStore(),
      clock: {
        now: () => "2026-04-16T21:00:00.000Z",
      },
      summarizerConfig: {
        provider: "gemini",
        source: "Fixture pipeline",
        summarizeArticle: firstSummarizer,
      },
    });
    const firstDataset = await firstService.refresh({ publish: false });
    const secondSummarizer = vi.fn(async (article) => `New AI summary for ${article.title}`);
    const secondService = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => ({
          status: "ok",
          articles: [
            buildRawArticle({
              title: "Reusable story",
              url: "https://example.com/reusable-story",
            }),
          ],
        })),
      },
      snapshotStore: createSnapshotStore(firstDataset),
      clock: {
        now: () => "2026-04-16T22:00:00.000Z",
      },
      summarizerConfig: {
        provider: "gemini",
        source: "Fixture pipeline",
        summarizeArticle: secondSummarizer,
      },
    });

    const secondDataset = await secondService.refresh({ publish: false });

    expect(firstSummarizer).toHaveBeenCalledTimes(1);
    expect(secondSummarizer).not.toHaveBeenCalled();
    expect(secondDataset.articles[0]).toMatchObject({
      summary: "Cached AI summary for Reusable story",
      summaryType: "ai",
    });
  });

  it("keeps recent articles from the previous snapshot during rotating refreshes", async () => {
    const existingService = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => ({
          status: "ok",
          articles: [
            buildRawArticle({
              title: "India retained story",
              url: "https://example.com/india-retained-story",
              publishedAt: "2026-04-15T18:00:00.000Z",
              sourceCountry: "in",
            }),
            buildRawArticle({
              title: "Expired story",
              url: "https://example.com/expired-story",
              publishedAt: "2026-04-10T18:00:00.000Z",
              sourceCountry: "gb",
            }),
          ],
        })),
      },
      snapshotStore: createSnapshotStore(),
      clock: {
        now: () => "2026-04-16T21:00:00.000Z",
      },
      summarizerConfig: {
        provider: "gemini",
        source: "Fixture pipeline",
        summarizeArticle: vi.fn(async (article) => `AI summary for ${article.title}`),
      },
    });
    const existingSnapshot = await existingService.refresh({ publish: false });
    const rotatingService = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => ({
          status: "ok",
          articles: [
            buildRawArticle({
              title: "Fresh US story",
              url: "https://example.com/fresh-us-story",
              publishedAt: "2026-04-16T20:00:00.000Z",
              sourceCountry: "us",
            }),
          ],
        })),
      },
      snapshotStore: createSnapshotStore(existingSnapshot),
      clock: {
        now: () => "2026-04-16T22:00:00.000Z",
      },
      historyDays: 3,
      summarizerConfig: {
        provider: "gemini",
        source: "Fixture pipeline",
        summarizeArticle: vi.fn(async (article) => `AI summary for ${article.title}`),
      },
    });

    const dataset = await rotatingService.refresh({ publish: false });

    expect(dataset.articles.map((article) => article.title)).toEqual([
      "Fresh US story",
      "India retained story",
    ]);
    expect(dataset.articles.map((article) => article.sourceCountry)).toEqual([
      "us",
      "in",
    ]);
  });

  it("marks refresh failures through the configured snapshot store", async () => {
    const snapshotStore = createSnapshotStore();
    const service = createNewsRefreshService({
      newsSource: {
        fetchNews: vi.fn(async () => rawNews),
      },
      snapshotStore,
      summarizerConfig: {
        provider: "openai",
        source: "Fixture pipeline",
        summarizeArticle: vi.fn(async (article) => `Summary for ${article.title}`),
      },
    });

    await service.markFailure("NewsAPI failed");

    expect(snapshotStore.markRefreshFailure).toHaveBeenCalledWith("NewsAPI failed");
  });
});
