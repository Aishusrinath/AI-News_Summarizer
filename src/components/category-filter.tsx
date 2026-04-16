import Link from "next/link";

import {
  categoryLabels,
  type SupportedCategory,
} from "@/lib/news/contracts/raw-schema";

type CategoryFilterProps = {
  activeCategory: SupportedCategory | "all";
  availableCategories: SupportedCategory[];
};

const labels: Record<SupportedCategory | "all", string> = {
  all: "All",
  world: categoryLabels.world,
  politics: categoryLabels.politics,
  business: categoryLabels.business,
  technology: categoryLabels.technology,
  science: categoryLabels.science,
  health: categoryLabels.health,
};

export function CategoryFilter({
  activeCategory,
  availableCategories,
}: CategoryFilterProps) {
  const filterValues: (SupportedCategory | "all")[] = ["all", ...availableCategories];

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
