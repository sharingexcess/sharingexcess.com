import { formatLargeNumber } from "@/lib/formatNumber";

const TOTAL_LBS_TOKEN = /\{#\s*Total\s*lbs\}|\{totalLbs\}/gi;

function hasTotalLbsToken(title: string): boolean {
  TOTAL_LBS_TOKEN.lastIndex = 0;
  return TOTAL_LBS_TOKEN.test(title);
}

/** Replaces `{# Total lbs}` / `{totalLbs}` tokens with a formatted pound count. */
export function resolveLiveTotalLbsTitle(title: string, donatedWeightLbs: number): string {
  TOTAL_LBS_TOKEN.lastIndex = 0;
  return title.replace(TOTAL_LBS_TOKEN, formatLargeNumber(donatedWeightLbs));
}

/** Splits a title with a live lbs token into a display metric and remaining heading text. */
export function splitLiveTotalLbsTitle(
  title: string,
  donatedWeightLbs: number,
): { metric: string; heading: string } | null {
  if (!hasTotalLbsToken(title)) return null;

  TOTAL_LBS_TOKEN.lastIndex = 0;
  const heading = title.replace(TOTAL_LBS_TOKEN, "").trim();
  return {
    metric: formatLargeNumber(donatedWeightLbs),
    heading,
  };
}
