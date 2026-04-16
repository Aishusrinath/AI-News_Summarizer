export const supportedRegionValues = ["us", "gb", "ca", "au", "in"] as const;

export type SupportedRegion = (typeof supportedRegionValues)[number];

export const regionLabels: Record<SupportedRegion, string> = {
  us: "US",
  gb: "UK",
  ca: "Canada",
  au: "Australia",
  in: "India",
};

export function isSupportedRegion(value: string): value is SupportedRegion {
  return supportedRegionValues.includes(value as SupportedRegion);
}

export function sortSupportedRegions(regions: SupportedRegion[]) {
  return [...regions].sort(
    (left, right) =>
      supportedRegionValues.indexOf(left) - supportedRegionValues.indexOf(right),
  );
}
