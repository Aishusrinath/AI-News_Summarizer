import { z } from "zod";

import { categorySchema, supportedCategorySchema } from "@/lib/news/contracts/raw-schema";

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

export const refreshStatusSchema = z.object({
  currentSnapshotId: z.string().min(1).nullable(),
  previousSnapshotId: z.string().min(1).nullable(),
  lastSuccessfulRefreshAt: z.string().datetime({ offset: true }).nullable(),
  lastAttemptedRefreshAt: z.string().datetime({ offset: true }).nullable(),
  isStale: z.boolean(),
  status: z.enum(["idle", "success", "failed"]),
});

export const processedDatasetSchema = z.object({
  generatedAt: z.string().datetime({ offset: true }),
  source: z.string().min(1),
  categories: z.array(supportedCategorySchema).default([]),
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
  refreshStatus: refreshStatusSchema.optional(),
});

export type ProcessedArticle = z.infer<typeof processedArticleSchema>;
export type ProcessedDataset = z.infer<typeof processedDatasetSchema>;
export type RefreshStatus = z.infer<typeof refreshStatusSchema>;
