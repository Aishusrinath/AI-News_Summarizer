import { NextResponse } from "next/server";

import { loadArticles, loadRefreshStatus } from "@/lib/data/load-articles";
import { isSupportedRegion, sortSupportedRegions } from "@/lib/news/contracts/regions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [dataset, refreshStatus] = await Promise.all([
    loadArticles(),
    loadRefreshStatus(),
  ]);
  const regions = sortSupportedRegions(
    [
      ...new Set(
        dataset.articles
          .map((article) => article.sourceCountry)
          .filter((region): region is NonNullable<typeof region> => Boolean(region))
          .filter(isSupportedRegion),
      ),
    ],
  );

  return NextResponse.json({
    generatedAt: dataset.generatedAt,
    articleCount: dataset.articles.length,
    source: dataset.source,
    categories: dataset.categories,
    regions,
    counts: dataset.counts,
    refreshStatus,
    storage: process.env.BLOB_READ_WRITE_TOKEN?.trim()
      ? "vercel-blob"
      : "committed-json",
  });
}
