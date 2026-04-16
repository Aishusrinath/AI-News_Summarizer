import type { Category, RawArticle } from "@/lib/news/contracts/raw-schema";
import { supportedRegionValues } from "@/lib/news/contracts/regions";

export type NewsApiClientConfig = {
  apiKey: string;
  baseUrl: string;
  countries?: string[];
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

export const defaultNewsCountries = supportedRegionValues;
export const defaultNewsCategories: Category[] = [
  "general",
  "business",
  "technology",
  "science",
  "health",
];

function toAppCategory(category: Category): Category {
  return category === "general" ? "world" : category;
}

export function createNewsApiClient(config: NewsApiClientConfig) {
  const pageSize = config.pageSize ?? 10;
  const countries =
    config.countries && config.countries.length > 0
      ? config.countries
      : defaultNewsCountries;

  return {
    async fetchLatest(categories: Category[] = defaultNewsCategories): Promise<RawArticle[]> {
      const allArticles: RawArticle[] = [];

      for (const country of countries) {
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
              category: toAppCategory(category),
              sourceCountry: country,
            });
          }
        }
      }

      return allArticles;
    },
  };
}
