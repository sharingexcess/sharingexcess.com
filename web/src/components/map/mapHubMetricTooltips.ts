import type { MapHubMetricId } from "./types";

/** Info-popover copy for map hub metric tiles. */
export const MAP_HUB_METRIC_TOOLTIPS: Record<MapHubMetricId, string> = {
  meals: "Estimated at 1.2 lbs of food per meal (USDA).",
  weight: "The summed weight of all food items delivered to community organizations.",
  partners: "Distinct recipient organizations that received donated food.",
  emissions:
    "0.25–1.09 lbs CO₂e/lb by category — WARM v16 net landfill GHG avoided by diverting food from landfills.",
};
