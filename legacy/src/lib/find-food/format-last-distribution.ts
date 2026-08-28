/** Format Surplus `lastSharingExcessDistribution` unix timestamp for display. */
export function formatLastSharingExcessDistribution(
  timestamp: number | null | undefined,
): string | null {
  if (timestamp == null) return null;

  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
