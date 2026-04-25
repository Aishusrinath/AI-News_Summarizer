import "./load-env";

import {
  markNewsRefreshFailure,
  runNewsRefresh,
} from "@/lib/news/pipeline/run-news-refresh";

function shouldAllowStaleOnFailure() {
  return process.env.NEWS_ALLOW_STALE_ON_FAILURE?.trim().toLowerCase() === "true";
}

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

    if (shouldAllowStaleOnFailure()) {
      console.warn(
        "Pipeline failed, but keeping the last published snapshot because NEWS_ALLOW_STALE_ON_FAILURE=true.",
      );
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error("Pipeline failed.");
  console.error(error);
  process.exitCode = 1;
});
