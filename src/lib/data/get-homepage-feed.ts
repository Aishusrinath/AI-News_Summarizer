import { categorySchema, type Category } from "@/lib/news/contracts/raw-schema";

import { loadArticles } from "@/lib/data/load-articles";

type HomePageCategory = Category | "all";

function getActiveCategory(category?: string): HomePageCategory {
  if (!category) {
    return "all";
  }

  const parsed = categorySchema.safeParse(category);
  return parsed.success ? parsed.data : "all";
}

export async function getHomepageFeed(category?: string) {
  const dataset = await loadArticles();
  const activeCategory = getActiveCategory(category);

  const articles =
    activeCategory === "all"
      ? dataset.articles
      : dataset.articles.filter((article) => article.category === activeCategory);

  return {
    dataset,
    articles,
    activeCategory,
  };
}
