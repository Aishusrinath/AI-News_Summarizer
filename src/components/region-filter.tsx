import Link from "next/link";

import type { SupportedCategory } from "@/lib/news/contracts/raw-schema";
import {
  regionLabels,
  type SupportedRegion,
} from "@/lib/news/contracts/regions";

type RegionFilterProps = {
  activeCategory: SupportedCategory | "all";
  activeRegion: SupportedRegion | "all";
  availableRegions: SupportedRegion[];
};

const labels: Record<SupportedRegion | "all", string> = {
  all: "All regions",
  us: regionLabels.us,
  gb: regionLabels.gb,
  ca: regionLabels.ca,
  au: regionLabels.au,
  in: regionLabels.in,
};

function buildHref(
  category: SupportedCategory | "all",
  region: SupportedRegion | "all",
) {
  const params = new URLSearchParams();

  if (category !== "all") {
    params.set("category", category);
  }

  if (region !== "all") {
    params.set("region", region);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function RegionFilter({
  activeCategory,
  activeRegion,
  availableRegions,
}: RegionFilterProps) {
  const filterValues: (SupportedRegion | "all")[] = ["all", ...availableRegions];

  return (
    <nav className="flex flex-wrap gap-3" aria-label="News regions">
      {filterValues.map((region) => {
        const isActive = region === activeRegion;

        return (
          <Link
            key={region}
            href={buildHref(activeCategory, region)}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-amber-800 bg-amber-800 text-amber-50"
                : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-500",
            ].join(" ")}
          >
            {labels[region]}
          </Link>
        );
      })}
    </nav>
  );
}
