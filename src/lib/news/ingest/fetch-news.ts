import {
  rawNewsApiResponseSchema,
  type Category,
  type RawNewsApiResponse,
} from "@/lib/news/contracts/raw-schema";
import { createNewsApiClient } from "@/lib/news/ingest/news-api-client";

export type FetchNewsOptions = {
  apiKey: string;
  baseUrl: string;
  categories?: Category[];
  country?: string;
  pageSize?: number;
};

export async function fetchNews(options: FetchNewsOptions): Promise<RawNewsApiResponse> {
  const client = createNewsApiClient({
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    country: options.country,
    pageSize: options.pageSize,
  });

  return {
    status: "ok",
    articles: await client.fetchLatest(options.categories),
  };
}

export function parseRawNewsApiResponse(input: unknown): RawNewsApiResponse {
  return rawNewsApiResponseSchema.parse(input);
}
