/** Comma-separated whole numbers — mirrors legacy `formatLargeNumber`. */
export function formatLargeNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** Whole-dollar amounts with a leading `$`. */
export function formatDollarAmount(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
