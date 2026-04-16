import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-stone-200 bg-white/90 shadow-sm shadow-stone-200/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="text-lg font-semibold text-stone-950 hover:text-amber-700 transition-colors">
          AI News Summarizer
        </Link>
        <Link
          href="/chat"
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 transition-colors"
        >
          Chat
        </Link>
      </div>
    </nav>
  );
}