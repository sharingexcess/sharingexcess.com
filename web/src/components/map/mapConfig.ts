import type { MapHub, MapVariant } from "./types";
import {
  IMPACT_MAP_APPEARANCE,
  SURPLUS_MAP_STYLE_URL,
} from "./impactMapTheme";

/** Shared Mapbox settings — mirrors the archive site's impact map. */
export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";

/** Light style for hub overview maps (Figma hub markers layout). */
export const MAPBOX_LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";

/** Cluster / marker fill — legacy archive used #008236 (SE green). */
export const MAP_POINT_COLOR = "#008236";

/** Hub pin badge — matches logo / Figma hub map markers. */
export const MAP_HUB_MARKER_COLOR = "#15803D";

export const DEFAULT_MAP_CENTER: [number, number] = [-98.5795, 39.8283];
export const DEFAULT_MAP_ZOOM = 4.25;
export const DEFAULT_MAX_ZOOM = 9;

/** Framed continental US — Texas visible, minimal Mexico. */
export function getImpactMapView(): { center: [number, number]; zoom: number } {
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;
  return isMobile
    ? { center: [-97.5, 38.25], zoom: 3.7 }
    : { center: [-97.5, 38.75], zoom: 3.8 };
}

/** Disable scroll, pinch, pan, and keyboard zoom — map stays at the fitted viewport. */
export const STATIC_MAP_INTERACTION = {
  scrollZoom: false,
  boxZoom: false,
  doubleClickZoom: false,
  touchZoomRotate: false,
  dragPan: false,
  dragRotate: false,
  keyboard: false,
  attributionControl: false,
} as const;

export const IMPACT_GEOJSON_PATH = "/public/analytics/geojson";

import type { MapHubMetric } from "./types";

/** Fallback hub metrics when live Surplus data is unavailable. */
const DEFAULT_HUB_METRICS: MapHubMetric[] = [
  { id: "meals", value: "—", label: "Meals made possible" },
  { id: "weight", value: "—", label: "Pounds distributed through this city" },
  { id: "partners", value: "—", label: "Charitable partners served" },
  { id: "emissions", value: "—", label: "CO2e emissions prevented" },
];

/** Default SE operational hubs — coordinates at city / market centers. */
export const DEFAULT_MAP_HUBS: MapHub[] = [
  {
    name: "Philadelphia",
    lng: -75.1652,
    lat: 39.9526,
    metrics: [...DEFAULT_HUB_METRICS],
  },
  {
    name: "Hunts Point",
    lng: -73.8847,
    lat: 40.8094,
    metrics: [...DEFAULT_HUB_METRICS],
  },
  {
    name: "Chicago",
    lng: -87.6298,
    lat: 41.8781,
    metrics: [...DEFAULT_HUB_METRICS],
  },
  {
    name: "Detroit",
    lng: -83.0458,
    lat: 42.3314,
    metrics: [...DEFAULT_HUB_METRICS],
  },
];

export function getMapStyleForVariant(variant: MapVariant): string {
  if (variant !== "impact-clusters") return MAPBOX_LIGHT_STYLE;

  return IMPACT_MAP_APPEARANCE === "light"
    ? MAPBOX_LIGHT_STYLE
    : SURPLUS_MAP_STYLE_URL;
}

export function getMapboxAccessToken(): string {
  return (
    import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN ||
    // Public pk token from sharingexcess.com (impact map embed)
    "pk.eyJ1Ijoic2Fya2FyaWNodGVyIiwiYSI6ImNtOXU5cDkwNjA3dGgycXB5Zmt1NGpreWEifQ.prxEqERsrMZSwXxahDnkbg"
  );
}

export function getSurplusApiOrigin(): string {
  if (typeof window !== "undefined" && window.__SE_SURPLUS_API_ORIGIN) {
    return window.__SE_SURPLUS_API_ORIGIN;
  }
  return "https://surplus-api.staging.sharingexcess.com";
}

/** Production origin — fallback when staging geojson is unavailable. */
export const IMPACT_GEOJSON_FALLBACK_ORIGIN =
  "https://surplus-api.sharingexcess.com";

export function getImpactGeoJsonUrl(): string {
  return `${getSurplusApiOrigin()}${IMPACT_GEOJSON_PATH}`;
}

export function getImpactGeoJsonUrls(): string[] {
  const primary = getImpactGeoJsonUrl();
  const fallback = `${IMPACT_GEOJSON_FALLBACK_ORIGIN}${IMPACT_GEOJSON_PATH}`;
  return primary === fallback ? [primary] : [primary, fallback];
}
