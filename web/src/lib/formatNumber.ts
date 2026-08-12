/** Comma-separated whole numbers — mirrors legacy `formatLargeNumber`. */
export function formatLargeNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** Compact figures for map stat tiles — e.g. 5.8M, 340K. */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";

  if (value >= 1_000_000) {
    const compact = value / 1_000_000;
    const rounded = Math.round(compact * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    const compact = value / 1_000;
    const rounded = Math.round(compact * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}K`;
  }

  return formatLargeNumber(value);
}

/** Whole-dollar amounts with a leading `$`. */
export function formatDollarAmount(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
