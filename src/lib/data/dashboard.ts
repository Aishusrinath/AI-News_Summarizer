import {
  categoryLabels,
  canonicalizeCategory,
  sortSupportedCategories,
  type SupportedCategory,
} from "@/lib/news/contracts/raw-schema";
import {
  isSupportedRegion,
  regionLabels,
  supportedRegionValues,
  sortSupportedRegions,
  type SupportedRegion,
} from "@/lib/news/contracts/regions";
import type {
  ProcessedArticle,
  ProcessedDataset,
  RefreshStatus,
} from "@/lib/news/contracts/processed-schema";

export type StoryStatus = "new" | "moved-up" | "leader-changed" | "updated";

export type DashboardStory = {
  article: ProcessedArticle;
  statuses: StoryStatus[];
};

export type DashboardChange = {
  article: ProcessedArticle;
  status: StoryStatus;
  detail: string;
};

export type DashboardFeed = {
  dataset: ProcessedDataset;
  activeCategory: SupportedCategory | "all";
  activeRegion: SupportedRegion | "all";
  refreshStatus: RefreshStatus;
  topHighlights: DashboardStory[];
  categoryLeaders: DashboardStory[];
  whatChanged: DashboardChange[];
  latestStories: DashboardStory[];
  availableCategories: SupportedCategory[];
  availableRegions: SupportedRegion[];
  emptyStateDescription: string;
};

type DashboardFeedInput = {
  dataset: ProcessedDataset;
  previousDataset: ProcessedDataset | null;
  activeCategory: SupportedCategory | "all";
  activeRegion: SupportedRegion | "all";
  refreshStatus: RefreshStatus;
};

const TOP_HIGHLIGHTS_LIMIT = 6;
const LATEST_STORIES_LIMIT = 9;
const WHAT_CHANGED_LIMIT = 8;

function getArticleScore(article: ProcessedArticle): number {
  const publishedMs = new Date(article.publishedAt).getTime();
  const ageHours = Math.max(0, (Date.now() - publishedMs) / (1000 * 60 * 60));
  const recencyScore = Math.max(0, 72 - ageHours);
  const aiBoost = article.summaryType === "ai" ? 6 : 0;
  const imageBoost = article.imageUrl ? 2 : 0;
  const descriptionBoost = article.description ? 1.5 : 0;
  const excerptBoost = article.cleanedText ? 2.5 : 0;

  return recencyScore + aiBoost + imageBoost + descriptionBoost + excerptBoost;
}

