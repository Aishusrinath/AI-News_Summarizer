"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { formatDate } from "@/lib/formatting/format-date";

type LiveRefreshProps = {
  generatedAt: string;
};

type RefreshStatusResponse = {
  generatedAt: string;
  finalArticles: number;
  refreshStatus: "idle" | "success" | "failed";
  isStale: boolean;
};

const pollingIntervalMs = 30_000;

export function LiveRefresh({ generatedAt }: LiveRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const latestGeneratedAtRef = useRef(generatedAt);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    latestGeneratedAtRef.current = generatedAt;
  }, [generatedAt]);

  useEffect(() => {
    let isMounted = true;

    async function checkForRefresh() {
      try {
        const response = await fetch(`/api/refresh/status?ts=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Status check failed with ${response.status}.`);
        }

        const status = (await response.json()) as RefreshStatusResponse;

        if (!isMounted) {
          return;
        }

        setError(null);
        setLastCheckedAt(new Date().toISOString());

        if (status.generatedAt !== latestGeneratedAtRef.current) {
          latestGeneratedAtRef.current = status.generatedAt;
          startTransition(() => {
            router.refresh();
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setError(error instanceof Error ? error.message : "Unable to check refresh status.");
      }
    }

    const intervalId = window.setInterval(checkForRefresh, pollingIntervalMs);
    void checkForRefresh();

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [router]);

  return (
    <div
      className="rounded-2xl border border-stone-200 bg-white/75 px-4 py-3 text-xs text-stone-600 shadow-sm"
      aria-live="polite"
    >
      <p className="font-semibold uppercase tracking-[0.16em] text-stone-500">
        Live refresh
      </p>
      <p className="mt-1 leading-5">
        {isPending
          ? "New snapshot found. Updating this page..."
          : `Watching for updates every ${pollingIntervalMs / 1000} seconds.`}
      </p>
      {lastCheckedAt ? (
        <p className="mt-1 leading-5">Last checked {formatDate(lastCheckedAt)}.</p>
      ) : null}
      {error ? <p className="mt-1 leading-5 text-rose-700">{error}</p> : null}
    </div>
  );
}
