import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";
import type { DashboardStory } from "@/lib/data/dashboard";
import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";

type ArticleListProps = {
  articles: ProcessedArticle[] | DashboardStory[];
  emptyStateDescription?: string;
  emptyStateTitle?: string;
};

export function ArticleList({
  articles,
  emptyStateDescription = "This category is available, but there were no validated articles in the latest processed dataset.",
  emptyStateTitle = "No articles in this filter",
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <EmptyState
        title={emptyStateTitle}
        description={emptyStateDescription}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((entry) => {
        if ("article" in entry) {
          return (
            <ArticleCard
              key={entry.article.id}
              article={entry.article}
              statuses={entry.statuses}
            />
          );
        }

        return <ArticleCard key={entry.id} article={entry} />;
      })}
    </div>
  );
}
