import type { RawNewsApiResponse } from "@/lib/news/contracts/raw-schema";
import type {
  ProcessedArticle,
  ProcessedDataset,
} from "@/lib/news/contracts/processed-schema";
import { buildProcessedDataset } from "@/lib/news/etl/build-processed-dataset";
import { dedupeArticles } from "@/lib/news/etl/dedupe-articles";
import { normalizeArticles } from "@/lib/news/etl/normalize-articles";
import { selectArticlesForSummary } from "@/lib/news/etl/select-articles-for-summary";
import { fetchNews } from "@/lib/news/ingest/fetch-news";
import {
  defaultNewsCategories,
  defaultNewsCountries,
} from "@/lib/news/ingest/news-api-client";
import { summarizeArticles } from "@/lib/news/summarize/summarize-articles";
import {
  cleanEnvValue,
  createSummarizerConfigFromEnv,
  getRequiredEnv,
  processEnvReader,
  type EnvReader,
  type SummarizerConfig,
} from "@/lib/news/pipeline/summarizer-config";
import {
  buildAiProcessedArticle,
  buildFallbackProcessedArticle,
} from "@/lib/news/summarize/summarize-articles";
import {
  defaultSnapshotStore,
  type SnapshotStore,
} from "@/lib/storage/snapshot-store";

export type NewsSourcePort = {
  fetchNews(): Promise<RawNewsApiResponse>;
};

export type ClockPort = {
  now(): string;
};

export type NewsRefreshService = {
  refresh(options?: { publish?: boolean }): Promise<ProcessedDataset>;
  markFailure(errorMessage?: string): Promise<void>;
};

type NewsRefreshServiceDependencies = {
  newsSource: NewsSourcePort;
  summarizerConfig: SummarizerConfig;
  snapshotStore: SnapshotStore;
  clock?: ClockPort;
  historyDays?: number;
  maxFinalArticles?: number;
  summaryArticleLimit?: number;
};

const DEFAULT_MAX_FINAL_ARTICLES = 120;
const DEFAULT_SUMMARY_ARTICLE_LIMIT = 10;
const DEFAULT_HISTORY_DAYS = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const systemClock: ClockPort = {
  now() {
    return new Date().toISOString();
  },
};

function buildReusableAiSummaryMap(
  snapshot: ProcessedDataset | null,
): Map<string, ProcessedArticle> {
  return new Map(
    (snapshot?.articles ?? [])
      .filter((article) => article.summaryType === "ai")
      .map((article) => [article.id, article]),
  );
}

function getOptionalPositiveInteger(env: EnvReader, name: string) {
  const rawValue = cleanEnvValue(env.get(name));

  if (!rawValue) {
    return undefined;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return parsed;
}

function getOptionalFetchStrategy(env: EnvReader) {
  const strategy = cleanEnvValue(env.get("NEWS_FETCH_STRATEGY"));

  if (!strategy || strategy === "full" || strategy === "rotating") {
    return strategy;
  }

  throw new Error("NEWS_FETCH_STRATEGY must be either full or rotating.");
}

function getRotationIndex(env: EnvReader, now = new Date()) {
  const configuredIndex = getOptionalPositiveInteger(env, "NEWS_ROTATION_INDEX");

  if (configuredIndex !== undefined) {
    return configuredIndex;
  }

  return Math.floor(now.getTime() / (60 * 60 * 1000));
}

function getRetainedArticleCutoff(nowIso: string, historyDays: number) {
  return new Date(new Date(nowIso).getTime() - historyDays * ONE_DAY_MS);
}

function isFreshEnoughForHistory(article: ProcessedArticle, cutoff: Date) {
  return new Date(article.publishedAt).getTime() >= cutoff.getTime();
}

function mergeWithRetainedSnapshotArticles({
  currentArticles,
  currentSnapshot,
  maxFinalArticles,
  cutoff,
}: {
  currentArticles: ProcessedArticle[];
  currentSnapshot: ProcessedDataset | null;
  maxFinalArticles: number;
  cutoff: Date;
}) {
  const seenIds = new Set(currentArticles.map((article) => article.id));
  const retainedArticles = (currentSnapshot?.articles ?? []).filter((article) => {
    if (seenIds.has(article.id)) {
      return false;
    }

    return isFreshEnoughForHistory(article, cutoff);
  });

  return [...currentArticles, ...retainedArticles]
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
    )
    .slice(0, maxFinalArticles);
}

