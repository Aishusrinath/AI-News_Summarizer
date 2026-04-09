import { pathToFileURL } from "node:url";

import { fetchNews } from "@/lib/news/ingest/fetch-news";
import { newsArtifactPaths, writeJsonArtifact } from "@/lib/storage/news-artifact-store";

const defaultBaseUrl = "https://newsapi.org/v2";

export async function runFetchNews() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEWS_API_KEY. Set it before running the fetch step.");
  }

  const rawNews = await fetchNews({
    apiKey,
    baseUrl: defaultBaseUrl,
    categories: ["general", "technology", "business"],
    country: "us",
    pageSize: 10,
  });

  await writeJsonArtifact(newsArtifactPaths.rawLatest, rawNews);

  console.log(`Fetched ${rawNews.articles.length} raw articles into data/raw/latest.json.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runFetchNews().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
