import { GET } from "@/app/api/snapshot/route";
import type {
  ProcessedDataset,
  RefreshStatus,
} from "@/lib/news/contracts/processed-schema";

const dataset: ProcessedDataset = {
  generatedAt: "2026-04-16T20:00:00.000Z",
  source: "Fixture",
  categories: ["world", "business"],
  counts: {
    fetched: 2,
    normalized: 2,
    dropped: 0,
    deduped: 2,
    summarizedWithAi: 1,
    fallbackSummaries: 1,
    finalArticles: 2,
  },
  articles: [
    {
      id: "us-story",
      slug: "us-story",
      title: "US story",
      sourceName: "Source",
      publishedAt: "2026-04-16T19:00:00.000Z",
      category: "world",
      url: "https://example.com/us-story",
      summary: "US story summary",
      summaryType: "ai",
      sourceCountry: "us",
    },
    {
      id: "in-story",
      slug: "in-story",
      title: "India story",
      sourceName: "Source",
      publishedAt: "2026-04-16T18:00:00.000Z",
      category: "business",
      url: "https://example.com/in-story",
      summary: "India story summary",
      summaryType: "fallback",
      sourceCountry: "in",
    },
  ],
};

const refreshStatus: RefreshStatus = {
  currentSnapshotId: dataset.generatedAt,
  previousSnapshotId: "2026-04-16T19:00:00.000Z",
  lastSuccessfulRefreshAt: dataset.generatedAt,
  lastAttemptedRefreshAt: dataset.generatedAt,
  isStale: false,
  status: "success",
};

vi.mock("@/lib/data/load-articles", () => ({
  loadArticles: vi.fn(async () => dataset),
  loadRefreshStatus: vi.fn(async () => refreshStatus),
}));

describe("GET /api/snapshot", () => {
  it("returns snapshot freshness, counts, categories, regions, and refresh status", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      generatedAt: "2026-04-16T20:00:00.000Z",
      articleCount: 2,
      source: "Fixture",
      categories: ["world", "business"],
      regions: ["us", "in"],
      refreshStatus,
      storage: "committed-json",
    });
  });
});
