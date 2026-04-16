import { pathToFileURL } from "node:url";
import "dotenv/config";

import {
  newsArtifactPaths,
  readJsonArtifact,
  writeJsonArtifact,
} from "@/lib/storage/news-artifact-store";
import { dedupeArticles } from "@/lib/news/etl/dedupe-articles";
import { parseRawNewsApiResponse } from "@/lib/news/ingest/fetch-news";
import { normalizeArticles } from "@/lib/news/etl/normalize-articles";

export async function runProcessNews() {
  const rawResponse = parseRawNewsApiResponse(
    await readJsonArtifact(newsArtifactPaths.rawLatest),
  );
  const normalized = normalizeArticles(rawResponse.articles);
  const deduped = dedupeArticles(normalized);

  await writeJsonArtifact(newsArtifactPaths.candidateArticles, {
    generatedAt: new Date().toISOString(),
    source: "candidate",
    counts: {
      fetched: rawResponse.articles.length,
      normalized: normalized.length,
      dropped: rawResponse.articles.length - normalized.length,
      deduped: deduped.length,
    },
    articles: deduped,
  });

  console.log(`Processed ${deduped.length} articles into data/tmp/candidate-articles.json.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runProcessNews().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
