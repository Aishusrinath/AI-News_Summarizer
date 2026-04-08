import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";

export function selectTopStories(
  articles: NormalizedArticle[],
  limit: number,
): NormalizedArticle[] {
  return articles.slice(0, limit);
}
