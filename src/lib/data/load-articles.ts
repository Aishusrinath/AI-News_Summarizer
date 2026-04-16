import {
  processedDatasetSchema,
  type RefreshStatus,
  type ProcessedDataset,
} from "@/lib/news/contracts/processed-schema";
import { canonicalizeCategory, type Category } from "@/lib/news/contracts/raw-schema";
import {
  newsArtifactPaths,
  readJsonArtifact,
} from "@/lib/storage/news-artifact-store";
import { defaultSnapshotStore } from "@/lib/storage/snapshot-store";

const defaultDatasetPath = newsArtifactPaths.processedArticles;

export function parseProcessedDataset(input: unknown): ProcessedDataset {
  if (!input || typeof input !== "object") {
    return processedDatasetSchema.parse(input);
  }

  const dataset = input as {
    categories?: unknown;
    articles?: Array<{ category?: string }>;
  };

  const normalizedDataset = {
    ...dataset,
    categories: Array.isArray(dataset.categories)
      ? dataset.categories.map((category) =>
          typeof category === "string"
            ? canonicalizeCategory(category as Category)
            : category,
        )
      : dataset.categories,
    articles: Array.isArray(dataset.articles)
      ? dataset.articles.map((article) => ({
          ...article,
          category:
            typeof article.category === "string"
              ? canonicalizeCategory(article.category as Category)
              : article.category,
        }))
      : dataset.articles,
  };

  return processedDatasetSchema.parse(normalizedDataset);
}

export async function loadProcessedDatasetFromFile(
  filePath = defaultDatasetPath,
): Promise<ProcessedDataset> {
  const parsed = await readJsonArtifact<unknown>(filePath);

  return parseProcessedDataset(parsed);
}

export async function loadCurrentSnapshot() {
  return defaultSnapshotStore.getCurrentSnapshot();
}

export async function loadPreviousSnapshot() {
  return defaultSnapshotStore.getPreviousSnapshot();
}

export async function loadRefreshStatus(): Promise<RefreshStatus> {
  return defaultSnapshotStore.getRefreshStatus();
}

export async function loadArticles() {
  return loadCurrentSnapshot();
}
