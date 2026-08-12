import type { Expression, GeoJSONSource, Map } from "mapbox-gl";
import { IMPACT_MAP_GROUPS, type ImpactMapGroup } from "./impactMapGroups";
import { MAP_POINT_COLOR } from "./mapConfig";
import { findLabelLayerBeforeId } from "./regionHighlights";

const ACTIVE_SOURCE_ID = "impact-connector-active";
const ACTIVE_LAYER_ID = "impact-connector-lines-active";
const EXITING_SOURCE_ID = "impact-connector-exiting";
const EXITING_LAYER_ID = "impact-connector-lines-exiting";
const PERMANENT_LAYER_PREFIX = "impact-connector-permanent-";
const ARC_STEPS = 48;
const TARGET_LINE_COUNT = 20;

/** Skip short spokes — e.g. Philadelphia ↔ NYC (~130 km). */
const MIN_ROUTE_DISTANCE_KM = 200;
/** Regional anchors — snapped to visible clusters when geojson is available. */
const PRESET_REGIONAL = {
  boise: { lng: -116.2146, lat: 43.615 },
  pittsburgh: { lng: -79.9959, lat: 40.4406 },
  boston: { lng: -71.0589, lat: 42.3601 },
  cleveland: { lng: -81.6944, lat: 41.4993 },
  minneapolis: { lng: -93.265, lat: 44.9778 },
  atlanta: { lng: -84.388, lat: 33.749 },
  charlotte: { lng: -80.8431, lat: 35.2271 },
  nashville: { lng: -86.7816, lat: 36.1627 },
  seattle: { lng: -122.3321, lat: 47.6062 },
} as const satisfies Record<string, MapPoint>;

type RegionalKey = keyof typeof PRESET_REGIONAL;

const MIN_CLUSTER_COUNT = 25;

interface MapPoint {
  lng: number;
  lat: number;
}

export interface MapConnector {
  id: string;
  from: MapPoint;
  to: MapPoint;
  /** Perpendicular arc bend — fraction of chord length; sign flips bend direction. */
  curve: number;
}

const CONNECTOR_LINE_WIDTH = 2;
const CONNECTOR_LINE_OPACITY = 0.7;
/** Full shooting-star travel time (enter → exit). */
const CONNECTOR_TRAVEL_MS = 2100;
/** Visible comet length as a fraction of the route. */
const SHOOTING_STAR_TAIL = 0.42;
/** Start the next star this far into the current travel (0–1). */
const CONNECTOR_SPAWN_AT = 0.42;
const CONNECTOR_START_DELAY_MS = 500;

const COMPLETED_LINE_PAINT = {
  "line-color": MAP_POINT_COLOR,
  "line-width": CONNECTOR_LINE_WIDTH,
  "line-opacity": CONNECTOR_LINE_OPACITY,
  "line-blur": 0.25,
} as const;

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

function groupPoint(group: ImpactMapGroup): MapPoint {
  return { lng: group.lng, lat: group.lat };
}

function pair(
  id: string,
  from: MapPoint,
  to: MapPoint,
  curve: number,
): MapConnector {
  return { id, from, to, curve };
}

function routeDistanceKm(from: MapPoint, to: MapPoint): number {
  return haversineKm(from.lng, from.lat, to.lng, to.lat);
}

function isRouteDistanceValid(from: MapPoint, to: MapPoint): boolean {
  return routeDistanceKm(from, to) >= MIN_ROUTE_DISTANCE_KM;
}

function filterValidRoutes(routes: MapConnector[]): MapConnector[] {
  return routes.filter((route) => isRouteDistanceValid(route.from, route.to));
}

function hubById(id: string): ImpactMapGroup {
  return IMPACT_MAP_GROUPS.find((group) => group.id === id)!;
}

function scaledCurve(from: MapPoint, to: MapPoint, curve: number): number {
  const chord = Math.hypot(to.lng - from.lng, to.lat - from.lat);
  if (chord < 2) return curve * 0.12;
  if (chord < 5) return curve * 0.35;
  if (chord < 10) return curve * 0.55;
  return curve;
}

