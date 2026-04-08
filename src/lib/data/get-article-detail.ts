import { loadArticles } from "@/lib/data/load-articles";

export async function getArticleDetail(slug: string) {
  const dataset = await loadArticles();

  return dataset.articles.find((article) => article.slug === slug) ?? null;
}
