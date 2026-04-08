import { z } from "zod";

import { categorySchema } from "@/lib/news/contracts/raw-schema";

export const normalizedArticleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  sourceName: z.string().min(1),
  publishedAt: z.string().datetime({ offset: true }),
  category: categorySchema,
  url: z.string().url(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  author: z.string().optional(),
  cleanedText: z.string().optional(),
  summaryInput: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    cleanedText: z.string().optional(),
  }),
  qualityScore: z.number().nonnegative(),
  canonicalUrl: z.string().url(),
});

export type NormalizedArticle = z.infer<typeof normalizedArticleSchema>;
