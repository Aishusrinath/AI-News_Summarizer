import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";

function compareArticles(current: NormalizedArticle, candidate: NormalizedArticle): number {
  if (candidate.qualityScore !== current.qualityScore) {
    return candidate.qualityScore - current.qualityScore;
  }

  return (
    new Date(candidate.publishedAt).getTime() - new Date(current.publishedAt).getTime()
  );
}

export function dedupeArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
  const deduped = new Map<string, NormalizedArticle>();

  for (const article of articles) {
    const existing = deduped.get(article.id);

    if (!existing || compareArticles(existing, article) > 0) {
      deduped.set(article.id, article);
    }
  }

  return [...deduped.values()].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}
