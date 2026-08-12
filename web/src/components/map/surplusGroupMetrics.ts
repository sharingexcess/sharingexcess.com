import { getImpactGeoJsonUrls, getSurplusApiOrigin } from "@/components/map/mapConfig";
import {
  assignImpactGroupId,
  IMPACT_MAP_GROUPS,
} from "@/components/map/impactMapGroups";
import { MAP_HUB_METRIC_TOOLTIPS } from "@/components/map/mapHubMetricTooltips";
import type { MapHubMetric, MapHubMetricId } from "@/components/map/types";
import { formatCompactNumber, formatLargeNumber } from "@/lib/formatNumber";

const METRICS_PATH = "/public/analytics/metrics";

export interface SurplusImpactMetrics {
  donated_weight: number;
  meals_made_possible: number;
  downstream_emissions_prevented: number;
}

interface GroupAggregate {
  donationCount: number;
  partnerCount: number;
}

const METRIC_ORDER: MapHubMetricId[] = ["meals", "weight", "partners", "emissions"];

function isSurplusImpactMetrics(data: unknown): data is SurplusImpactMetrics {
  if (!data || typeof data !== "object") return false;
  const metrics = data as Record<string, unknown>;
  return (
    typeof metrics.donated_weight === "number" &&
    typeof metrics.meals_made_possible === "number" &&
    typeof metrics.downstream_emissions_prevented === "number"
  );
}

async function fetchSurplusImpactMetrics(
  signal?: AbortSignal,
): Promise<SurplusImpactMetrics | null> {
  const response = await fetch(`${getSurplusApiOrigin()}${METRICS_PATH}`, { signal });
  if (!response.ok) return null;

  const data: unknown = await response.json();
  return isSurplusImpactMetrics(data) ? data : null;
}

async function fetchImpactGeoJson(signal?: AbortSignal): Promise<GeoJSON.FeatureCollection | null> {
  for (const url of getImpactGeoJsonUrls()) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) continue;

      const data = (await response.json()) as GeoJSON.FeatureCollection;
      if (data?.features?.length) return data;
    } catch {
      if (signal?.aborted) return null;
    }
  }

  return null;
}

function aggregateGeoJsonByGroup(geojson: GeoJSON.FeatureCollection): {
  aggregates: Record<string, GroupAggregate>;
  totalDonationCount: number;
} {
  const aggregates = Object.fromEntries(
    IMPACT_MAP_GROUPS.map((group) => [group.id, { donationCount: 0, partnerCount: 0 }]),
  ) as Record<string, GroupAggregate>;

  let totalDonationCount = 0;

  for (const feature of geojson.features) {
    if (feature.geometry?.type !== "Point") continue;

    const [lng, lat] = feature.geometry.coordinates as [number, number];
    const groupId = assignImpactGroupId(lng, lat);
    if (!groupId || !aggregates[groupId]) continue;

    const donationCount = Number(feature.properties?.count ?? 0);
    if (!Number.isFinite(donationCount) || donationCount <= 0) continue;

    aggregates[groupId].donationCount += donationCount;
    aggregates[groupId].partnerCount += 1;
    totalDonationCount += donationCount;
  }

  return { aggregates, totalDonationCount };
}

function buildMetricValue(
  id: MapHubMetricId,
  globalMetrics: SurplusImpactMetrics,
  aggregate: GroupAggregate,
  share: number,
): string {
  switch (id) {
    case "meals":
      return formatCompactNumber(globalMetrics.meals_made_possible * share);
    case "weight":
      return formatCompactNumber(globalMetrics.donated_weight * share);
    case "partners":
      return formatLargeNumber(aggregate.partnerCount);
    case "emissions":
      return formatCompactNumber(globalMetrics.downstream_emissions_prevented * share);
  }
}

const METRIC_LABELS: Record<MapHubMetricId, string> = {
  meals: "Meals made possible",
  weight: "Pounds distributed through this city",
  partners: "Charitable partners served",
  emissions: "CO2e emissions prevented",
};

export function buildGroupMetricsFromSurplus(
  globalMetrics: SurplusImpactMetrics,
  geojson: GeoJSON.FeatureCollection,
): Record<string, MapHubMetric[]> {
  const { aggregates, totalDonationCount } = aggregateGeoJsonByGroup(geojson);
  const metricsByGroup: Record<string, MapHubMetric[]> = {};

  for (const group of IMPACT_MAP_GROUPS) {
    const aggregate = aggregates[group.id] ?? { donationCount: 0, partnerCount: 0 };
    const share =
      totalDonationCount > 0 ? aggregate.donationCount / totalDonationCount : 0;

    metricsByGroup[group.id] = METRIC_ORDER.map((id) => ({
      id,
      label: METRIC_LABELS[id],
      value: buildMetricValue(id, globalMetrics, aggregate, share),
      tooltip: MAP_HUB_METRIC_TOOLTIPS[id] || undefined,
    }));
  }

  return metricsByGroup;
}

export async function fetchSurplusGroupMetrics(
  signal?: AbortSignal,
): Promise<Record<string, MapHubMetric[]> | null> {
  const [globalMetrics, geojson] = await Promise.all([
    fetchSurplusImpactMetrics(signal),
    fetchImpactGeoJson(signal),
  ]);

  if (!globalMetrics || !geojson) return null;
  return buildGroupMetricsFromSurplus(globalMetrics, geojson);
}