function rankArticles(articles: ProcessedArticle[]): ProcessedArticle[] {
  return [...articles].sort((left, right) => {
    const scoreDifference = getArticleScore(right) - getArticleScore(left);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}

function filterArticles(
  articles: ProcessedArticle[],
  activeCategory: SupportedCategory | "all",
  activeRegion: SupportedRegion | "all",
) {
  return articles.filter((article) => {
    const categoryMatches =
      activeCategory === "all" ||
      canonicalizeCategory(article.category) === activeCategory;
    const regionMatches =
      activeRegion === "all" ||
      (article.sourceCountry &&
        isSupportedRegion(article.sourceCountry) &&
        article.sourceCountry === activeRegion);

    return categoryMatches && regionMatches;
  });
}

function buildStoryStatuses(
  currentArticles: ProcessedArticle[],
  previousArticles: ProcessedArticle[],
  categoryLeaders: ProcessedArticle[],
): Map<string, StoryStatus[]> {
  const statusesById = new Map<string, StoryStatus[]>();
  const previousById = new Map(previousArticles.map((article) => [article.id, article]));
  const previousRanks = new Map(previousArticles.map((article, index) => [article.id, index]));
  const currentLeaderIds = new Set(categoryLeaders.map((article) => article.id));

  for (const [index, article] of currentArticles.entries()) {
    const statuses: StoryStatus[] = [];
    const previousArticle = previousById.get(article.id);
    const previousRank = previousRanks.get(article.id);

    if (!previousArticle) {
      statuses.push("new");
    } else {
      if (previousRank !== undefined && previousRank > index) {
        statuses.push("moved-up");
      }

      if (
        previousArticle.summary !== article.summary ||
        previousArticle.title !== article.title ||
        previousArticle.description !== article.description
      ) {
        statuses.push("updated");
      }
    }

    if (currentLeaderIds.has(article.id)) {
      statuses.push("leader-changed");
    }

    if (statuses.length > 0) {
      statusesById.set(article.id, [...new Set(statuses)]);
    }
  }

  return statusesById;
}

function buildCategoryLeaders(
  rankedArticles: ProcessedArticle[],
  availableCategories: SupportedCategory[],
  previousDataset: ProcessedDataset | null,
): ProcessedArticle[] {
  const pickedIds = new Set<string>();
  const previousArticles = previousDataset?.articles ?? [];
  const previousLeaderByCategory = new Map<SupportedCategory, string>();

  for (const category of availableCategories) {
    const previousLeader = rankArticles(
      previousArticles.filter(
        (article) => canonicalizeCategory(article.category) === category,
      ),
    )[0];

    if (previousLeader) {
      previousLeaderByCategory.set(category, previousLeader.id);
    }
  }

  return availableCategories.flatMap((category) => {
    const candidates = rankedArticles.filter(
      (article) => canonicalizeCategory(article.category) === category,
    );

    if (candidates.length === 0) {
      return [];
    }

    const previousLeaderId = previousLeaderByCategory.get(category);
    const preferredUnique =
      candidates.find(
        (article) => !pickedIds.has(article.id) && article.id !== previousLeaderId,
      ) ??
      candidates.find((article) => !pickedIds.has(article.id)) ??
      candidates[0];

    pickedIds.add(preferredUnique.id);
    return [preferredUnique];
  });
}

function buildWhatChanged(
  currentArticles: ProcessedArticle[],
  previousArticles: ProcessedArticle[],
  categoryLeaders: ProcessedArticle[],
): DashboardChange[] {
  const changes: DashboardChange[] = [];
  const seenArticleIds = new Set<string>();
  const previousById = new Map(previousArticles.map((article) => [article.id, article]));
  const previousRanks = new Map(previousArticles.map((article, index) => [article.id, index]));
  const previousLeaderByCategory = new Map<SupportedCategory, string>();

  for (const category of sortSupportedCategories(
    [...new Set(categoryLeaders.map((article) => canonicalizeCategory(article.category)))],
  )) {
    const previousLeader = rankArticles(
      previousArticles.filter(
        (article) => canonicalizeCategory(article.category) === category,
      ),
    )[0];

    if (previousLeader) {
      previousLeaderByCategory.set(category, previousLeader.id);
    }
  }

  const pushChange = (change: DashboardChange) => {
    if (seenArticleIds.has(change.article.id) || changes.length >= WHAT_CHANGED_LIMIT) {
      return;
    }

    seenArticleIds.add(change.article.id);
    changes.push(change);
  };

  for (const article of currentArticles) {
    if (!previousById.has(article.id)) {
      pushChange({
        article,
        status: "new",
        detail: "New to the latest snapshot.",
      });
    }
  }

  for (const [index, article] of currentArticles.entries()) {
    const previousRank = previousRanks.get(article.id);

    if (previousRank !== undefined && previousRank > index) {
      pushChange({
        article,
        status: "moved-up",
        detail: `Moved up from position ${previousRank + 1} to ${index + 1}.`,
      });
    }
  }

  for (const article of categoryLeaders) {
    const category = canonicalizeCategory(article.category);
    const previousLeaderId = previousLeaderByCategory.get(category);

    if (previousLeaderId && previousLeaderId !== article.id) {
      pushChange({
        article,
        status: "leader-changed",
        detail: `Now leading the ${category} category.`,
      });
    }
  }

  for (const article of currentArticles) {
    const previousArticle = previousById.get(article.id);

    if (
      previousArticle &&
      (previousArticle.summary !== article.summary ||
        previousArticle.description !== article.description ||
        previousArticle.title !== article.title)
    ) {
      pushChange({
        article,
        status: "updated",
        detail: "Updated summary or article metadata in the latest refresh.",
      });
    }
  }

  return changes;
}

function attachStatuses(
  articles: ProcessedArticle[],
  statusesById: Map<string, StoryStatus[]>,
): DashboardStory[] {
  return articles.map((article) => ({
    article,
    statuses: statusesById.get(article.id) ?? [],
  }));
}

function buildEmptyStateDescription(
  activeCategory: SupportedCategory | "all",
  activeRegion: SupportedRegion | "all",
) {
  const selectedFilters = [
    activeCategory === "all" ? null : categoryLabels[activeCategory],
    activeRegion === "all" ? null : regionLabels[activeRegion],
  ].filter(Boolean);

  if (selectedFilters.length === 0) {
    return "There were no validated articles in the latest processed dataset.";
  }

  return `No ${selectedFilters.join(" + ")} stories matched the latest snapshot. Try All regions or All categories, or wait for the next refresh.`;
}

export function buildDashboardFeed(input: DashboardFeedInput): DashboardFeed {
  const activeRegion = input.activeRegion ?? "all";
  const availableCategories = sortSupportedCategories(
    [...new Set(input.dataset.categories.map((value) => canonicalizeCategory(value)))],
  );
  const availableRegionsFromSnapshot = sortSupportedRegions(
    [
      ...new Set(
        input.dataset.articles
          .map((article) => article.sourceCountry)
          .filter((region): region is SupportedRegion =>
            Boolean(region && isSupportedRegion(region)),
          ),
      ),
    ],
  );
  const availableRegions =
    availableRegionsFromSnapshot.length > 0
      ? availableRegionsFromSnapshot
      : [...supportedRegionValues];
  const filteredCurrentArticles = filterArticles(
    input.dataset.articles,
    input.activeCategory,
    activeRegion,
  );
  const filteredPreviousArticles = filterArticles(
    input.previousDataset?.articles ?? [],
    input.activeCategory,
    activeRegion,
  );
  const rankedCurrentArticles = rankArticles(filteredCurrentArticles);
  const rankedPreviousArticles = rankArticles(filteredPreviousArticles);
  const topHighlights = rankedCurrentArticles.slice(0, TOP_HIGHLIGHTS_LIMIT);
  const categoryScope =
    input.activeCategory === "all" ? availableCategories : [input.activeCategory];
  const categoryLeaders = buildCategoryLeaders(
    rankedCurrentArticles,
    categoryScope,
    input.previousDataset
      ? {
          ...input.previousDataset,
          articles: filteredPreviousArticles,
        }
      : null,
  );
  const statusesById = buildStoryStatuses(
    rankedCurrentArticles,
    rankedPreviousArticles,
    categoryLeaders,
  );

  return {
    dataset: {
      ...input.dataset,
      categories: availableCategories,
    },
    activeCategory: input.activeCategory,
    activeRegion,
    refreshStatus: input.refreshStatus,
    availableCategories,
    availableRegions,
    emptyStateDescription: buildEmptyStateDescription(
      input.activeCategory,
      activeRegion,
    ),
    topHighlights: attachStatuses(topHighlights, statusesById),
    categoryLeaders: attachStatuses(categoryLeaders, statusesById),
    whatChanged: buildWhatChanged(
      rankedCurrentArticles,
      rankedPreviousArticles,
      categoryLeaders,
    ),
    latestStories: attachStatuses(
      rankedCurrentArticles.slice(0, LATEST_STORIES_LIMIT),
      statusesById,
    ),
  };
}
