import { z } from "zod";

export const supportedCategoryValues = [
  "world",
  "politics",
  "business",
  "technology",
  "science",
  "health",
] as const;

export const legacyCategoryValues = ["general"] as const;

export const categoryValues = [...supportedCategoryValues, ...legacyCategoryValues] as const;

export const supportedCategorySchema = z.enum(supportedCategoryValues);
export const categorySchema = z.enum(categoryValues);

export const categoryLabels: Record<Category, string> = {
  world: "World",
  politics: "Politics",
  business: "Business",
  technology: "Technology",
  science: "Science",
  health: "Health",
  general: "World",
};

export const supportedCategoryOrder: SupportedCategory[] = [
  "world",
  "politics",
  "business",
  "technology",
  "science",
  "health",
];

export function canonicalizeCategory(category: Category): SupportedCategory {
  return category === "general" ? "world" : category;
}

export function sortSupportedCategories(categories: SupportedCategory[]) {
  return [...categories].sort(
    (left, right) =>
      supportedCategoryOrder.indexOf(left) - supportedCategoryOrder.indexOf(right),
  );
}

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
export type SupportedCategory = z.infer<typeof supportedCategorySchema>;
export type RawArticle = z.infer<typeof rawArticleSchema>;
export type RawNewsApiResponse = z.infer<typeof rawNewsApiResponseSchema>;
