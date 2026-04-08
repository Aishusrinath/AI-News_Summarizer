import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_35%),linear-gradient(180deg,_#f7f3ea_0%,_#f2eee6_100%)] px-6 py-16">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-lg shadow-stone-200/70">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
          Article not found
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          That article is not available in the current processed dataset.
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          The slug may be outdated, or the latest validated dataset no longer includes it.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 hover:bg-stone-800"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
