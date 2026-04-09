import type { NormalizedArticle } from "@/lib/news/contracts/normalized-schema";

export type ArticleSummarizer = (article: NormalizedArticle) => Promise<string>;
