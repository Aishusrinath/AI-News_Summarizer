import { runFetchNews } from "./fetch-news";
import { runProcessNews } from "./process-news";
import { runSummarizeNews } from "./summarize-news";

async function main() {
  console.log("Starting pipeline...");

  await runFetchNews();
  await runProcessNews();
  await runSummarizeNews();

  console.log("Pipeline complete.");
}

main().catch((error) => {
  console.error("Pipeline failed.");
  console.error(error);
  process.exitCode = 1;
});
