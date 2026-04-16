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
});
