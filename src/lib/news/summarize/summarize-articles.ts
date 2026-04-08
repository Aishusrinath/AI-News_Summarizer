import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";
import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";
import type { ArticleSummarizer } from "@/lib/news/summarize/openai-summarizer";

function buildFallbackSummary(article: NormalizedArticle): string {
  if (article.description) {
    return `${article.title}. ${article.description}`;
  }

  return article.title;
}

export async function summarizeArticles(
  articles: NormalizedArticle[],
  summarizeArticle: ArticleSummarizer,
): Promise<ProcessedArticle[]> {
  const results: ProcessedArticle[] = [];

  for (const article of articles) {
    try {
      const summary = await summarizeArticle(article);

      results.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        category: article.category,
        url: article.url,
        summary,
        summaryType: "ai",
        description: article.description,
        imageUrl: article.imageUrl,
        author: article.author,
        cleanedText: article.cleanedText,
      });
    } catch {
      results.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        category: article.category,
        url: article.url,
        summary: buildFallbackSummary(article),
        summaryType: "fallback",
        description: article.description,
        imageUrl: article.imageUrl,
        author: article.author,
        cleanedText: article.cleanedText,
      });
    }
  }

  return results;
}
