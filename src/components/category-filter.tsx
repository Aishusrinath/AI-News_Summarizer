import Link from "next/link";

import type { Category } from "@/lib/news/contracts/raw-schema";

type CategoryFilterProps = {
  activeCategory: Category | "all";
  availableCategories: Category[];
};

const labels: Record<Category | "all", string> = {
  all: "All",
  general: "General",
  technology: "Technology",
  business: "Business",
};

export function CategoryFilter({
  activeCategory,
  availableCategories,
}: CategoryFilterProps) {
  const filterValues: (Category | "all")[] = ["all", ...availableCategories];

  return (
    <nav className="flex flex-wrap gap-3" aria-label="Article categories">
      {filterValues.map((category) => {
        const isActive = category === activeCategory;
        const href = category === "all" ? "/" : `/?category=${category}`;

        return (
          <Link
            key={category}
            href={href}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-stone-900 bg-stone-900 text-stone-50"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500",
            ].join(" ")}
          >
            {labels[category]}
          </Link>
        );
      })}
    </nav>
  );
}
