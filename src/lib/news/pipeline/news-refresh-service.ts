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
  maxFinalArticles?: number;
  summaryArticleLimit?: number;
};

const DEFAULT_MAX_FINAL_ARTICLES = 120;
const DEFAULT_SUMMARY_ARTICLE_LIMIT = 10;

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

export function createNewsRefreshService({
  newsSource,
  summarizerConfig,
  snapshotStore,
  clock = systemClock,
  maxFinalArticles = DEFAULT_MAX_FINAL_ARTICLES,
  summaryArticleLimit,
}: NewsRefreshServiceDependencies): NewsRefreshService {
  return {
    async refresh(options = {}) {
      const shouldPublish = options.publish ?? true;
      const currentSnapshot = await snapshotStore.getCurrentSnapshot().catch(() => null);
      const reusableAiSummaries = buildReusableAiSummaryMap(currentSnapshot);
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
      const finalArticles = finalArticleCandidates.map((article) =>
        summarizedArticlesById.get(article.id) ??
        (reusableAiSummaries.has(article.id)
          ? buildAiProcessedArticle(
              article,
              reusableAiSummaries.get(article.id)?.summary ?? article.title,
            )
          : buildFallbackProcessedArticle(article)),
      );
      const summarizedWithAi = summarizedArticles.filter(
        (article) => article.summaryType === "ai",
      ).length;
      const fallbackSummaries = finalArticles.filter(
        (article) => article.summaryType === "fallback",
      ).length;

      const dataset = buildProcessedDataset({
        generatedAt: clock.now(),
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
  return {
    fetchNews() {
      return fetchNews({
        apiKey: getRequiredEnv(env, "NEWS_API_KEY", "refreshing news"),
        baseUrl: "https://newsapi.org/v2",
        categories: defaultNewsCategories,
        countries: [...defaultNewsCountries],
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
    maxFinalArticles: getOptionalPositiveInteger(env, "MAX_FINAL_ARTICLES"),
    summaryArticleLimit: getOptionalPositiveInteger(env, "SUMMARY_ARTICLE_LIMIT"),
  });
}
