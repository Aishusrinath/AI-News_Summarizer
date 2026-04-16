import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";
import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";
import type { ArticleSummarizer } from "@/lib/news/summarize/article-summarizer";

export function buildFallbackSummary(article: NormalizedArticle): string {
  if (article.description) {
    return `${article.title}. ${article.description}`;
  }

  return article.title;
}

export function buildFallbackProcessedArticle(article: NormalizedArticle): ProcessedArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    sourceName: article.sourceName,
    publishedAt: article.publishedAt,
    category: article.category,
    sourceCountry: article.sourceCountry,
    url: article.url,
    summary: buildFallbackSummary(article),
    summaryType: "fallback",
    description: article.description,
    imageUrl: article.imageUrl,
    author: article.author,
    cleanedText: article.cleanedText,
  };
}

function formatSummarizationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

export async function summarizeArticles(
  articles: NormalizedArticle[],
  summarizeArticle: ArticleSummarizer,
): Promise<ProcessedArticle[]> {
  const results: ProcessedArticle[] = [];
  const total = articles.length;

  console.log(`Summarizing ${total} article${total === 1 ? "" : "s"}...`);

  for (const [index, article] of articles.entries()) {
    const progressLabel = `[${index + 1}/${total}] ${article.title}`;

    console.log(`${progressLabel} - requesting AI summary`);

    try {
      const summary = await summarizeArticle(article);

      console.log(`${progressLabel} - AI summary complete`);

      results.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        category: article.category,
        sourceCountry: article.sourceCountry,
        url: article.url,
        summary,
        summaryType: "ai",
        description: article.description,
        imageUrl: article.imageUrl,
        author: article.author,
        cleanedText: article.cleanedText,
      });
    } catch (error) {
      console.warn(
        `${progressLabel} - AI summary failed, using fallback summary (${formatSummarizationError(error)})`,
      );

      results.push(buildFallbackProcessedArticle(article));
    }
  }

  console.log(`Finished summarizing ${results.length} article${results.length === 1 ? "" : "s"}.`);

  return results;
}
