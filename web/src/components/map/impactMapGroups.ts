import { enrichImpactGeoJson } from "./impactMapMarkers";
import type { MapHub } from "./types";

export interface ImpactMapGroupBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

export interface ImpactMapGroup extends MapHub {
  id: string;
  /** Points inside these bounds are always assigned to this group. */
  regionBounds?: ImpactMapGroupBounds;
}

/** Clickable metro groups on the impact distribution map. */
export const IMPACT_MAP_GROUPS: ImpactMapGroup[] = [
  {
    id: "los-angeles",
    name: "Los Angeles",
    lng: -118.2437,
    lat: 34.0522,
  },
  {
    id: "mcallen",
    name: "McAllen",
    lng: -98.23,
    lat: 26.2034,
    // Rio Grande Valley — includes all south TX border clusters west of Brownsville.
    regionBounds: { west: -99.5, east: -97.0, south: 25.5, north: 27.5 },
  },
  {
    id: "chicago",
    name: "Chicago",
    lng: -87.6298,
    lat: 41.8781,
  },
  {
    id: "detroit",
    name: "Detroit",
    lng: -83.0458,
    lat: 42.3314,
  },
  {
    id: "philadelphia",
    name: "Philadelphia",
    lng: -75.1652,
    lat: 39.9526,
  },
  {
    id: "nyc",
    name: "NYC",
    lng: -73.95,
    lat: 40.75,
  },
];

/** Max distance from a group center for a point to belong to that group. */
export const IMPACT_GROUP_ASSIGNMENT_MAX_KM = 70;

const GROUP_BY_ID = new Map(IMPACT_MAP_GROUPS.map((group) => [group.id, group]));

export function getImpactGroupById(id: string): ImpactMapGroup | undefined {
  return GROUP_BY_ID.get(id);
}

function haversineKm(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isWithinGroupBounds(
  lng: number,
  lat: number,
  bounds: ImpactMapGroupBounds,
): boolean {
  return (
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  );
}

export function assignImpactGroupId(lng: number, lat: number): string | null {
  for (const group of IMPACT_MAP_GROUPS) {
    if (group.regionBounds && isWithinGroupBounds(lng, lat, group.regionBounds)) {
      return group.id;
    }
  }

  let nearestId: string | null = null;
  let nearestDistance = Infinity;

  for (const group of IMPACT_MAP_GROUPS) {
    const distance = haversineKm(lng, lat, group.lng, group.lat);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestId = group.id;
    }
  }

  if (!nearestId || nearestDistance > IMPACT_GROUP_ASSIGNMENT_MAX_KM) return null;
  return nearestId;
}

export function enrichImpactGeoJsonWithGroups(
  geojson: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  const withSizes = enrichImpactGeoJson(geojson);

  return {
    type: "FeatureCollection",
    features: withSizes.features.map((feature, index) => {
      const coords =
        feature.geometry?.type === "Point"
          ? (feature.geometry.coordinates as [number, number])
          : null;
      const groupId = coords ? assignImpactGroupId(coords[0], coords[1]) : null;

      return {
        type: "Feature",
        id: `impact-${index}`,
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          group_id: groupId ?? "",
        },
      };
    }),
  };
}
