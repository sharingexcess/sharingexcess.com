import usStatesCollection from "@/data/us-states.json";
import { featureCollection } from "@turf/helpers";
import union from "@turf/union";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import mapboxgl from "mapbox-gl";
import type { MapMacroRegion } from "./types";

/** Macro service regions — each lists full state names from `us-states.json`. */
export const DEFAULT_MAP_MACRO_REGIONS: MapMacroRegion[] = [
  {
    id: "northeast",
    name: "Northeast",
    states: [
      "Connecticut",
      "Maine",
      "Massachusetts",
      "New Hampshire",
      "Rhode Island",
      "Vermont",
      "New Jersey",
      "New York",
      "Pennsylvania",
    ],
  },
  {
    id: "southeast",
    name: "Southeast",
    states: [
      "Alabama",
      "Arkansas",
      "Delaware",
      "District of Columbia",
      "Florida",
      "Georgia",
      "Kentucky",
      "Louisiana",
      "Maryland",
      "Mississippi",
      "North Carolina",
      "South Carolina",
      "Tennessee",
      "Virginia",
      "West Virginia",
    ],
  },
  {
    id: "central",
    name: "Central",
    states: [
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Michigan",
      "Minnesota",
      "Missouri",
      "Nebraska",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "South Dakota",
      "Texas",
      "Wisconsin",
    ],
  },
  {
    id: "west-coast",
    name: "West Coast",
    states: [
      "Alaska",
      "Arizona",
      "California",
      "Colorado",
      "Hawaii",
      "Idaho",
      "Montana",
      "Nevada",
      "New Mexico",
      "Oregon",
      "Utah",
      "Washington",
      "Wyoming",
    ],
  },
];

const CONTINENTAL_EXCLUDED = new Set(["Alaska", "Hawaii"]);

const US_STATES = usStatesCollection as GeoJSON.FeatureCollection;

function buildStateRegionLookup(
  macroRegions: MapMacroRegion[],
): Map<string, MapMacroRegion> {
  const lookup = new Map<string, MapMacroRegion>();

  for (const region of macroRegions) {
    for (const state of region.states) {
      lookup.set(state, region);
    }
  }

  return lookup;
}

function extendBoundsForGeometry(
  bounds: mapboxgl.LngLatBounds,
  geometry: GeoJSON.Geometry,
): void {
  if (geometry.type === "Polygon") {
    for (const [lng, lat] of geometry.coordinates[0]) {
      bounds.extend([lng, lat]);
    }
    return;
  }

  if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const [lng, lat] of polygon[0]) {
        bounds.extend([lng, lat]);
      }
    }
  }
}

function mergeStateFeatures(
  stateFeatures: GeoJSON.Feature[],
): Feature<Polygon | MultiPolygon> | null {
  if (stateFeatures.length === 0) return null;

  if (stateFeatures.length === 1) {
    return {
      type: "Feature",
      properties: {},
      geometry: stateFeatures[0].geometry as Polygon | MultiPolygon,
    };
  }

  return union(
    featureCollection(
      stateFeatures.map((feature) => ({
        type: "Feature" as const,
        properties: {},
        geometry: feature.geometry as Polygon | MultiPolygon,
      })),
    ),
  );
}

/** Union states within each macro region into a single exterior outline per region. */
export function buildMergedRegionFeatureCollection(
  macroRegions: MapMacroRegion[],
): GeoJSON.FeatureCollection {
  const lookup = buildStateRegionLookup(macroRegions);
  const statesByRegion = new Map<string, GeoJSON.Feature[]>();

  for (const feature of US_STATES.features) {
    const stateName = feature.properties?.name as string | undefined;
    if (!stateName || !feature.geometry) continue;

    const region = lookup.get(stateName);
    if (!region) continue;

    const regionStates = statesByRegion.get(region.id) ?? [];
    regionStates.push(feature);
    statesByRegion.set(region.id, regionStates);
  }

  const features = macroRegions.flatMap((region) => {
    const stateFeatures = statesByRegion.get(region.id) ?? [];
    const merged = mergeStateFeatures(stateFeatures);
    if (!merged) return [];

    return [
      {
        type: "Feature" as const,
        properties: {
          regionId: region.id,
          regionName: region.name,
        },
        geometry: merged.geometry,
      },
    ];
  });

  return { type: "FeatureCollection", features };
}

export const DEFAULT_MERGED_REGION_COLLECTION =
  buildMergedRegionFeatureCollection(DEFAULT_MAP_MACRO_REGIONS);

export function fitBoundsToMacroRegions(
  map: mapboxgl.Map,
  macroRegions: MapMacroRegion[],
): void {
  const lookup = buildStateRegionLookup(macroRegions);
  const bounds = new mapboxgl.LngLatBounds();

  for (const feature of US_STATES.features) {
    const stateName = feature.properties?.name as string | undefined;
    if (!stateName || !lookup.has(stateName)) continue;
    if (CONTINENTAL_EXCLUDED.has(stateName)) continue;
    if (feature.geometry) extendBoundsForGeometry(bounds, feature.geometry);
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 48, bottom: 48, left: 48, right: 48 },
      maxZoom: 5,
    });
  }
}

export function findLabelLayerBeforeId(map: mapboxgl.Map): string | undefined {
  return map
    .getStyle()
    .layers?.find(
      (layer) =>
        layer.type === "symbol" &&
        layer.layout &&
        "text-field" in layer.layout &&
        layer.layout["text-field"],
    )?.id;
}
