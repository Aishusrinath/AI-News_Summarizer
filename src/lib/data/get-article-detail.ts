import { canonicalizeCategory, type Category } from "@/lib/news/contracts/raw-schema";

import { loadArticles, loadRefreshStatus } from "@/lib/data/load-articles";

const RELATED_STORIES_LIMIT = 4;

function rankRelatedStories(
  slug: string,
  category: Category,
  articles: Awaited<ReturnType<typeof loadArticles>>["articles"],
) {
  return [...articles]
    .filter(
      (candidate) =>
        candidate.slug !== slug &&
        canonicalizeCategory(candidate.category) === canonicalizeCategory(category),
    )
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
    )
    .slice(0, RELATED_STORIES_LIMIT);
}

export async function getArticleDetail(slug: string) {
  const [dataset, refreshStatus] = await Promise.all([
    loadArticles(),
    loadRefreshStatus(),
  ]);

  const article = dataset.articles.find((entry) => entry.slug === slug) ?? null;

  if (!article) {
    return null;
  }

  return {
    article,
    relatedStories: rankRelatedStories(article.slug, article.category, dataset.articles),
    refreshStatus,
    snapshotGeneratedAt: dataset.generatedAt,
  };
}
