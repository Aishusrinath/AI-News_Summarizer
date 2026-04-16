import {
  retrieveNewsContext,
  queryNeedsChangeTracking,
} from "@/lib/chat/retrieve-news-context";
import type { ChatResponse, ChatSource } from "@/lib/chat/types";
import type { ProcessedArticle, ProcessedDataset } from "@/lib/news/contracts/processed-schema";
import { categoryLabels, canonicalizeCategory } from "@/lib/news/contracts/raw-schema";

function buildSources(sources: ChatSource[]): ChatSource[] {
  const seen = new Set<string>();

  return sources.filter((source) => {
    if (seen.has(source.id)) {
      return false;
    }

    seen.add(source.id);
    return true;
  });
}

function summarizeCoverage(sources: ChatSource[]) {
  const labels = [...new Set(sources.map((source) => source.label))];

  if (labels.length === 0) {
    return "This answer uses the strongest matches from the current snapshot.";
  }

  if (labels.length === 1) {
    return `Coverage focus: ${labels[0]}.`;
  }

  return `Coverage focus: ${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}.`;
}

function buildSourceLabel(
  message: string,
  article: ProcessedArticle,
  previousArticle?: ProcessedArticle,
) {
  if (queryNeedsChangeTracking(message)) {
    if (!previousArticle) {
      return "New this refresh";
    }

    if (previousArticle.summary !== article.summary) {
      return "Updated in latest refresh";
    }

    return "Still active in current snapshot";
  }

  return categoryLabels[canonicalizeCategory(article.category)];
}

function buildSupportingLine(article: ProcessedArticle) {
  return `${article.title} — ${article.summary}`;
}

export function answerNewsQuestion(input: {
  message: string;
  currentDataset: ProcessedDataset;
  previousDataset: ProcessedDataset | null;
  routingReason: string;
  articleSlug?: string;
}): ChatResponse {
  const context = retrieveNewsContext({
    message: input.message,
    currentDataset: input.currentDataset,
    previousDataset: input.previousDataset,
    articleSlug: input.articleSlug,
  });

  if (context.relevantArticles.length === 0) {
    return {
      mode: "news",
      groundingStatus: "insufficient",
      routingReason: input.routingReason,
      answer:
        "I couldn't find enough support for that in the current snapshot. Try a narrower current-events question, ask about one category at a time, or switch to the General Model for a broader answer.",
      sources: [],
    };
  }

  const sources = buildSources(
    context.relevantArticles.map((article) => {
      const previousArticle = context.previousArticlesById.get(article.id);

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        label: buildSourceLabel(input.message, article, previousArticle),
      };
    }),
  );

  if (context.needsChangeTracking) {
    const changeLines = context.relevantArticles.map((article) => {
      const previousArticle = context.previousArticlesById.get(article.id);

      if (!previousArticle) {
        return `${article.title} is new in the latest snapshot. ${article.summary}`;
      }

      if (previousArticle.summary !== article.summary) {
        return `${article.title} has updated snapshot coverage. ${article.summary}`;
      }

      return `${article.title} remains in focus in the latest snapshot. ${article.summary}`;
    });

    return {
      mode: "news",
      groundingStatus: "grounded",
      routingReason: input.routingReason,
      answer: [
        "Grounded snapshot briefing:",
        "Current focus: what shifted between the latest and previous snapshots.",
        ...changeLines,
      ].join("\n\n"),
      sources,
    };
  }

  const [leadArticle, ...supportingArticles] = context.relevantArticles;

  return {
    mode: "news",
    groundingStatus: "grounded",
    routingReason: input.routingReason,
    answer: [
      "Grounded snapshot briefing:",
      summarizeCoverage(sources),
      `Key takeaway: ${leadArticle.title} — ${leadArticle.summary}`,
      ...supportingArticles.map((article) => buildSupportingLine(article)),
    ].join("\n\n"),
    sources,
  };
}