function snapToVisibleCluster(
  point: MapPoint,
  geojson: GeoJSON.FeatureCollection,
  maxKm = 100,
): MapPoint {
  let nearest: MapPoint | null = null;
  let nearestDistance = maxKm;

  for (const feature of geojson.features) {
    if (feature.geometry?.type !== "Point") continue;

    const [lng, lat] = feature.geometry.coordinates as [number, number];
    const count = Number(feature.properties?.count ?? 0);
    if (count < MIN_CLUSTER_COUNT) continue;

    const distance = haversineKm(point.lng, point.lat, lng, lat);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { lng, lat };
    }
  }

  return nearest ?? point;
}

function resolveRegional(
  key: RegionalKey,
  geojson?: GeoJSON.FeatureCollection,
  snapRadiusKm = 120,
): MapPoint {
  const preset = PRESET_REGIONAL[key];
  return geojson ? snapToVisibleCluster(preset, geojson, snapRadiusKm) : preset;
}

/** Twenty hub-centric routes — balanced across Philly, NYC, Detroit; light on Chicago. */
function buildConnectorRoutes(geojson?: GeoJSON.FeatureCollection): MapConnector[] {
  const chicago = hubById("chicago");
  const detroit = hubById("detroit");
  const philadelphia = hubById("philadelphia");
  const nyc = hubById("nyc");
  const mcallen = hubById("mcallen");
  const losAngeles = hubById("los-angeles");

  const routes = filterValidRoutes([
    // Philadelphia hub (7)
    pair(
      "atlanta-philadelphia",
      resolveRegional("atlanta", geojson, 100),
      groupPoint(philadelphia),
      -0.16,
    ),
    pair(
      "charlotte-philadelphia",
      resolveRegional("charlotte", geojson, 100),
      groupPoint(philadelphia),
      0.14,
    ),
    pair(
      "philadelphia-pittsburgh",
      groupPoint(philadelphia),
      resolveRegional("pittsburgh", geojson, 110),
      0.12,
    ),
    pair(
      "boston-philadelphia",
      resolveRegional("boston", geojson, 100),
      groupPoint(philadelphia),
      -0.1,
    ),
    pair("detroit-philadelphia", groupPoint(detroit), groupPoint(philadelphia), 0.1),
    pair(
      "nashville-philadelphia",
      resolveRegional("nashville", geojson, 100),
      groupPoint(philadelphia),
      0.14,
    ),
    pair(
      "cleveland-philadelphia",
      resolveRegional("cleveland", geojson, 100),
      groupPoint(philadelphia),
      -0.12,
    ),

    // NYC hub (5) — no Philadelphia ↔ NYC (too short)
    pair("boston-nyc", resolveRegional("boston", geojson, 100), groupPoint(nyc), 0.08),
    pair("detroit-nyc", groupPoint(detroit), groupPoint(nyc), -0.1),
    pair(
      "charlotte-nyc",
      resolveRegional("charlotte", geojson, 100),
      groupPoint(nyc),
      0.12,
    ),
    pair(
      "pittsburgh-nyc",
      resolveRegional("pittsburgh", geojson, 110),
      groupPoint(nyc),
      -0.1,
    ),
    pair("atlanta-nyc", resolveRegional("atlanta", geojson, 100), groupPoint(nyc), 0.14),

    // Detroit hub (5 total including routes above)
    pair("chicago-detroit", groupPoint(chicago), groupPoint(detroit), 0.12),
    pair(
      "cleveland-detroit",
      resolveRegional("cleveland", geojson, 100),
      groupPoint(detroit),
      0.12,
    ),
    pair(
      "minneapolis-detroit",
      resolveRegional("minneapolis", geojson, 100),
      groupPoint(detroit),
      -0.14,
    ),

    // Chicago hub (3 total including chicago-detroit)
    pair("mcallen-chicago", groupPoint(mcallen), groupPoint(chicago), -0.14),
    pair(
      "nashville-chicago",
      resolveRegional("nashville", geojson, 100),
      groupPoint(chicago),
      0.14,
    ),

    // West / south coverage (3)
    pair(
      "boise-los-angeles",
      resolveRegional("boise", geojson, 140),
      groupPoint(losAngeles),
      -0.18,
    ),
    pair(
      "seattle-los-angeles",
      resolveRegional("seattle", geojson, 120),
      groupPoint(losAngeles),
      -0.16,
    ),
    pair("los-angeles-mcallen", groupPoint(losAngeles), groupPoint(mcallen), 0.16),
  ]);

  return routes.slice(0, TARGET_LINE_COUNT);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function pickNextConnector(
  routes: MapConnector[],
  lastId: string | null,
): MapConnector {
  if (routes.length === 1) return routes[0]!;

  let next = routes[Math.floor(Math.random() * routes.length)]!;
  while (next.id === lastId) {
    next = routes[Math.floor(Math.random() * routes.length)]!;
  }
  return next;
}

function buildArcCoordinates(
  from: MapPoint,
  to: MapPoint,
  curve: number,
): GeoJSON.Position[] {
  const effectiveCurve = scaledCurve(from, to, curve);
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const chord = Math.hypot(dx, dy);

  if (chord < 1e-6) {
    return [
      [from.lng, from.lat],
      [to.lng, to.lat],
    ];
  }

  const midLng = (from.lng + to.lng) / 2;
  const midLat = (from.lat + to.lat) / 2;
  const perpLng = -dy / chord;
  const perpLat = dx / chord;
  const offset = chord * effectiveCurve;
  const controlLng = midLng + perpLng * offset;
  const controlLat = midLat + perpLat * offset;

  const coordinates: GeoJSON.Position[] = [];
  for (let step = 0; step <= ARC_STEPS; step += 1) {
    const t = step / ARC_STEPS;
    const inv = 1 - t;
    const lng = inv * inv * from.lng + 2 * inv * t * controlLng + t * t * to.lng;
    const lat = inv * inv * from.lat + 2 * inv * t * controlLat + t * t * to.lat;
    coordinates.push([lng, lat]);
  }

  return coordinates;
}

function buildConnectorFeature(connector: MapConnector): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: { id: connector.id },
    geometry: {
      type: "LineString",
      coordinates: buildArcCoordinates(connector.from, connector.to, connector.curve),
    },
  };
}

