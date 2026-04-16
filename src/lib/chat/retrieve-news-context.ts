import type { ProcessedArticle, ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import { canonicalizeCategory, type SupportedCategory } from "@/lib/news/contracts/raw-schema";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
]);

function getQueryTokens(message: string) {
  return message
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function getRequestedCategories(message: string): SupportedCategory[] {
  const normalizedMessage = message.toLowerCase();
  const possibleCategories: SupportedCategory[] = [
    "world",
    "politics",
    "business",
    "technology",
    "science",
    "health",
  ];

  return possibleCategories.filter((category) => normalizedMessage.includes(category));
}

function articleText(article: ProcessedArticle) {
  return [
    article.title,
    article.summary,
    article.description,
    article.cleanedText,
    article.sourceName,
    canonicalizeCategory(article.category),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreArticle(article: ProcessedArticle, message: string, articleSlug?: string) {
  const text = articleText(article);
  const tokens = getQueryTokens(message);
  const requestedCategories = getRequestedCategories(message);
  const publishedMs = new Date(article.publishedAt).getTime();
  const ageHours = Math.max(0, (Date.now() - publishedMs) / (1000 * 60 * 60));

  let score = Math.max(0, 48 - ageHours);

  for (const token of tokens) {
    if (text.includes(token)) {
      score += article.title.toLowerCase().includes(token) ? 8 : 4;
    }
  }

  if (requestedCategories.includes(canonicalizeCategory(article.category))) {
    score += 10;
  }

  if (article.summaryType === "ai") {
    score += 3;
  }

  if (articleSlug && article.slug === articleSlug) {
    score += 50;
  }

  return score;
}

export function queryNeedsChangeTracking(message: string) {
  return /\b(change|changed|since|hour|hourly|latest refresh|new this hour|what changed)\b/i.test(
    message,
  );
}

export function retrieveNewsContext(input: {
  message: string;
  currentDataset: ProcessedDataset;
  previousDataset: ProcessedDataset | null;
  articleSlug?: string;
}) {
  const rankedArticles = [...input.currentDataset.articles]
    .map((article) => ({
      article,
      score: scoreArticle(article, input.message, input.articleSlug),
    }))
    .sort((left, right) => right.score - left.score);

  const relevantArticles = rankedArticles
    .filter((entry) => entry.score > 0)
    .slice(0, 4)
    .map((entry) => entry.article);

  const fallbackArticles =
    relevantArticles.length > 0
      ? relevantArticles
      : [...input.currentDataset.articles]
          .sort(
            (left, right) =>
              new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
          )
          .slice(0, 3);

  const previousArticlesById = new Map(
    (input.previousDataset?.articles ?? []).map((article) => [article.id, article]),
  );

  return {
    relevantArticles: fallbackArticles,
    previousArticlesById,
    needsChangeTracking: queryNeedsChangeTracking(input.message),
  };
}
