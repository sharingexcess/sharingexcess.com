import mapboxgl from "mapbox-gl";
import { IMPACT_MAP_GROUPS } from "./impactMapGroups";
import type { MapHub, MapVariant, ImpactMapViewportFit } from "./types";
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

function isMobileMapViewport(): boolean {
  return window.matchMedia("(max-width: 1023px)").matches;
}

/** Initial map position before geojson loads. */
export function getImpactMapView(): { center: [number, number]; zoom: number } {
  return isMobileMapViewport()
    ? { center: DEFAULT_MAP_CENTER, zoom: 4.45 }
    : { center: DEFAULT_MAP_CENTER, zoom: 4.25 };
}

const IMPACT_MAP_GEO_PADDING = { lng: 1.35, lat: 1.1 };
const IMPACT_MAP_MOBILE_GEO_PADDING = { lng: 1.1, lat: 0.95 };
const IMPACT_MAP_FRAMED_PADDING = 32;
const IMPACT_MAP_FILL_PADDING = { top: 8, bottom: 32, left: 16, right: 16 };
const IMPACT_MAP_MOBILE_FILL_PADDING = { top: 8, bottom: 28, left: 12, right: 12 };

function buildImpactMapBounds(
  geojson?: GeoJSON.FeatureCollection | null,
): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds();

  for (const group of IMPACT_MAP_GROUPS) {
    bounds.extend([group.lng, group.lat]);
  }

  for (const feature of geojson?.features ?? []) {
    if (feature.geometry?.type !== "Point") continue;
    bounds.extend(feature.geometry.coordinates as [number, number]);
  }

  return bounds;
}

/** Pad bounds so wide viewports do not crop the coasts. */
function expandImpactMapBounds(
  bounds: mapboxgl.LngLatBounds,
  fit: ImpactMapViewportFit = "framed",
): mapboxgl.LngLatBounds {
  if (bounds.isEmpty()) return bounds;

  const geoPadding = isMobileMapViewport()
    ? IMPACT_MAP_MOBILE_GEO_PADDING
    : IMPACT_MAP_GEO_PADDING;

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  let west = sw.lng - geoPadding.lng;
  let south = sw.lat - geoPadding.lat;
  let east = ne.lng + geoPadding.lng;
  let north = ne.lat + geoPadding.lat;

  const minAspect = fit === "fill" ? 1.42 : 1.55;
  const lngSpan = east - west;
  const latSpan = north - south;
  const aspect = lngSpan / Math.max(latSpan, 0.001);

  if (aspect > minAspect) {
    const targetLatSpan = lngSpan / minAspect;
    const extra = (targetLatSpan - latSpan) / 2;
    south -= extra;
    north += extra;
  } else if (aspect < minAspect) {
    const targetLngSpan = latSpan * minAspect;
    const extra = (targetLngSpan - lngSpan) / 2;
    west -= extra;
    east += extra;
  }

  return new mapboxgl.LngLatBounds([west, south], [east, north]);
}

/** Fit the impact map — framed card view or edge-to-edge fullscreen stage. */
export function applyImpactMapViewport(
  map: mapboxgl.Map,
  fit: ImpactMapViewportFit = "framed",
  geojson?: GeoJSON.FeatureCollection | null,
): void {
  if (fit === "fill" && typeof map.setProjection === "function") {
    map.setProjection("mercator");
  }

  const bounds = expandImpactMapBounds(buildImpactMapBounds(geojson), fit);
  if (bounds.isEmpty()) {
    const view = getImpactMapView();
    map.jumpTo({ center: view.center, zoom: view.zoom });
    return;
  }

  const isMobile = isMobileMapViewport();
  const padding =
    fit === "fill"
      ? isMobile
        ? IMPACT_MAP_MOBILE_FILL_PADDING
        : IMPACT_MAP_FILL_PADDING
      : IMPACT_MAP_FRAMED_PADDING;
  const maxZoom =
    fit === "fill"
      ? isMobile
        ? 5.75
        : 5.5
      : isMobile
        ? 5.5
        : 5.15;

  map.fitBounds(bounds, {
    padding,
    duration: 0,
    maxZoom,
  });
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

/** Vite/Storybook dev proxy — see astro.config.mjs and .storybook/main.ts. */
export const SURPLUS_DEV_PROXY_PREFIX = "/__surplus";

function isLocalSurplusDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".localhost")
  );
}

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
  if (isLocalSurplusDevHost()) {
    return [`${window.location.origin}${SURPLUS_DEV_PROXY_PREFIX}${IMPACT_GEOJSON_PATH}`];
  }

  const primary = getImpactGeoJsonUrl();
  const fallback = `${IMPACT_GEOJSON_FALLBACK_ORIGIN}${IMPACT_GEOJSON_PATH}`;
  return primary === fallback ? [primary] : [primary, fallback];
}
