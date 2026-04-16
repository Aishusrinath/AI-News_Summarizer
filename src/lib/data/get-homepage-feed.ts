import {
  supportedCategorySchema,
  type SupportedCategory,
} from "@/lib/news/contracts/raw-schema";
import { buildDashboardFeed } from "@/lib/data/dashboard";

import {
  loadArticles,
  loadPreviousSnapshot,
  loadRefreshStatus,
} from "@/lib/data/load-articles";

type HomePageCategory = SupportedCategory | "all";

function getActiveCategory(category?: string): HomePageCategory {
  if (!category) {
    return "all";
  }

  const parsed = supportedCategorySchema.safeParse(category);
  return parsed.success ? parsed.data : "all";
}

export async function getHomepageFeed(category?: string) {
  const [dataset, previousDataset, refreshStatus] = await Promise.all([
    loadArticles(),
    loadPreviousSnapshot(),
    loadRefreshStatus(),
  ]);
  const activeCategory = getActiveCategory(category);

  return buildDashboardFeed({
    dataset,
    previousDataset,
    activeCategory,
    refreshStatus,
  });
}
