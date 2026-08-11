import { formatDollarAmount } from "@/lib/formatNumber";

/** Reference weights (lbs) for live impact equivalents beneath the total-lbs metric. */
export const LIFETIME_FOOD_LBS_PER_PERSON = 1_000_000;

/** Statue of Liberty copper structure — 225 metric tons (National Park Service). */
export const STATUE_OF_LIBERTY_LBS = 450_000;

/** Feeding America standard — Surplus impact measurement docs. */
export const LBS_PER_MEAL = 1.2;

/** SE impact page: $45 retail value per 14.5 lbs delivered per $1 donated. */
export const RETAIL_VALUE_PER_LB = 45 / 14.5;

/** Approximate weight of one person's Thanksgiving meal (USDA). */
export const THANKSGIVING_DINNER_LBS = 4;

/** ~2,000 lbs of food per person per year × four people. */
export const FAMILY_OF_FOUR_ANNUAL_LBS = 8_000;

/** One family of four fed for 30 years. */
export const FAMILY_OF_FOUR_THIRTY_YEAR_LBS = FAMILY_OF_FOUR_ANNUAL_LBS * 30;

export interface ImpactEquivalent {
  id: string;
  /** Full phrase after "That's " — includes the multiplier where applicable. */
  phrase: string;
}

function formatMultiplier(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";

  if (value >= 100) {
    return Math.round(value).toLocaleString("en-US");
  }

  if (value >= 10) {
    return String(Math.round(value));
  }

  if (value >= 1) {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  return (Math.round(value * 10) / 10).toFixed(1);
}

function formatWholeCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return Math.round(value).toLocaleString("en-US");
}

/** Builds the rotating equivalent phrases for a live donated-weight total. */
export function getImpactEquivalents(totalLbs: number): ImpactEquivalent[] {
  if (!Number.isFinite(totalLbs) || totalLbs <= 0) return [];

  const lifetimeMultiplier = formatMultiplier(totalLbs / LIFETIME_FOOD_LBS_PER_PERSON);
  const libertyMultiplier = formatMultiplier(totalLbs / STATUE_OF_LIBERTY_LBS);
  const mealsCount = formatWholeCount(totalLbs / LBS_PER_MEAL);
  const retailValue = formatDollarAmount(totalLbs * RETAIL_VALUE_PER_LB);
  const thanksgivingCount = formatWholeCount(totalLbs / THANKSGIVING_DINNER_LBS);
  const familyCount = formatWholeCount(totalLbs / FAMILY_OF_FOUR_THIRTY_YEAR_LBS);

  return [
    {
      id: "lifetime",
      phrase: `${lifetimeMultiplier}x the amount the average person eats in an entire lifetime.`,
    },
    {
      id: "liberty",
      phrase: `${libertyMultiplier}x the weight of the Statue of Liberty.`,
    },
    {
      id: "meals",
      phrase: `${mealsCount} meals made possible.`,
    },
    {
      id: "retail-value",
      phrase: `${retailValue} worth of food.`,
    },
    {
      id: "thanksgiving",
      phrase: `${thanksgivingCount} Thanksgiving dinners.`,
    },
    {
      id: "family-thirty-years",
      phrase: `enough to feed ${familyCount} families of four for 30 years.`,
    },
  ];
}
