import { z } from "zod";

export const categoryValues = ["general", "technology", "business"] as const;

export const categorySchema = z.enum(categoryValues);

export const rawArticleSchema = z.object({
  source: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
    })
    .optional(),
  author: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  urlToImage: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});

export const rawNewsApiResponseSchema = z.object({
  status: z.string().optional(),
  articles: z.array(rawArticleSchema).default([]),
});

export type Category = z.infer<typeof categorySchema>;
export type RawArticle = z.infer<typeof rawArticleSchema>;
export type RawNewsApiResponse = z.infer<typeof rawNewsApiResponseSchema>;
