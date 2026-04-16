import "dotenv/config";

import {
  markNewsRefreshFailure,
  runNewsRefresh,
} from "@/lib/news/pipeline/run-news-refresh";

async function main() {
  console.log("Starting pipeline...");

  try {
    const dataset = await runNewsRefresh();
    console.log(
      `Pipeline complete. Published ${dataset.counts.finalArticles} processed articles.`,
    );
  } catch (error) {
    await markNewsRefreshFailure(
      error instanceof Error ? error.message : "Pipeline failed.",
    );
    throw error;
  }
}

main().catch((error) => {
  console.error("Pipeline failed.");
  console.error(error);
  process.exitCode = 1;
});
