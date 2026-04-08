import rawApiResponse from "@/lib/news/__tests__/fixtures/raw-api-response.json";
import { normalizeArticles } from "@/lib/news/etl/normalize-articles";
import type { RawArticle } from "@/lib/news/contracts/raw-schema";

describe("normalizeArticles", () => {
  it("builds validated normalized records from realistic raw API input", () => {
    const normalized = normalizeArticles(rawApiResponse.articles);

    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      title: "New battery breakthrough could reduce charging times",
      category: "technology",
      sourceName: "Tech Ledger",
    });
    expect(normalized[0].slug).toContain("new-battery-breakthrough");
  });

  it("drops articles missing required identity or date fields", () => {
    const rawArticles: RawArticle[] = [
      {
        source: { name: "Valid Source" },
        title: "Valid story",
        url: "https://example.com/valid-story",
        publishedAt: "2026-04-08T10:00:00.000Z",
        category: "technology",
      },
      {
        source: { name: "Missing URL" },
        title: "Broken story",
        publishedAt: "2026-04-08T09:00:00.000Z",
        category: "technology",
      },
      {
        source: { name: "Missing date" },
        title: "Another broken story",
        url: "https://example.com/broken-story",
        category: "technology",
      },
    ];

    const normalized = normalizeArticles(rawArticles);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].title).toBe("Valid story");
  });

  it("maps unsupported or missing categories to general", () => {
    const rawArticles: RawArticle[] = [
      {
        source: { name: "Unknown Category Source" },
        title: "Story one",
        url: "https://example.com/story-one",
        publishedAt: "2026-04-08T10:00:00.000Z",
        category: "politics",
      },
      {
        source: { name: "Missing Category Source" },
        title: "Story two",
        url: "https://example.com/story-two",
        publishedAt: "2026-04-08T09:00:00.000Z",
      },
    ];

    const normalized = normalizeArticles(rawArticles);

    expect(normalized).toHaveLength(2);
    expect(normalized[0].category).toBe("general");
    expect(normalized[1].category).toBe("general");
  });
});
