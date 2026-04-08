import { z } from "zod";

import { categorySchema } from "@/lib/news/contracts/raw-schema";

export const summaryTypeSchema = z.enum(["ai", "fallback"]);

export const processedArticleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  sourceName: z.string().min(1),
  publishedAt: z.string().datetime({ offset: true }),
  category: categorySchema,
  url: z.string().url(),
  summary: z.string().min(1),
  summaryType: summaryTypeSchema,
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  author: z.string().optional(),
  cleanedText: z.string().optional(),
});

export const processedDatasetSchema = z.object({
  generatedAt: z.string().datetime({ offset: true }),
  source: z.string().min(1),
  categories: z.array(categorySchema),
  counts: z.object({
    fetched: z.number().int().nonnegative(),
    normalized: z.number().int().nonnegative(),
    dropped: z.number().int().nonnegative(),
    deduped: z.number().int().nonnegative(),
    summarizedWithAi: z.number().int().nonnegative(),
    fallbackSummaries: z.number().int().nonnegative(),
    finalArticles: z.number().int().nonnegative(),
  }),
  articles: z.array(processedArticleSchema),
});

export type ProcessedArticle = z.infer<typeof processedArticleSchema>;
export type ProcessedDataset = z.infer<typeof processedDatasetSchema>;
