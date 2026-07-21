/** Comma-separated whole numbers — mirrors legacy `formatLargeNumber`. */
export function formatLargeNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}
