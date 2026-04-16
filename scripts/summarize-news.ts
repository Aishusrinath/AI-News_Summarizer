import { pathToFileURL } from "node:url";
import "dotenv/config";

import { buildProcessedDataset } from "@/lib/news/etl/build-processed-dataset";
import { normalizedArticleSchema } from "@/lib/news/contracts/normalized-schema";
import type { ArticleSummarizer } from "@/lib/news/summarize/article-summarizer";
import { createGeminiSummarizer } from "@/lib/news/summarize/gemini-summarizer";
import { createHuggingFaceSummarizer } from "@/lib/news/summarize/huggingface-summarizer";
import { createOllamaSummarizer } from "@/lib/news/summarize/ollama-summarizer";
import { createOpenAiSummarizer } from "@/lib/news/summarize/openai-summarizer";
import { summarizeArticles } from "@/lib/news/summarize/summarize-articles";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import {
  newsArtifactPaths,
  readJsonArtifact,
  writeJsonArtifact,
} from "@/lib/storage/news-artifact-store";

type SummarizerConfig = {
  provider: "gemini" | "huggingface" | "ollama" | "openai";
  source: string;
  summarizeArticle: ArticleSummarizer;
};

function getSummarizerConfig(): SummarizerConfig {
  const provider = process.env.SUMMARIZER_PROVIDER?.trim().toLowerCase() ?? "gemini";

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY. Set it before running the summarize step.");
    }

    return {
      provider: "gemini",
      source: "NewsAPI + Gemini pipeline",
      summarizeArticle: createGeminiSummarizer({
        apiKey,
        model: process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview",
      }),
    };
  }

  if (provider === "huggingface") {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing HUGGINGFACE_API_KEY. Set it before running the summarize step.",
      );
    }

    return {
      provider: "huggingface",
      source: "NewsAPI + Hugging Face pipeline",
      summarizeArticle: createHuggingFaceSummarizer({
        apiKey,
        model: process.env.HUGGINGFACE_MODEL?.trim() || "facebook/bart-large-cnn",
      }),
    };
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY. Set it before running the summarize step.");
    }

    return {
      provider: "openai",
      source: "NewsAPI + OpenAI pipeline",
      summarizeArticle: createOpenAiSummarizer(apiKey),
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

export async function runSummarizeNews(): Promise<ProcessedDataset> {
  const summarizerConfig = getSummarizerConfig();

  const candidate = await readJsonArtifact<{
    counts: {
      fetched: number;
      normalized: number;
      dropped: number;
      deduped: number;
    };
    articles: unknown[];
  }>(newsArtifactPaths.candidateArticles);

  const normalizedArticles = candidate.articles.map((article) =>
    normalizedArticleSchema.parse(article),
  );

  const summarizedArticles = await summarizeArticles(
    normalizedArticles,
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
      fetched: candidate.counts.fetched,
      normalized: candidate.counts.normalized,
      dropped: candidate.counts.dropped,
      deduped: candidate.counts.deduped,
      summarizedWithAi,
      fallbackSummaries,
      finalArticles: summarizedArticles.length,
    },
  });

  await writeJsonArtifact(newsArtifactPaths.processedArticles, dataset);

  console.log(
    `Wrote ${summarizedArticles.length} processed articles to data/processed/articles.json using ${summarizerConfig.provider}.`,
  );

  return dataset;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSummarizeNews().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
