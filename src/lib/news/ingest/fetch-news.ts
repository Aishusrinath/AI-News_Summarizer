import {
  rawNewsApiResponseSchema,
  type RawNewsApiResponse,
} from "@/lib/news/contracts/raw-schema";

export type FetchNewsOptions = {
  apiKey: string;
  baseUrl: string;
};

export async function fetchNews(_options: FetchNewsOptions): Promise<RawNewsApiResponse> {
  throw new Error(
    "Connect src/lib/news/fetch-news.ts to your chosen news API before running the live pipeline.",
  );
}

export function parseRawNewsApiResponse(input: unknown): RawNewsApiResponse {
  return rawNewsApiResponseSchema.parse(input);
}
