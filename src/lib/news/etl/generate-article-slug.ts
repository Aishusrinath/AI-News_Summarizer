export function generateArticleSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = id.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase();

  return `${base || "article"}-${suffix}`;
}
