import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createLocalFileSnapshotStore } from "@/lib/storage/snapshot-store";
import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";

function buildDataset(generatedAt: string, title: string): ProcessedDataset {
  return {
    generatedAt,
    source: "Fixture",
    categories: ["world"],
    counts: {
      fetched: 1,
      normalized: 1,
      dropped: 0,
      deduped: 1,
      summarizedWithAi: 1,
      fallbackSummaries: 0,
      finalArticles: 1,
    },
    articles: [
      {
        id: title.toLowerCase().replaceAll(" ", "-"),
        slug: title.toLowerCase().replaceAll(" ", "-"),
        title,
        sourceName: "Source",
        publishedAt: generatedAt,
        category: "world",
        url: "https://example.com/story",
        summary: `${title} summary`,
        summaryType: "ai",
      },
    ],
  };
}

describe("createLocalFileSnapshotStore", () => {
  let temporaryDirectory: string;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "ai-news-snapshots-"));
    await mkdir(temporaryDirectory, { recursive: true });
  });

  afterEach(async () => {
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it("publishes a new snapshot by promoting current to previous and updating refresh status", async () => {
    const paths = {
      currentSnapshot: path.join(temporaryDirectory, "current.json"),
      previousSnapshot: path.join(temporaryDirectory, "previous.json"),
      processedArticles: path.join(temporaryDirectory, "articles.json"),
      refreshStatus: path.join(temporaryDirectory, "refresh-status.json"),
    };
    const currentDataset = buildDataset(
      "2026-04-16T19:00:00.000Z",
      "Current story",
    );
    const candidateDataset = buildDataset(
      "2026-04-16T20:00:00.000Z",
      "Candidate story",
    );

    await writeFile(paths.currentSnapshot, JSON.stringify(currentDataset, null, 2));

    const store = createLocalFileSnapshotStore({ paths });
    await store.publishSnapshot(candidateDataset);

    await expect(store.getCurrentSnapshot()).resolves.toMatchObject({
      generatedAt: candidateDataset.generatedAt,
    });
    await expect(store.getPreviousSnapshot()).resolves.toMatchObject({
      generatedAt: currentDataset.generatedAt,
    });
    await expect(store.getRefreshStatus()).resolves.toMatchObject({
      currentSnapshotId: candidateDataset.generatedAt,
      previousSnapshotId: currentDataset.generatedAt,
      lastSuccessfulRefreshAt: candidateDataset.generatedAt,
      lastAttemptedRefreshAt: candidateDataset.generatedAt,
      isStale: false,
      status: "success",
    });

    const processedMirror = JSON.parse(
      await readFile(paths.processedArticles, "utf8"),
    ) as ProcessedDataset;

    expect(processedMirror.generatedAt).toBe(candidateDataset.generatedAt);
  });
});
