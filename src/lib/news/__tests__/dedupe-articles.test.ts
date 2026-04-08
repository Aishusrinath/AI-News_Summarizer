import { dedupeArticles } from "@/lib/news/etl/dedupe-articles";
import { normalizeArticles } from "@/lib/news/etl/normalize-articles";
import type { RawArticle } from "@/lib/news/contracts/raw-schema";
import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";

describe("dedupeArticles", () => {
  it("keeps the higher-quality article when ids collide", () => {
    const articles: NormalizedArticle[] = [
      {
        id: "same-id",
        slug: "story-sameid",
        title: "Story",
        sourceName: "Source",
        publishedAt: "2026-04-07T10:00:00.000Z",
        category: "general",
        url: "https://example.com/story",
        summaryInput: { title: "Story" },
        qualityScore: 1,
        canonicalUrl: "https://example.com/story",
      },
      {
        id: "same-id",
        slug: "story-sameid",
        title: "Story",
        sourceName: "Source",
        publishedAt: "2026-04-07T11:00:00.000Z",
        category: "general",
        url: "https://example.com/story",
        description: "More detail",
        cleanedText: "Longer excerpt",
        summaryInput: { title: "Story", description: "More detail", cleanedText: "Longer excerpt" },
        qualityScore: 4,
        canonicalUrl: "https://example.com/story",
      },
    ];

    const deduped = dedupeArticles(articles);

    expect(deduped).toHaveLength(1);
    expect(deduped[0].qualityScore).toBe(4);
  });

  it("deduplicates articles by canonical URL", () => {
    const rawArticles: RawArticle[] = [
      {
        source: { name: "Source" },
        title: "Story",
        url: "https://example.com/story?utm_source=newsletter",
        publishedAt: "2026-04-08T10:00:00.000Z",
        description: "Short version",
        category: "technology",
      },
      {
        source: { name: "Source" },
        title: "Story",
        url: "https://example.com/story/",
        publishedAt: "2026-04-08T10:05:00.000Z",
        description: "Better version",
        content: "Longer excerpt for the same story.",
        category: "technology",
      },
    ];

    const normalized = normalizeArticles(rawArticles);
    const deduped = dedupeArticles(normalized);

    expect(deduped).toHaveLength(1);
    expect(deduped[0].canonicalUrl).toBe("https://example.com/story");
    expect(deduped[0].description).toBe("Better version");
  });

  it("returns deduped articles sorted by published date descending", () => {
    const rawArticles: RawArticle[] = [
      {
        source: { name: "Source" },
        title: "Old story",
        url: "https://example.com/old-story",
        publishedAt: "2026-04-08T08:00:00.000Z",
        category: "general",
      },
      {
        source: { name: "Source" },
        title: "Newest story",
        url: "https://example.com/newest-story",
        publishedAt: "2026-04-08T12:00:00.000Z",
        category: "general",
      },
      {
        source: { name: "Source" },
        title: "Middle story",
        url: "https://example.com/middle-story",
        publishedAt: "2026-04-08T10:00:00.000Z",
        category: "general",
      },
    ];

    const normalized = normalizeArticles(rawArticles);
    const deduped = dedupeArticles(normalized);

    expect(deduped.map((article) => article.title)).toEqual([
      "Newest story",
      "Middle story",
      "Old story",
    ]);
  });
});
