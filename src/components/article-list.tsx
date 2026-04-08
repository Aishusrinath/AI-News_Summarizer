import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";
import type { ProcessedArticle } from "@/lib/news/contracts/processed-schema";

type ArticleListProps = {
  articles: ProcessedArticle[];
};

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <EmptyState
        title="No articles in this filter"
        description="This category is available, but there were no validated articles in the latest processed dataset."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
