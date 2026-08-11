import type { Map } from "mapbox-gl";

/** Matches surplus/apps/client/src/lib/mapMarkerImages.ts (recipient marker). */
export const RECIPIENT_IMAGE_ID = "surplusMapMarkerRecipient";
export const RECIPIENT_MUTED_IMAGE_ID = "surplusMapMarkerRecipientMuted";

const MAP_MARKER_RECIPIENT_FILL = "#22c55e";
const MAP_MARKER_MUTED_FILL = "#C9C9C9";
const MAP_MARKER_STROKE_DARK = "#1A1A1A";
const MAP_MARKER_STROKE_WIDTH = 0.75;
const MAP_MARKER_IMAGE_INNER_RADIUS_PX = 10;
const MAP_MARKER_IMAGE_PIXEL_RATIO = 2;
const MAP_MARKER_GRADIENT_TOP_LIGHTEN = 0.22;
const MAP_MARKER_GRADIENT_BOTTOM_FACTOR = 0.75;
const MAP_MARKER_STROKE_OPACITY = 0.8;

export const IMPACT_MARKER_INNER_RADIUS_PX = MAP_MARKER_IMAGE_INNER_RADIUS_PX;

const MARKER_SIZE_OPTIONS = {
  minRadius: 5,
  maxRadius: 9.6,
  lowerPercentile: 5,
  upperPercentile: 95,
  sizeExponent: 1.4,
} as const;

function shadeHexColor(hex: string, factor: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value * factor)))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function lightenHexColor(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value + (255 - value) * amount)))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function drawRecipientMarkerCanvas(fillColor: string, strokeColor: string): HTMLCanvasElement {
  const innerR = MAP_MARKER_IMAGE_INNER_RADIUS_PX * MAP_MARKER_IMAGE_PIXEL_RATIO;
  const strokeW = MAP_MARKER_STROKE_WIDTH * MAP_MARKER_IMAGE_PIXEL_RATIO;
  const outerR = innerR + strokeW;
  const size = Math.ceil(outerR * 2) + 2;
  const center = size / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.beginPath();
  ctx.arc(center, center, outerR, 0, Math.PI * 2);
  ctx.globalAlpha = MAP_MARKER_STROKE_OPACITY;
  ctx.fillStyle = strokeColor;
  ctx.fill();
  ctx.globalAlpha = 1;

  const gradient = ctx.createLinearGradient(center, center - innerR, center, center + innerR);
  gradient.addColorStop(
    0,
    lightenHexColor(fillColor, MAP_MARKER_GRADIENT_TOP_LIGHTEN),
  );
  gradient.addColorStop(
    1,
    shadeHexColor(fillColor, MAP_MARKER_GRADIENT_BOTTOM_FACTOR),
  );

  ctx.beginPath();
  ctx.arc(center, center, innerR, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  return canvas;
}

function addMarkerImage(
  map: Map,
  imageId: string,
  fillColor: string,
  strokeColor: string,
): boolean {
  try {
    const canvas = drawRecipientMarkerCanvas(fillColor, strokeColor);
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (map.hasImage(imageId)) {
      map.updateImage(imageId, imageData);
    } else {
      map.addImage(imageId, imageData, {
        pixelRatio: MAP_MARKER_IMAGE_PIXEL_RATIO,
      });
    }
    return true;
  } catch {
    return false;
  }
}

export function addRecipientMarkerImage(map: Map): boolean {
  return addMarkerImage(map, RECIPIENT_IMAGE_ID, MAP_MARKER_RECIPIENT_FILL, MAP_MARKER_STROKE_DARK);
}

export function addRecipientMutedMarkerImage(map: Map): boolean {
  return addMarkerImage(
    map,
    RECIPIENT_MUTED_IMAGE_ID,
    MAP_MARKER_MUTED_FILL,
    MAP_MARKER_STROKE_DARK,
  );
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  if (Math.floor(index) === index) return sorted[index] ?? 0;

  const lower = sorted[Math.floor(index)] ?? 0;
  const upper = sorted[Math.ceil(index)] ?? 0;
  return lower + (upper - lower) * (index - Math.floor(index));
}

function calculateMarkerSize(
  totalWeight: number,
  allWeights: number[],
  options: typeof MARKER_SIZE_OPTIONS,
): number {
  const fallback = (options.minRadius + options.maxRadius) / 2;
  if (!allWeights.length) return fallback;

  const weights = allWeights.filter((weight) => weight > 0);
  if (!weights.length) return fallback;

  const pLower = calculatePercentile(weights, options.lowerPercentile);
  const pUpper = calculatePercentile(weights, options.upperPercentile);
  if (pLower === pUpper) return fallback;

  const clamped = Math.max(Math.min(totalWeight, pUpper), pLower);
  const normalized = (clamped - pLower) / (pUpper - pLower);
  const curved =
    options.sizeExponent === 1 ? normalized : Math.pow(normalized, options.sizeExponent);
  return options.minRadius + curved * (options.maxRadius - options.minRadius);
}

export function enrichImpactGeoJson(
  geojson: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  if (!geojson.features?.length) {
    return { type: "FeatureCollection", features: [] };
  }

  const counts = geojson.features.map((feature) => Number(feature.properties?.count ?? 0));

  return {
    type: "FeatureCollection",
    features: geojson.features.map((feature) => ({
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
        marker_size: calculateMarkerSize(
          Number(feature.properties?.count ?? 0),
          counts,
          MARKER_SIZE_OPTIONS,
        ),
      },
    })),
  };
}
