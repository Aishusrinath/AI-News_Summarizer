import { pathToFileURL } from "node:url";
import "./load-env";

import { buildProcessedDataset } from "@/lib/news/etl/build-processed-dataset";
import { selectArticlesForSummary } from "@/lib/news/etl/select-articles-for-summary";
import { normalizedArticleSchema } from "@/lib/news/contracts/normalized-schema";
import { createSummarizerConfigFromEnv } from "@/lib/news/pipeline/summarizer-config";
import { summarizeArticles } from "@/lib/news/summarize/summarize-articles";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import {
  newsArtifactPaths,
  readJsonArtifact,
  writeJsonArtifact,
} from "@/lib/storage/news-artifact-store";

export async function runSummarizeNews(): Promise<ProcessedDataset> {
  const summarizerConfig = createSummarizerConfigFromEnv(
    undefined,
    "running the summarize step",
  );

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

  const articlesToSummarize = selectArticlesForSummary(normalizedArticles);
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
