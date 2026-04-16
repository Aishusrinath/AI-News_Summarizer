import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";

export const SUMMARY_ARTICLE_LIMIT = 40;

function getSummaryPriority(article: NormalizedArticle): number {
  const publishedMs = new Date(article.publishedAt).getTime();
  const ageHours = Math.max(0, (Date.now() - publishedMs) / (1000 * 60 * 60));
  const recencyScore = Math.max(0, 72 - ageHours);

  return recencyScore + article.qualityScore * 4;
}

export function selectArticlesForSummary(
  articles: NormalizedArticle[],
  limit = SUMMARY_ARTICLE_LIMIT,
) {
  return [...articles]
    .sort((left, right) => {
      const scoreDifference = getSummaryPriority(right) - getSummaryPriority(left);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    })
    .slice(0, limit);
}
