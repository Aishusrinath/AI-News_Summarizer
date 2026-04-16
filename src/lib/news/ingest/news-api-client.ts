import type { Category, RawArticle } from "@/lib/news/contracts/raw-schema";
import {
  regionLabels,
  supportedRegionValues,
  type SupportedRegion,
} from "@/lib/news/contracts/regions";

export type NewsApiClientConfig = {
  apiKey: string;
  baseUrl: string;
  countries?: string[];
  historyDays?: number;
  now?: Date;
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
export const defaultNewsHistoryDays = 3;
export const defaultNewsCategories: Category[] = [
  "general",
  "business",
  "technology",
  "science",
  "health",
];

const regionSearchTerms: Record<SupportedRegion, string> = {
  us: '"United States" OR America',
  gb: '"United Kingdom" OR Britain OR UK',
  ca: 'Canada',
  au: 'Australia',
  in: 'India',
};

function toAppCategory(category: Category): Category {
  return category === "general" ? "world" : category;
}

function formatDateForNewsApi(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildFromDate(now: Date, historyDays: number) {
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - Math.max(0, historyDays - 1));
  return formatDateForNewsApi(fromDate);
}

function isSupportedCountry(country: string): country is SupportedRegion {
  return supportedRegionValues.includes(country as SupportedRegion);
}

export function createNewsApiClient(config: NewsApiClientConfig) {
  const pageSize = config.pageSize ?? 10;
  const historyDays = config.historyDays ?? defaultNewsHistoryDays;
  const now = config.now ?? new Date();
  const countries =
    config.countries && config.countries.length > 0
      ? config.countries
      : defaultNewsCountries;
  const from = buildFromDate(now, historyDays);

  async function requestArticles(
    endpoint: "everything" | "top-headlines",
    params: URLSearchParams,
  ) {
    const response = await fetch(`${config.baseUrl}/${endpoint}?${params.toString()}`, {
      headers: {
        "X-Api-Key": config.apiKey,
      },
    });

    const payload = (await response.json()) as NewsApiResponse;

    if (!response.ok || payload.status !== "ok") {
      const message =
        payload.message ?? `NewsAPI request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload.articles ?? [];
  }

  async function fetchTopHeadlines(country: string, category: Category) {
    return requestArticles(
      "top-headlines",
      new URLSearchParams({
        country,
        category,
        pageSize: String(pageSize),
      }),
    );
  }

  async function fetchRecentEverything(country: string) {
    if (!isSupportedCountry(country)) {
      return [];
    }

    return requestArticles(
      "everything",
      new URLSearchParams({
        q: `(${regionSearchTerms[country]}) AND news`,
        from,
        language: "en",
        pageSize: String(pageSize),
        sortBy: "publishedAt",
      }),
    );
  }

  return {
    async fetchLatest(categories: Category[] = defaultNewsCategories): Promise<RawArticle[]> {
      const allArticles: RawArticle[] = [];

      for (const country of countries) {
        try {
          const recentArticles = await fetchRecentEverything(country);

          for (const article of recentArticles) {
            allArticles.push({
              ...article,
              category: "world",
              sourceCountry: country,
            });
          }
        } catch (error) {
          const regionLabel = isSupportedCountry(country)
            ? regionLabels[country]
            : country;
          const message =
            error instanceof Error ? error.message : "Unknown NewsAPI error";

          console.warn(
            `Skipping ${historyDays}-day enrichment for ${regionLabel}: ${message}`,
          );
        }

        for (const category of categories) {
          const topHeadlines = await fetchTopHeadlines(country, category);

          for (const article of topHeadlines) {
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
