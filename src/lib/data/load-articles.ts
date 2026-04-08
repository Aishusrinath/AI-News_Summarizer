import {
  processedDatasetSchema,
  type ProcessedDataset,
} from "@/lib/news/contracts/processed-schema";
import {
  newsArtifactPaths,
  readJsonArtifact,
} from "@/lib/storage/news-artifact-store";

const defaultDatasetPath = newsArtifactPaths.processedArticles;

export async function loadProcessedDatasetFromFile(
  filePath = defaultDatasetPath,
): Promise<ProcessedDataset> {
  const parsed = await readJsonArtifact<unknown>(filePath);

  return processedDatasetSchema.parse(parsed);
}

export async function loadArticles() {
  return loadProcessedDatasetFromFile();
}
