import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";
import { summarizeArticles } from "@/lib/news/summarize/summarize-articles";

describe("summarizeArticles", () => {
  it("falls back to an extractive summary when the summarizer fails", async () => {
    const articles: NormalizedArticle[] = [
      {
        id: "story-1",
        slug: "story-1",
        title: "Transit service expands weekend operations",
        sourceName: "Daily Brief",
        publishedAt: "2026-04-07T08:15:00.000Z",
        category: "general",
        url: "https://example.com/transit",
        description: "Officials said the change will improve rider access.",
        summaryInput: {
          title: "Transit service expands weekend operations",
          description: "Officials said the change will improve rider access.",
        },
        qualityScore: 2,
        canonicalUrl: "https://example.com/transit",
      },
    ];

    const summarized = await summarizeArticles(articles, async () => {
      throw new Error("Provider unavailable");
    });

    expect(summarized[0].summaryType).toBe("fallback");
    expect(summarized[0].summary).toContain("Transit service expands weekend operations");
  });
});
