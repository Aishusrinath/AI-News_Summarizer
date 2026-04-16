import { buildProcessedDataset } from "@/lib/news/etl/build-processed-dataset";
import { dedupeArticles } from "@/lib/news/etl/dedupe-articles";
import { normalizeArticles } from "@/lib/news/etl/normalize-articles";
import { selectArticlesForSummary } from "@/lib/news/etl/select-articles-for-summary";
import { fetchNews } from "@/lib/news/ingest/fetch-news";
import {
  defaultNewsCategories,
  defaultNewsCountries,
} from "@/lib/news/ingest/news-api-client";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import type { ArticleSummarizer } from "@/lib/news/summarize/article-summarizer";
import { createGeminiSummarizer } from "@/lib/news/summarize/gemini-summarizer";
import { createHuggingFaceSummarizer } from "@/lib/news/summarize/huggingface-summarizer";
import { createOllamaSummarizer } from "@/lib/news/summarize/ollama-summarizer";
import { createOpenAiSummarizer } from "@/lib/news/summarize/openai-summarizer";
import { summarizeArticles } from "@/lib/news/summarize/summarize-articles";
import { defaultSnapshotStore } from "@/lib/storage/snapshot-store";

type SummarizerConfig = {
  provider: "gemini" | "huggingface" | "ollama" | "openai";
  source: string;
  summarizeArticle: ArticleSummarizer;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}. Set it before refreshing news.`);
  }

  return value;
}

function getSummarizerConfig(): SummarizerConfig {
  const provider = process.env.SUMMARIZER_PROVIDER?.trim().toLowerCase() ?? "gemini";

  if (provider === "gemini") {
    return {
      provider: "gemini",
      source: "NewsAPI + Gemini pipeline",
      summarizeArticle: createGeminiSummarizer({
        apiKey: getRequiredEnv("GEMINI_API_KEY"),
        model: process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview",
      }),
    };
  }

  if (provider === "huggingface") {
    return {
      provider: "huggingface",
      source: "NewsAPI + Hugging Face pipeline",
      summarizeArticle: createHuggingFaceSummarizer({
        apiKey: getRequiredEnv("HUGGINGFACE_API_KEY"),
        model: process.env.HUGGINGFACE_MODEL?.trim() || "facebook/bart-large-cnn",
      }),
    };
  }

  if (provider === "openai") {
    return {
      provider: "openai",
      source: "NewsAPI + OpenAI pipeline",
      summarizeArticle: createOpenAiSummarizer(getRequiredEnv("OPENAI_API_KEY")),
    };
  }

  if (provider !== "ollama") {
    throw new Error(
      `Unsupported SUMMARIZER_PROVIDER: ${provider}. Use "gemini", "huggingface", "ollama", or "openai".`,
    );
  }

  return {
    provider: "ollama",
    source: "NewsAPI + Ollama pipeline",
    summarizeArticle: createOllamaSummarizer({
      baseURL: process.env.OLLAMA_BASE_URL,
      model: process.env.OLLAMA_MODEL?.trim() || "llama3.2:3b",
    }),
  };
}

export async function runNewsRefresh(): Promise<ProcessedDataset> {
  const summarizerConfig = getSummarizerConfig();
  const rawNews = await fetchNews({
    apiKey: getRequiredEnv("NEWS_API_KEY"),
    baseUrl: "https://newsapi.org/v2",
    categories: defaultNewsCategories,
    countries: [...defaultNewsCountries],
    pageSize: 10,
  });
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
    generatedAt: new Date().toISOString(),
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

  await defaultSnapshotStore.publishSnapshot(dataset);
  return dataset;
}

export async function markNewsRefreshFailure(errorMessage?: string) {
  await defaultSnapshotStore.markRefreshFailure(errorMessage);
}
