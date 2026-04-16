import { createNewsApiClient } from "@/lib/news/ingest/news-api-client";

function buildNewsApiResponse(title: string) {
  return {
    status: "ok",
    articles: [
      {
        source: {
          name: "Fixture Source",
        },
        title,
        url: `https://example.com/${title.toLowerCase().replaceAll(" ", "-")}`,
        publishedAt: "2026-04-16T12:00:00Z",
      },
    ],
  };
}

describe("createNewsApiClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(String(input));
        const country = url.searchParams.get("country");
        const from = url.searchParams.get("from");
        const title = country
          ? `Top ${country.toUpperCase()} story`
          : `Recent ${from} story`;

        return new Response(JSON.stringify(buildNewsApiResponse(title)), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches regional top headlines plus a three-day recent enrichment window", async () => {
    const client = createNewsApiClient({
      apiKey: "test-key",
      baseUrl: "https://newsapi.example.test/v2",
      countries: ["gb", "in"],
      historyDays: 3,
      now: new Date("2026-04-16T20:00:00.000Z"),
      pageSize: 2,
    });

    const articles = await client.fetchLatest(["business"]);
    const requestedUrls = vi
      .mocked(fetch)
      .mock.calls.map((call) => new URL(String(call[0])));

    expect(requestedUrls.map((url) => url.pathname)).toEqual([
      "/v2/everything",
      "/v2/top-headlines",
      "/v2/everything",
      "/v2/top-headlines",
    ]);
    expect(requestedUrls[0].searchParams.get("from")).toBe("2026-04-14");
    expect(requestedUrls[0].searchParams.get("sortBy")).toBe("publishedAt");
    expect(articles.map((article) => article.sourceCountry)).toEqual([
      "gb",
      "gb",
      "in",
      "in",
    ]);
    expect(articles.map((article) => article.category)).toEqual([
      "world",
      "business",
      "world",
      "business",
    ]);
  });
});
