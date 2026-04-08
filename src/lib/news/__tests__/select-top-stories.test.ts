import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";
import { selectTopStories } from "@/lib/news/etl/select-top-stories";

describe("selectTopStories", () => {
  it("returns only the requested number of top stories from an already sorted list", () => {
    const articles: NormalizedArticle[] = [
      {
        id: "1",
        slug: "story-1",
        title: "Story 1",
        sourceName: "Source",
        publishedAt: "2026-04-08T12:00:00.000Z",
        category: "general",
        url: "https://example.com/1",
        summaryInput: { title: "Story 1" },
        qualityScore: 1,
        canonicalUrl: "https://example.com/1",
      },
      {
        id: "2",
        slug: "story-2",
        title: "Story 2",
        sourceName: "Source",
        publishedAt: "2026-04-08T11:00:00.000Z",
        category: "general",
        url: "https://example.com/2",
        summaryInput: { title: "Story 2" },
        qualityScore: 1,
        canonicalUrl: "https://example.com/2",
      },
      {
        id: "3",
        slug: "story-3",
        title: "Story 3",
        sourceName: "Source",
        publishedAt: "2026-04-08T10:00:00.000Z",
        category: "general",
        url: "https://example.com/3",
        summaryInput: { title: "Story 3" },
        qualityScore: 1,
        canonicalUrl: "https://example.com/3",
      },
    ];

    const topStories = selectTopStories(articles, 2);

    expect(topStories).toHaveLength(2);
    expect(topStories.map((article) => article.title)).toEqual(["Story 1", "Story 2"]);
  });
});
