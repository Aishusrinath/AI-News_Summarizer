import "dotenv/config";
import { runFetchNews } from "./fetch-news";
import { runProcessNews } from "./process-news";
import { runSummarizeNews } from "./summarize-news";
import { defaultSnapshotStore } from "@/lib/storage/snapshot-store";

async function main() {
  console.log("Starting pipeline...");

  try {
    await runFetchNews();
    await runProcessNews();
    const dataset = await runSummarizeNews();
    await defaultSnapshotStore.publishSnapshot(dataset);
  } catch (error) {
    await defaultSnapshotStore.markRefreshFailure(
      error instanceof Error ? error.message : "Pipeline failed.",
    );
    throw error;
  }

  console.log("Pipeline complete.");
}

main().catch((error) => {
  console.error("Pipeline failed.");
  console.error(error);
  process.exitCode = 1;
});
