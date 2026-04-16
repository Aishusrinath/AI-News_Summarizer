import {
  supportedCategorySchema,
  type SupportedCategory,
} from "@/lib/news/contracts/raw-schema";
import {
  isSupportedRegion,
  type SupportedRegion,
} from "@/lib/news/contracts/regions";
import { buildDashboardFeed } from "@/lib/data/dashboard";

import {
  loadArticles,
  loadPreviousSnapshot,
  loadRefreshStatus,
} from "@/lib/data/load-articles";

type HomePageCategory = SupportedCategory | "all";
type HomePageRegion = SupportedRegion | "all";

function getActiveCategory(category?: string): HomePageCategory {
  if (!category) {
    return "all";
  }

  const parsed = supportedCategorySchema.safeParse(category);
  return parsed.success ? parsed.data : "all";
}

function getActiveRegion(region?: string): HomePageRegion {
  if (!region) {
    return "all";
  }

  const normalizedRegion = region.trim().toLowerCase();
  return isSupportedRegion(normalizedRegion) ? normalizedRegion : "all";
}

export async function getHomepageFeed(category?: string, region?: string) {
  const [dataset, previousDataset, refreshStatus] = await Promise.all([
    loadArticles(),
    loadPreviousSnapshot(),
    loadRefreshStatus(),
  ]);
  const activeCategory = getActiveCategory(category);
  const activeRegion = getActiveRegion(region);

  return buildDashboardFeed({
    dataset,
    previousDataset,
    activeCategory,
    activeRegion,
    refreshStatus,
  });
}
