import path from "node:path";

import { loadProcessedDatasetFromFile } from "@/lib/data/load-articles";

describe("loadProcessedDatasetFromFile", () => {
  it("validates fixture-backed processed data", async () => {
    const fixturePath = path.join(
      process.cwd(),
      "src",
      "lib",
      "data",
      "__tests__",
      "fixtures",
      "processed-dataset.json",
    );
    const dataset = await loadProcessedDatasetFromFile(fixturePath);

    expect(dataset.articles).toHaveLength(1);
    expect(dataset.counts.finalArticles).toBe(3);
  });
});
