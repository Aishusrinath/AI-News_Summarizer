import { buildProcessedDataset } from "@/lib/news/etl/build-processed-dataset";
import { normalizedArticleSchema } from "@/lib/news/contracts/normalized-schema";
import { summarizeArticles } from "@/lib/news/summarize/summarize-articles";
import {
  newsArtifactPaths,
  readJsonArtifact,
  writeJsonArtifact,
} from "@/lib/storage/news-artifact-store";

export async function runSummarizeNews() {
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

  const summarizedArticles = await summarizeArticles(normalizedArticles, async () => {
    throw new Error("No live summarizer configured yet.");
  });

  const dataset = buildProcessedDataset({
    generatedAt: new Date().toISOString(),
    source: "Local scaffold pipeline",
    articles: summarizedArticles,
    counts: {
      fetched: candidate.counts.fetched,
      normalized: candidate.counts.normalized,
      dropped: candidate.counts.dropped,
      deduped: candidate.counts.deduped,
      summarizedWithAi: 0,
      fallbackSummaries: summarizedArticles.length,
      finalArticles: summarizedArticles.length,
    },
  });

  await writeJsonArtifact(newsArtifactPaths.processedArticles, dataset);

  console.log(`Wrote ${summarizedArticles.length} processed articles to data/processed/articles.json.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSummarizeNews().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
