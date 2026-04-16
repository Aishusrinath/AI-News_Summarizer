import type { ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import { createNewsRefreshServiceFromEnv } from "@/lib/news/pipeline/news-refresh-service";
import { defaultSnapshotStore } from "@/lib/storage/snapshot-store";

export async function runNewsRefresh(): Promise<ProcessedDataset> {
  return createNewsRefreshServiceFromEnv().refresh({ publish: true });
}

export async function markNewsRefreshFailure(errorMessage?: string) {
  await defaultSnapshotStore.markRefreshFailure(errorMessage);
}
