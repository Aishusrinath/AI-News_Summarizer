import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");

export const newsArtifactPaths = {
  rawLatest: path.join(dataDirectory, "raw", "latest.json"),
  candidateArticles: path.join(dataDirectory, "tmp", "candidate-articles.json"),
  currentSnapshot: path.join(dataDirectory, "processed", "current.json"),
  previousSnapshot: path.join(dataDirectory, "processed", "previous.json"),
  processedArticles: path.join(dataDirectory, "processed", "articles.json"),
  refreshStatus: path.join(dataDirectory, "processed", "refresh-status.json"),
  runReport: path.join(dataDirectory, "tmp", "run-report.json"),
} as const;

export async function readJsonArtifact<T>(filePath: string): Promise<T> {
  const fileContents = await readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

export async function writeJsonArtifact(filePath: string, value: unknown) {
  await writeFile(filePath, JSON.stringify(value, null, 2));
}
