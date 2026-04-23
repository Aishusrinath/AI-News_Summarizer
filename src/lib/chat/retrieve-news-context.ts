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
  "update",
  "updates",
  "what",
  "whats",
  "when",
  "where",
  "who",
  "will",
  "why",
  "with",
]);

const categoryQueryHints: Record<SupportedCategory, string[]> = {
  world: ["global", "international", "foreign"],
  politics: ["congress", "election", "government", "policy", "white house"],
  business: ["market", "markets", "company", "companies", "stock", "stocks", "economy"],
  technology: ["ai", "artificial intelligence", "tech", "software", "cyber", "security"],
  science: ["research", "study", "space", "scientists"],
  health: ["medical", "medicine", "doctor", "doctors", "cancer", "disease"],
};

const categoryHintTokens = new Set(
  Object.values(categoryQueryHints)
    .flat()
    .flatMap((hint) => tokenize(hint)),
);

const broadSnapshotSignals = [
  "headline",
  "headlines",
  "latest",
  "top stories",
  "top news",
  "news today",
  "what changed",
  "this hour",
  "current snapshot",
];

const broadSnapshotTokens = new Set(broadSnapshotSignals.flatMap((signal) => tokenize(signal)));
const outOfScopeSignals = ["sports", "weather", "forecast", "rain", "tomorrow"];

function getQueryTokens(message: string) {
  return message
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function getRequestedCategories(message: string): SupportedCategory[] {
  const normalizedMessage = message.toLowerCase();
  const messageTokens = new Set(tokenize(message));
  const possibleCategories: SupportedCategory[] = [
    "world",
    "politics",
    "business",
    "technology",
    "science",
    "health",
  ];

  return possibleCategories.filter(
    (category) =>
      messageTokens.has(category) ||
      categoryQueryHints[category].some((hint) =>
        hint.includes(" ") ? normalizedMessage.includes(hint) : messageTokens.has(hint),
      ),
  );
}

function hasBroadSnapshotIntent(message: string) {
  const normalizedMessage = message.toLowerCase();

  return broadSnapshotSignals.some((signal) => normalizedMessage.includes(signal));
}

function hasOutOfScopeIntent(message: string) {
  const messageTokens = new Set(tokenize(message));

  return outOfScopeSignals.some((signal) => messageTokens.has(signal));
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

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function hasTokenMatch(tokens: Set<string>, queryToken: string) {
  return (
    tokens.has(queryToken) ||
    (queryToken.length >= 5 &&
      [...tokens].some((token) => token === `${queryToken}s` || queryToken === `${token}s`))
  );
}

function isCategoryToken(token: string) {
  return categoryHintTokens.has(token) || token === "election" || token === "elections";
}

function getSpecificQueryTokens(message: string) {
  return getQueryTokens(message).filter(
    (token) => !broadSnapshotTokens.has(token) && !isCategoryToken(token),
  );
}

function scoreArticle(article: ProcessedArticle, message: string, articleSlug?: string) {
  const text = articleText(article);
  const textTokens = new Set(tokenize(text));
  const titleTokens = new Set(tokenize(article.title));
  const tokens = getQueryTokens(message);
  const specificTokens = getSpecificQueryTokens(message);
  const requestedCategories = getRequestedCategories(message);
  const publishedMs = new Date(article.publishedAt).getTime();
  const ageHours = Math.max(0, (Date.now() - publishedMs) / (1000 * 60 * 60));

  let score = hasBroadSnapshotIntent(message) ? Math.max(0, 48 - ageHours) : 0;

  for (const token of tokens) {
    if (hasTokenMatch(textTokens, token)) {
      score += hasTokenMatch(titleTokens, token) ? 8 : 4;
    }
  }

  if (requestedCategories.includes(canonicalizeCategory(article.category))) {
    score += 10;
  }

  if (article.summaryType === "ai" && score > 0) {
    score += 3;
  }

  if (articleSlug && article.slug === articleSlug) {
    score += 50;
  }

  if (
    !articleSlug &&
    specificTokens.length > 0 &&
    !specificTokens.some((token) => hasTokenMatch(textTokens, token))
  ) {
    return 0;
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
  const specificTokens = getSpecificQueryTokens(input.message);
  const requestedCategories = getRequestedCategories(input.message);

  if (!input.articleSlug && hasOutOfScopeIntent(input.message)) {
    return {
      relevantArticles: [],
      previousArticlesById: new Map<string, ProcessedArticle>(),
      needsChangeTracking: queryNeedsChangeTracking(input.message),
      requestedCategories,
      hasRequestedCategoryCoverage: false,
    };
  }

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
    relevantArticles.length > 0 ||
    !hasBroadSnapshotIntent(input.message) ||
    specificTokens.length > 0
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
    requestedCategories,
    hasRequestedCategoryCoverage:
      requestedCategories.length === 0 ||
      fallbackArticles.some((article) =>
        requestedCategories.includes(canonicalizeCategory(article.category)),
      ),
  };
}