const TRANSPARENT_LINE = "rgba(0, 0, 0, 0)";

function snapProgress(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Visible segment [start, end] along the line. Always the same expression shape
 * so Mapbox doesn't flicker when stop values update each frame.
 */
function buildSegmentGradient(start: number, end: number): Expression {
  let segmentStart = snapProgress(Math.min(1, Math.max(0, start)));
  let segmentEnd = snapProgress(Math.min(1, Math.max(0, end)));
  const minWidth = 0.002;

  if (segmentEnd - segmentStart < minWidth) {
    segmentEnd = snapProgress(Math.min(1, segmentStart + minWidth));
  }

  if (segmentStart < 0.0001) segmentStart = 0.0001;
  if (segmentEnd > 0.9999) segmentEnd = 0.9999;
  if (segmentEnd <= segmentStart) {
    segmentEnd = snapProgress(Math.min(1, segmentStart + minWidth));
  }

  return [
    "step",
    ["line-progress"],
    TRANSPARENT_LINE,
    segmentStart,
    MAP_POINT_COLOR,
    segmentEnd,
    TRANSPARENT_LINE,
  ];
}

/**
 * Shooting-star window: a short comet slides along the route and flies off the end.
 * `travel` goes 0 → 1 over the animation.
 */
function shootingStarWindow(travel: number, tail: number): { start: number; end: number } {
  const head = travel * (1 + tail);
  return { start: head - tail, end: head };
}

function buildShootingStarGradient(travel: number, tail: number): Expression {
  const { start, end } = shootingStarWindow(travel, tail);
  return buildSegmentGradient(start, end);
}

function permanentSourceId(index: number): string {
  return `${PERMANENT_LAYER_PREFIX}source-${index}`;
}

function permanentLayerId(index: number): string {
  return `${PERMANENT_LAYER_PREFIX}layer-${index}`;
}

export function setupImpactMapConnectors(
  map: Map,
  geojson?: GeoJSON.FeatureCollection | null,
): () => void {
  const connectorRoutes = buildConnectorRoutes(geojson);

  const beforeId = findLabelLayerBeforeId(map);
  const emptyCollection = (): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: [],
  });

  map.addSource(ACTIVE_SOURCE_ID, {
    type: "geojson",
    lineMetrics: true,
    data: emptyCollection(),
  });

  map.addSource(EXITING_SOURCE_ID, {
    type: "geojson",
    lineMetrics: true,
    data: emptyCollection(),
  });

  const lineLayout = {
    "line-cap": "round" as const,
    "line-join": "round" as const,
  };

  map.addLayer(
    {
      id: EXITING_LAYER_ID,
      type: "line",
      source: EXITING_SOURCE_ID,
      paint: {
        "line-width": CONNECTOR_LINE_WIDTH,
        "line-opacity": CONNECTOR_LINE_OPACITY,
        "line-blur": 0.35,
        "line-gradient": buildShootingStarGradient(0, SHOOTING_STAR_TAIL),
      },
      layout: lineLayout,
    },
    beforeId,
  );

  map.addLayer(
    {
      id: ACTIVE_LAYER_ID,
      type: "line",
      source: ACTIVE_SOURCE_ID,
      paint: {
        "line-width": CONNECTOR_LINE_WIDTH,
        "line-opacity": CONNECTOR_LINE_OPACITY,
        "line-blur": 0.35,
        "line-gradient": buildShootingStarGradient(0, SHOOTING_STAR_TAIL),
      },
      layout: lineLayout,
    },
    beforeId,
  );

  const activeSource = map.getSource(ACTIVE_SOURCE_ID) as GeoJSONSource;
  const exitingSource = map.getSource(EXITING_SOURCE_ID) as GeoJSONSource;
  const permanentLayerIds: string[] = [];

  const addPermanentLine = (connector: MapConnector, index: number) => {
    const sourceId = permanentSourceId(index);
    const layerId = permanentLayerId(index);

    map.addSource(sourceId, {
      type: "geojson",
      data: buildConnectorFeature(connector),
    });

    map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        paint: { ...COMPLETED_LINE_PAINT },
        layout: lineLayout,
      },
      beforeId,
    );

    permanentLayerIds.push(layerId);
  };

  const setSlotTravel = (layerId: string, travel: number) => {
    if (!map.getLayer(layerId)) return;
    map.setPaintProperty(
      layerId,
      "line-gradient",
      buildShootingStarGradient(travel, SHOOTING_STAR_TAIL),
    );
  };

  const clearSlot = (slot: ConnectorSlot) => {
    slot.source.setData(emptyCollection());
    slot.busy = false;
  };

  const removePermanentLayers = () => {
    for (let index = 0; index < permanentLayerIds.length; index += 1) {
      const layerId = permanentLayerId(index);
      const sourceId = permanentSourceId(index);
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
    permanentLayerIds.length = 0;
  };

  const removeAllLayers = () => {
    if (map.getLayer(ACTIVE_LAYER_ID)) map.removeLayer(ACTIVE_LAYER_ID);
    if (map.getLayer(EXITING_LAYER_ID)) map.removeLayer(EXITING_LAYER_ID);
    if (map.getSource(ACTIVE_SOURCE_ID)) map.removeSource(ACTIVE_SOURCE_ID);
    if (map.getSource(EXITING_SOURCE_ID)) map.removeSource(EXITING_SOURCE_ID);
    removePermanentLayers();
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let index = 0; index < connectorRoutes.length; index += 1) {
      addPermanentLine(connectorRoutes[index]!, index);
    }
    if (map.getLayer(ACTIVE_LAYER_ID)) map.removeLayer(ACTIVE_LAYER_ID);
    if (map.getLayer(EXITING_LAYER_ID)) map.removeLayer(EXITING_LAYER_ID);
    if (map.getSource(ACTIVE_SOURCE_ID)) map.removeSource(ACTIVE_SOURCE_ID);
    if (map.getSource(EXITING_SOURCE_ID)) map.removeSource(EXITING_SOURCE_ID);

    return removeAllLayers;
  }

  interface ConnectorSlot {
    layerId: string;
    source: GeoJSONSource;
    busy: boolean;
    generation: number;
    rafId: number | null;
  }

  const slots: ConnectorSlot[] = [
    {
      layerId: ACTIVE_LAYER_ID,
      source: activeSource,
      busy: false,
      generation: 0,
      rafId: null,
    },
    {
      layerId: EXITING_LAYER_ID,
      source: exitingSource,
      busy: false,
      generation: 0,
      rafId: null,
    },
  ];

  let lastConnectorId: string | null = null;
  let spawnTimeout: ReturnType<typeof setTimeout> | null = null;
  let startTimeout: ReturnType<typeof setTimeout> | null = null;

  const cancelSlotAnimation = (slot: ConnectorSlot) => {
    slot.generation += 1;
    if (slot.rafId !== null) {
      cancelAnimationFrame(slot.rafId);
      slot.rafId = null;
    }
    slot.busy = false;
  };

  const runTimedAnimation = (
    durationMs: number,
    ease: (t: number) => number,
    onFrame: (progress: number) => void,
    onComplete: () => void,
    isStopped: () => boolean,
    assignRaf: (id: number | null) => void,
  ) => {
    const startTime = performance.now();

    const tick = (now: number) => {
      if (isStopped()) {
        assignRaf(null);
        return;
      }

      const raw = Math.min(1, (now - startTime) / durationMs);
      onFrame(ease(raw));

      if (isStopped()) {
        assignRaf(null);
        return;
      }

      if (raw < 1) {
        assignRaf(requestAnimationFrame(tick));
      } else {
        assignRaf(null);
        onComplete();
      }
    };

    assignRaf(requestAnimationFrame(tick));
  };

  const runStarOnSlot = (slot: ConnectorSlot, connector: MapConnector) => {
    cancelSlotAnimation(slot);
    slot.busy = true;
    const generation = slot.generation;

    slot.source.setData({
      type: "FeatureCollection",
      features: [buildConnectorFeature(connector)],
    });
    setSlotTravel(slot.layerId, 0);

    runTimedAnimation(
      CONNECTOR_TRAVEL_MS,
      easeInOutCubic,
      (progress) => setSlotTravel(slot.layerId, progress),
      () => {
        if (slot.generation !== generation) return;
        clearSlot(slot);
      },
      () => slot.generation !== generation,
      (id) => {
        slot.rafId = id;
      },
    );
  };

  const findFreeSlot = (): ConnectorSlot | undefined =>
    slots.find((slot) => !slot.busy);

  const scheduleNextSpawn = () => {
    spawnTimeout = setTimeout(spawnStar, CONNECTOR_TRAVEL_MS * CONNECTOR_SPAWN_AT);
  };

  const spawnStar = () => {
    if (!map.getLayer(ACTIVE_LAYER_ID)) return;

    const slot = findFreeSlot();
    if (!slot) {
      scheduleNextSpawn();
      return;
    }

    const connector = pickNextConnector(connectorRoutes, lastConnectorId);
    lastConnectorId = connector.id;
    runStarOnSlot(slot, connector);
    scheduleNextSpawn();
  };

  startTimeout = setTimeout(spawnStar, CONNECTOR_START_DELAY_MS);

  return () => {
    if (startTimeout) clearTimeout(startTimeout);
    if (spawnTimeout) clearTimeout(spawnTimeout);
    for (const slot of slots) cancelSlotAnimation(slot);
    removeAllLayers();
  };
}
