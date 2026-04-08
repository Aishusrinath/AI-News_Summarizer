import type { Category, RawArticle } from "@/lib/news/contracts/raw-schema";

export type NewsApiClientConfig = {
  apiKey: string;
  baseUrl: string;
  country?: string;
  pageSize?: number;
};

type NewsApiArticle = {
  source?: { id?: string | null; name?: string | null };
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  content?: string | null;
};

type NewsApiResponse = {
  status: string;
  code?: string;
  message?: string;
  articles?: NewsApiArticle[];
};

const supportedCategories: Category[] = ["general", "technology", "business"];

export function createNewsApiClient(config: NewsApiClientConfig) {
  const pageSize = config.pageSize ?? 10;
  const country = config.country ?? "us";

  return {
    async fetchLatest(categories: Category[] = supportedCategories): Promise<RawArticle[]> {
      const allArticles: RawArticle[] = [];

      for (const category of categories) {
        const params = new URLSearchParams({
          country,
          category,
          pageSize: String(pageSize),
        });

        const response = await fetch(`${config.baseUrl}/top-headlines?${params.toString()}`, {
          headers: {
            "X-Api-Key": config.apiKey,
          },
        });

        const payload = (await response.json()) as NewsApiResponse;

        if (!response.ok || payload.status !== "ok") {
          const message = payload.message ?? `NewsAPI request failed with status ${response.status}`;
          throw new Error(message);
        }

        for (const article of payload.articles ?? []) {
          allArticles.push({
            ...article,
            category,
          });
        }
      }

      return allArticles;
    },
  };
}
