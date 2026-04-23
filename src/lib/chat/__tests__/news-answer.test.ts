import { answerNewsQuestion } from "@/lib/chat/news-answer";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";

function buildArticle(input: {
  id: string;
  slug: string;
  title: string;
  category: "world" | "politics" | "business" | "technology" | "science" | "health";
  summary: string;
  publishedAt: string;
}) {
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    sourceName: "Source",
    publishedAt: input.publishedAt,
    category: input.category,
    url: `https://example.com/${input.slug}`,
    summary: input.summary,
    summaryType: "ai" as const,
    description: `${input.title} description`,
  };
}

describe("answerNewsQuestion", () => {
  it("returns grounded answers with sources from the current snapshot", () => {
    const currentDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: ["technology", "business"],
      counts: {
        fetched: 2,
        normalized: 2,
        dropped: 0,
        deduped: 2,
        summarizedWithAi: 2,
        fallbackSummaries: 0,
        finalArticles: 2,
      },
      articles: [
        buildArticle({
          id: "tech-1",
          slug: "tech-1",
          title: "AI chip demand rises",
          category: "technology",
          summary: "Demand for AI chips increased in the latest snapshot.",
          publishedAt: "2026-04-10T11:00:00.000Z",
        }),
        buildArticle({
          id: "biz-1",
          slug: "biz-1",
          title: "Markets react to rates",
          category: "business",
          summary: "Markets reacted sharply to the latest rate expectations.",
          publishedAt: "2026-04-10T10:00:00.000Z",
        }),
      ],
    };

    const response = answerNewsQuestion({
      message: "Summarize the top technology stories.",
      currentDataset,
      previousDataset: null,
      routingReason: "Routed to News Model.",
    });

    expect(response.mode).toBe("news");
    expect(response.groundingStatus).toBe("grounded");
    expect(response.sources.length).toBeGreaterThan(0);
    expect(response.sources.some((source) => source.id === "tech-1")).toBe(true);
    expect(response.answer).toContain("Grounded snapshot briefing:");
    expect(response.answer).toContain("Key takeaway:");
    expect(response.answer).toContain("AI chip demand rises");
  });

  it("does not present unrelated latest stories as grounded support", () => {
    const currentDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: ["technology", "business"],
      counts: {
        fetched: 2,
        normalized: 2,
        dropped: 0,
        deduped: 2,
        summarizedWithAi: 2,
        fallbackSummaries: 0,
        finalArticles: 2,
      },
      articles: [
        buildArticle({
          id: "tech-1",
          slug: "tech-1",
          title: "AI chip demand rises",
          category: "technology",
          summary: "Demand for AI chips increased in the latest snapshot.",
          publishedAt: "2026-04-10T11:00:00.000Z",
        }),
        buildArticle({
          id: "biz-1",
          slug: "biz-1",
          title: "Markets react to rates",
          category: "business",
          summary: "Markets reacted sharply to the latest rate expectations.",
          publishedAt: "2026-04-10T10:00:00.000Z",
        }),
      ],
    };

    const response = answerNewsQuestion({
      message: "What is happening in Toronto sports?",
      currentDataset,
      previousDataset: null,
      routingReason: "Routed to News Model.",
    });

    expect(response.groundingStatus).toBe("insufficient");
    expect(response.sources).toEqual([]);
  });

  it("does not fill narrow election questions with generic latest coverage", () => {
    const currentDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: ["politics", "world"],
      counts: {
        fetched: 2,
        normalized: 2,
        dropped: 0,
        deduped: 2,
        summarizedWithAi: 2,
        fallbackSummaries: 0,
        finalArticles: 2,
      },
      articles: [
        buildArticle({
          id: "politics-1",
          slug: "politics-1",
          title: "Campaign finance debate continues",
          category: "politics",
          summary: "Lawmakers discussed national campaign finance rules.",
          publishedAt: "2026-04-10T11:00:00.000Z",
        }),
        buildArticle({
          id: "world-1",
          slug: "world-1",
          title: "Global markets react to conflict",
          category: "world",
          summary: "International markets reacted to the latest conflict updates.",
          publishedAt: "2026-04-10T10:00:00.000Z",
        }),
      ],
    };

    const response = answerNewsQuestion({
      message: "latest update of Tamilnadu elections",
      currentDataset,
      previousDataset: null,
      routingReason: "Routed to News Model.",
    });

    expect(response.groundingStatus).toBe("insufficient");
    expect(response.sources).toEqual([]);
  });

  it("does not let conversational phrasing create fake grounding for narrow election questions", () => {
    const currentDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: ["world", "technology"],
      counts: {
        fetched: 2,
        normalized: 2,
        dropped: 0,
        deduped: 2,
        summarizedWithAi: 2,
        fallbackSummaries: 0,
        finalArticles: 2,
      },
      articles: [
        buildArticle({
          id: "world-1",
          slug: "world-1",
          title: "Ships reportedly attacked in key oil route",
          category: "world",
          summary: "What happened in the oil route shocked markets overnight.",
          publishedAt: "2026-04-10T11:00:00.000Z",
        }),
        buildArticle({
          id: "tech-1",
          slug: "tech-1",
          title: "Oppo zoom comparison stuns camera reviewers",
          category: "technology",
          summary: "A reviewer compared a flagship phone camera against pro gear.",
          publishedAt: "2026-04-10T10:00:00.000Z",
        }),
      ],
    };

    const response = answerNewsQuestion({
      message: "whats latest update of tamilnadu elections?",
      currentDataset,
      previousDataset: null,
      routingReason: "Routed to News Model.",
    });

    expect(response.groundingStatus).toBe("insufficient");
    expect(response.sources).toEqual([]);
  });

  it("does not ground category-specific news questions on the wrong category", () => {
    const currentDataset: ProcessedDataset = {
      generatedAt: "2026-04-10T12:00:00.000Z",
      source: "Fixture",
      categories: ["world", "health"],
      counts: {
        fetched: 2,
        normalized: 2,
        dropped: 0,
        deduped: 2,
        summarizedWithAi: 2,
        fallbackSummaries: 0,
        finalArticles: 2,
      },
      articles: [
        buildArticle({
          id: "world-1",
          slug: "world-1",
          title: "Advisor platform expands AI planning tools",
          category: "world",
          summary: "A financial platform announced new AI planning capabilities.",
          publishedAt: "2026-04-10T11:00:00.000Z",
        }),
        buildArticle({
          id: "health-1",
          slug: "health-1",
          title: "New cancer screening guidance released",
          category: "health",
          summary: "Doctors published updated cancer screening guidance.",
          publishedAt: "2026-04-10T10:00:00.000Z",
        }),
      ],
    };

    const response = answerNewsQuestion({
      message: "Summarize the top technology stories.",
      currentDataset,
      previousDataset: null,
      routingReason: "Routed to News Model.",
    });

    expect(response.groundingStatus).toBe("insufficient");
    expect(response.sources).toEqual([]);
  });
});
