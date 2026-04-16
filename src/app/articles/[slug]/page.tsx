import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleDetail } from "@/components/article-detail";
import { getArticleDetail } from "@/lib/data/get-article-detail";

export default async function ArticleDetailPage({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const articleDetail = await getArticleDetail(slug);

  if (!articleDetail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_35%),linear-gradient(180deg,_#f7f3ea_0%,_#f2eee6_100%)] px-6 py-10 md:px-10">
      <div className="mx-auto mb-8 flex w-full max-w-7xl justify-between gap-4">
        <Link href="/" className="text-sm font-medium text-stone-700 hover:text-stone-950">
          Back to headlines
        </Link>
      </div>
      <ArticleDetail
        article={articleDetail.article}
        relatedStories={articleDetail.relatedStories}
        refreshStatus={articleDetail.refreshStatus}
        snapshotGeneratedAt={articleDetail.snapshotGeneratedAt}
      />
    </main>
  );
}
