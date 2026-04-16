import type { RawNewsApiResponse } from "@/lib/news/contracts/raw-schema";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";
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
  createSummarizerConfigFromEnv,
  getRequiredEnv,
  processEnvReader,
  type EnvReader,
  type SummarizerConfig,
} from "@/lib/news/pipeline/summarizer-config";
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
};

const systemClock: ClockPort = {
  now() {
    return new Date().toISOString();
  },
};

export function createNewsRefreshService({
  newsSource,
  summarizerConfig,
  snapshotStore,
  clock = systemClock,
}: NewsRefreshServiceDependencies): NewsRefreshService {
  return {
    async refresh(options = {}) {
      const shouldPublish = options.publish ?? true;
      const rawNews = await newsSource.fetchNews();
      const normalizedArticles = normalizeArticles(rawNews.articles);
      const dedupedArticles = dedupeArticles(normalizedArticles);
      const articlesToSummarize = selectArticlesForSummary(dedupedArticles);
      const summarizedArticles = await summarizeArticles(
        articlesToSummarize,
        summarizerConfig.summarizeArticle,
      );
      const summarizedWithAi = summarizedArticles.filter(
        (article) => article.summaryType === "ai",
      ).length;
      const fallbackSummaries = summarizedArticles.length - summarizedWithAi;

      const dataset = buildProcessedDataset({
        generatedAt: clock.now(),
        source: summarizerConfig.source,
        articles: summarizedArticles,
        counts: {
          fetched: rawNews.articles.length,
          normalized: normalizedArticles.length,
          dropped: rawNews.articles.length - normalizedArticles.length,
          deduped: dedupedArticles.length,
          summarizedWithAi,
          fallbackSummaries,
          finalArticles: summarizedArticles.length,
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
  });
}
