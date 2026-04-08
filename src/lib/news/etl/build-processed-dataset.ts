import type { Category } from "@/lib/news/contracts/raw-schema";
import type {
  ProcessedArticle,
  ProcessedDataset,
} from "@/lib/news/contracts/processed-schema";

type CountsInput = ProcessedDataset["counts"];

export function buildProcessedDataset(input: {
  generatedAt: string;
  source: string;
  articles: ProcessedArticle[];
  counts: CountsInput;
}): ProcessedDataset {
  const categories = [...new Set(input.articles.map((article) => article.category))] as Category[];

  return {
    generatedAt: input.generatedAt,
    source: input.source,
    categories,
    counts: {
      ...input.counts,
      finalArticles: input.articles.length,
    },
    articles: input.articles,
  };
}