export function createNewsRefreshService({
  newsSource,
  summarizerConfig,
  snapshotStore,
  clock = systemClock,
  historyDays = DEFAULT_HISTORY_DAYS,
  maxFinalArticles = DEFAULT_MAX_FINAL_ARTICLES,
  summaryArticleLimit,
}: NewsRefreshServiceDependencies): NewsRefreshService {
  return {
    async refresh(options = {}) {
      const shouldPublish = options.publish ?? true;
      const currentSnapshot = await snapshotStore.getCurrentSnapshot().catch(() => null);
      const reusableAiSummaries = buildReusableAiSummaryMap(currentSnapshot);
      const generatedAt = clock.now();
      const rawNews = await newsSource.fetchNews();
      const normalizedArticles = normalizeArticles(rawNews.articles);
      const dedupedArticles = dedupeArticles(normalizedArticles);
      const finalArticleCandidates = dedupedArticles.slice(0, maxFinalArticles);
      const articlesToSummarize = selectArticlesForSummary(
        finalArticleCandidates.filter(
          (article) => !reusableAiSummaries.has(article.id),
        ),
        summaryArticleLimit ?? DEFAULT_SUMMARY_ARTICLE_LIMIT,
      );
      const summarizedArticles = await summarizeArticles(
        articlesToSummarize,
        summarizerConfig.summarizeArticle,
      );
      const summarizedArticlesById = new Map(
        summarizedArticles.map((article) => [article.id, article]),
      );
      const refreshedArticles = finalArticleCandidates.map((article) =>
        summarizedArticlesById.get(article.id) ??
        (reusableAiSummaries.has(article.id)
          ? buildAiProcessedArticle(
              article,
              reusableAiSummaries.get(article.id)?.summary ?? article.title,
            )
          : buildFallbackProcessedArticle(article)),
      );
      const finalArticles = mergeWithRetainedSnapshotArticles({
        currentArticles: refreshedArticles,
        currentSnapshot,
        maxFinalArticles,
        cutoff: getRetainedArticleCutoff(generatedAt, historyDays),
      });
      const summarizedWithAi = finalArticles.filter(
        (article) => article.summaryType === "ai",
      ).length;
      const fallbackSummaries = finalArticles.filter(
        (article) => article.summaryType === "fallback",
      ).length;

      const dataset = buildProcessedDataset({
        generatedAt,
        source: summarizerConfig.source,
        articles: finalArticles,
        counts: {
          fetched: rawNews.articles.length,
          normalized: normalizedArticles.length,
          dropped: rawNews.articles.length - normalizedArticles.length,
          deduped: dedupedArticles.length,
          summarizedWithAi,
          fallbackSummaries,
          finalArticles: finalArticles.length,
        },
      });

      if (shouldPublish) {
        await snapshotStore.publishSnapshot(dataset);
      }

      return dataset;
    },

    async markFailure(errorMessage) {
      await snapshotStore.markRefreshFailure(errorMessage);
    },
  };
}

export function createNewsSourceFromEnv(
  env: EnvReader = processEnvReader,
): NewsSourcePort {
  const fetchStrategy = getOptionalFetchStrategy(env);
  const rotationIndex = getRotationIndex(env);
  const countries =
    fetchStrategy === "rotating"
      ? [defaultNewsCountries[rotationIndex % defaultNewsCountries.length]]
      : [...defaultNewsCountries];
  const categoryRotationIndex = Math.floor(rotationIndex / defaultNewsCountries.length);
  const categories =
    fetchStrategy === "rotating"
      ? [defaultNewsCategories[categoryRotationIndex % defaultNewsCategories.length]]
      : defaultNewsCategories;

  return {
    fetchNews() {
      return fetchNews({
        apiKey: getRequiredEnv(env, "NEWS_API_KEY", "refreshing news"),
        baseUrl: "https://newsapi.org/v2",
        categories,
        countries,
        pageSize: 10,
      });
    },
  };
}

export function createNewsRefreshServiceFromEnv(
  env: EnvReader = processEnvReader,
  snapshotStore: SnapshotStore = defaultSnapshotStore,
) {
  return createNewsRefreshService({
    newsSource: createNewsSourceFromEnv(env),
    summarizerConfig: createSummarizerConfigFromEnv(env),
    snapshotStore,
    historyDays: getOptionalPositiveInteger(env, "NEWS_HISTORY_DAYS"),
    maxFinalArticles: getOptionalPositiveInteger(env, "MAX_FINAL_ARTICLES"),
    summaryArticleLimit: getOptionalPositiveInteger(env, "SUMMARY_ARTICLE_LIMIT"),
  });
}
