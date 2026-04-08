import { createHash } from "node:crypto";

import {
  categoryValues,
  type Category,
  type RawArticle,
} from "@/lib/news/contracts/raw-schema";
import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";
import { generateArticleSlug } from "@/lib/news/etl/generate-article-slug";

const approvedCategories = new Set<string>(categoryValues);

function normalizeCategory(value?: string | null): Category {
  if (!value) {
    return "general";
  }

  const normalized = value.trim().toLowerCase();
  return approvedCategories.has(normalized) ? (normalized as Category) : "general";
}

function cleanText(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const cleaned = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
}

function deriveCanonicalUrl(url: string): string {
  return url.split("?")[0].replace(/\/+$/, "");
}

function buildId(canonicalUrl: string): string {
  return createHash("sha256").update(canonicalUrl).digest("hex").slice(0, 16);
}

function scoreArticle(article: {
  description?: string;
  cleanedText?: string;
  imageUrl?: string;
  author?: string;
}): number {
  let score = 1;

  if (article.description) score += 1;
  if (article.cleanedText) score += 2;
  if (article.imageUrl) score += 1;
  if (article.author) score += 1;

  return score;
}

export function normalizeArticles(rawArticles: RawArticle[]): NormalizedArticle[] {
  return rawArticles.flatMap((article) => {
    const title = cleanText(article.title);
    const url = article.url?.trim();
    const sourceName = cleanText(article.source?.name) ?? "Unknown source";
    const description = cleanText(article.description);
    const cleanedText = cleanText(article.content);

    if (!title || !url || !article.publishedAt) {
      return [];
    }

    const publishedAt = new Date(article.publishedAt).toISOString();
    const canonicalUrl = deriveCanonicalUrl(url);
    const id = buildId(canonicalUrl);

    return [
      {
        id,
        slug: generateArticleSlug(title, id),
        title,
        sourceName,
        publishedAt,
        category: normalizeCategory(article.category),
        url,
        description,
        imageUrl: article.urlToImage ?? undefined,
        author: cleanText(article.author),
        cleanedText,
        summaryInput: {
          title,
          description,
          cleanedText,
        },
        qualityScore: scoreArticle({
          description,
          cleanedText,
          imageUrl: article.urlToImage ?? undefined,
          author: cleanText(article.author),
        }),
        canonicalUrl,
      },
    ];
  });
}
