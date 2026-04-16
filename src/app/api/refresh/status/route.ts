import { NextResponse } from "next/server";

import { loadArticles, loadRefreshStatus } from "@/lib/data/load-articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [dataset, refreshStatus] = await Promise.all([
    loadArticles(),
    loadRefreshStatus(),
  ]);

  return NextResponse.json({
    generatedAt: dataset.generatedAt,
    finalArticles: dataset.counts.finalArticles,
    refreshStatus: refreshStatus.status,
    isStale: refreshStatus.isStale,
  });
}
