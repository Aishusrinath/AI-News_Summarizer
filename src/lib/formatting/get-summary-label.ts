import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";

export function getSummaryLabel(summaryType: ProcessedArticle["summaryType"]): string {
  return summaryType === "ai" ? "AI summary" : "Excerpt-based quick take";
}
