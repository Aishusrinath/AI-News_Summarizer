import { ArticleList } from "@/components/article-list";
import type { DashboardStory } from "@/lib/data/dashboard";

type DashboardSectionProps = {
  title: string;
  description: string;
  emptyStateDescription?: string;
  stories: DashboardStory[];
};

export function DashboardSection({
  title,
  description,
  emptyStateDescription,
  stories,
}: DashboardSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
        <p className="text-sm leading-7 text-stone-600">{description}</p>
      </div>

      <ArticleList
        articles={stories}
        emptyStateDescription={emptyStateDescription}
      />
    </section>
  );
}
