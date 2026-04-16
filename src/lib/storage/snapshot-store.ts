import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { BlobNotFoundError, get, put } from "@vercel/blob";

import type {
  ProcessedDataset,
  RefreshStatus,
} from "@/lib/news/contracts/processed-schema";
import { refreshStatusSchema } from "@/lib/news/contracts/processed-schema";
import { parseProcessedDataset } from "@/lib/data/load-articles";
import {
  newsArtifactPaths,
  readJsonArtifact,
  writeJsonArtifact,
} from "@/lib/storage/news-artifact-store";

export type SnapshotStore = {
  getCurrentSnapshot(): Promise<ProcessedDataset>;
  getPreviousSnapshot(): Promise<ProcessedDataset | null>;
  getRefreshStatus(): Promise<RefreshStatus>;
  publishSnapshot(candidateSnapshot: ProcessedDataset): Promise<void>;
  markRefreshFailure(errorMessage?: string): Promise<void>;
};

const snapshotBlobPaths = {
  current: "snapshots/current.json",
  previous: "snapshots/previous.json",
  refreshStatus: "snapshots/refresh-status.json",
} as const;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function buildDefaultRefreshStatus(
  currentSnapshot: ProcessedDataset | null,
  overrides?: Partial<RefreshStatus>,
): RefreshStatus {
  return {
    currentSnapshotId: currentSnapshot?.generatedAt ?? null,
    previousSnapshotId: null,
    lastSuccessfulRefreshAt: currentSnapshot?.generatedAt ?? null,
    lastAttemptedRefreshAt: currentSnapshot?.generatedAt ?? null,
    isStale: false,
    status: currentSnapshot ? "success" : "idle",
    ...overrides,
  };
}

async function readBlobJson(pathname: string) {
  const response = await get(pathname, {
    access: "private",
  });

  if (!response || response.statusCode !== 200) {
    return null;
  }

  const rawText = await new Response(response.stream).text();
  return JSON.parse(rawText) as unknown;
}

async function writeBlobJson(pathname: string, value: unknown) {
  await put(pathname, JSON.stringify(value, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function createLocalFileSnapshotStore(): SnapshotStore {
  return {
    async getCurrentSnapshot() {
      const filePath = (await fileExists(newsArtifactPaths.currentSnapshot))
        ? newsArtifactPaths.currentSnapshot
        : newsArtifactPaths.processedArticles;
      const parsed = await readJsonArtifact<unknown>(filePath);
      return parseProcessedDataset(parsed);
    },

    async getPreviousSnapshot() {
      if (!(await fileExists(newsArtifactPaths.previousSnapshot))) {
        return null;
      }

      const parsed = await readJsonArtifact<unknown>(newsArtifactPaths.previousSnapshot);
      return parseProcessedDataset(parsed);
    },

    async getRefreshStatus() {
      const currentSnapshot = await this.getCurrentSnapshot();

      if (!(await fileExists(newsArtifactPaths.refreshStatus))) {
        return buildDefaultRefreshStatus(currentSnapshot);
      }

      const parsed = await readJsonArtifact<unknown>(newsArtifactPaths.refreshStatus);
      return refreshStatusSchema.parse(parsed);
    },

    async publishSnapshot(candidateSnapshot) {
      const previousSnapshot = await this.getCurrentSnapshot().catch(() => null);

      if (previousSnapshot) {
        await writeJsonArtifact(newsArtifactPaths.previousSnapshot, previousSnapshot);
      }

      await writeJsonArtifact(newsArtifactPaths.currentSnapshot, candidateSnapshot);
      await writeJsonArtifact(newsArtifactPaths.processedArticles, candidateSnapshot);
      await writeJsonArtifact(
        newsArtifactPaths.refreshStatus,
        buildDefaultRefreshStatus(candidateSnapshot, {
          previousSnapshotId: previousSnapshot?.generatedAt ?? null,
          currentSnapshotId: candidateSnapshot.generatedAt,
          lastSuccessfulRefreshAt: candidateSnapshot.generatedAt,
          lastAttemptedRefreshAt: candidateSnapshot.generatedAt,
          isStale: false,
          status: "success",
        }),
      );
    },

    async markRefreshFailure(errorMessage) {
      const currentSnapshot = await this.getCurrentSnapshot().catch(() => null);

      if (errorMessage) {
        console.warn(`Snapshot refresh failed: ${errorMessage}`);
      }

      await writeJsonArtifact(
        newsArtifactPaths.refreshStatus,
        buildDefaultRefreshStatus(currentSnapshot, {
          previousSnapshotId: null,
          currentSnapshotId: currentSnapshot?.generatedAt ?? null,
          lastAttemptedRefreshAt: new Date().toISOString(),
          lastSuccessfulRefreshAt: currentSnapshot?.generatedAt ?? null,
          isStale: true,
          status: "failed",
        }),
      );
    },
  };
}

export function createVercelBlobSnapshotStore(): SnapshotStore {
  return {
    async getCurrentSnapshot() {
      const parsed = await readBlobJson(snapshotBlobPaths.current);

      if (!parsed) {
        throw new Error("No current snapshot is available in Vercel Blob storage.");
      }

      return parseProcessedDataset(parsed);
    },

    async getPreviousSnapshot() {
      const parsed = await readBlobJson(snapshotBlobPaths.previous);
      return parsed ? parseProcessedDataset(parsed) : null;
    },

    async getRefreshStatus() {
      const currentSnapshot = await this.getCurrentSnapshot().catch(() => null);

      try {
        const parsed = await readBlobJson(snapshotBlobPaths.refreshStatus);
        return parsed
          ? refreshStatusSchema.parse(parsed)
          : buildDefaultRefreshStatus(currentSnapshot);
      } catch (error) {
        if (error instanceof BlobNotFoundError) {
          return buildDefaultRefreshStatus(currentSnapshot);
        }

        throw error;
      }
    },

    async publishSnapshot(candidateSnapshot) {
      const previousSnapshot = await this.getCurrentSnapshot().catch(() => null);

      if (previousSnapshot) {
        await writeBlobJson(snapshotBlobPaths.previous, previousSnapshot);
      }

      await writeBlobJson(snapshotBlobPaths.current, candidateSnapshot);
      await writeBlobJson(
        snapshotBlobPaths.refreshStatus,
        buildDefaultRefreshStatus(candidateSnapshot, {
          previousSnapshotId: previousSnapshot?.generatedAt ?? null,
          currentSnapshotId: candidateSnapshot.generatedAt,
          lastSuccessfulRefreshAt: candidateSnapshot.generatedAt,
          lastAttemptedRefreshAt: candidateSnapshot.generatedAt,
          isStale: false,
          status: "success",
        }),
      );
    },

    async markRefreshFailure(errorMessage) {
      const currentSnapshot = await this.getCurrentSnapshot().catch(() => null);

      if (errorMessage) {
        console.warn(`Snapshot refresh failed: ${errorMessage}`);
      }

      await writeBlobJson(
        snapshotBlobPaths.refreshStatus,
        buildDefaultRefreshStatus(currentSnapshot, {
          previousSnapshotId: null,
          currentSnapshotId: currentSnapshot?.generatedAt ?? null,
          lastAttemptedRefreshAt: new Date().toISOString(),
          lastSuccessfulRefreshAt: currentSnapshot?.generatedAt ?? null,
          isStale: true,
          status: "failed",
        }),
      );
    },
  };
}

export const defaultSnapshotStore = hasBlobToken()
  ? createVercelBlobSnapshotStore()
  : createLocalFileSnapshotStore();
