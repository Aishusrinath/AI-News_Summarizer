import { NextResponse } from "next/server";

import {
  markNewsRefreshFailure,
  runNewsRefresh,
} from "@/lib/news/pipeline/run-news-refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      {
        error:
          "Missing BLOB_READ_WRITE_TOKEN. Live refresh needs Vercel Blob storage.",
      },
      { status: 500 },
    );
  }

  try {
    const dataset = await runNewsRefresh();

    return NextResponse.json({
      ok: true,
      generatedAt: dataset.generatedAt,
      finalArticles: dataset.counts.finalArticles,
      summarizedWithAi: dataset.counts.summarizedWithAi,
      fallbackSummaries: dataset.counts.fallbackSummaries,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to refresh news.";
    await markNewsRefreshFailure(message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
