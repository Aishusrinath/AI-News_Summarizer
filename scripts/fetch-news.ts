export async function runFetchNews() {
  console.log(
    "Fetch step scaffolded. Connect scripts/fetch-news.ts to your chosen news API and write data/raw/latest.json.",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFetchNews().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
