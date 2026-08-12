import type { Expression, Map, MapLayerMouseEvent, MapMouseEvent, Point } from "mapbox-gl";
import {
  getImpactGroupById,
  IMPACT_MAP_GROUPS,
  type ImpactMapGroup,
} from "./impactMapGroups";
import {
  IMPACT_MARKER_INNER_RADIUS_PX,
  RECIPIENT_IMAGE_ID,
  RECIPIENT_MUTED_IMAGE_ID,
} from "./impactMapMarkers";
import { MAP_POINT_COLOR } from "./mapConfig";

export const IMPACT_POINTS_LAYER_ID = "impact-points";

export const IMPACT_MARKER_TRANSITION_MS = 280;

const MUTED_MARKER_COLOR = "#C9C9C9";
const BASE_MARKER_SIZE: Expression = ["get", "marker_size"];
/** Fallback click radius around a group center when a marker feature is not hit. */
const GROUP_CLICK_RADIUS_PX = 52;

export interface MapOverlayAnchor {
  x: number;
  y: number;
}

export interface ImpactMapGroupInteractionCallbacks {
  onHoverGroup: (group: ImpactMapGroup | null) => void;
  onSelectGroup: (group: ImpactMapGroup | null, anchor: MapOverlayAnchor | null) => void;
}

export interface ImpactMapMarkerStyleState {
  selectedGroupId?: string | null;
}

function buildMarkerColorExpression(selectedGroupId: string | null): Expression {
  if (!selectedGroupId) return MAP_POINT_COLOR;

  return [
    "case",
    ["==", ["get", "group_id"], selectedGroupId],
    MAP_POINT_COLOR,
    MUTED_MARKER_COLOR,
  ];
}

function buildMarkerImageExpression(selectedGroupId: string | null): Expression {
  if (!selectedGroupId) return RECIPIENT_IMAGE_ID;

  return [
    "case",
    ["==", ["get", "group_id"], selectedGroupId],
    RECIPIENT_IMAGE_ID,
    RECIPIENT_MUTED_IMAGE_ID,
  ];
}

export function syncImpactMapMarkerStyles(
  map: Map,
  useSymbols: boolean,
  state: ImpactMapMarkerStyleState,
): void {
  if (!map.getLayer(IMPACT_POINTS_LAYER_ID)) return;

  const selectedGroupId = state.selectedGroupId ?? null;

  if (useSymbols) {
    map.setLayoutProperty(IMPACT_POINTS_LAYER_ID, "icon-size", [
      "/",
      BASE_MARKER_SIZE,
      IMPACT_MARKER_INNER_RADIUS_PX,
    ]);
    map.setLayoutProperty(
      IMPACT_POINTS_LAYER_ID,
      "icon-image",
      buildMarkerImageExpression(selectedGroupId),
    );
    return;
  }

  map.setPaintProperty(IMPACT_POINTS_LAYER_ID, "circle-radius", BASE_MARKER_SIZE);
  map.setPaintProperty(
    IMPACT_POINTS_LAYER_ID,
    "circle-color",
    buildMarkerColorExpression(selectedGroupId),
  );
}

function projectGroupAnchor(map: Map, group: ImpactMapGroup): MapOverlayAnchor {
  const point = map.project([group.lng, group.lat]);
  return { x: point.x, y: point.y };
}

function groupIdFromFeatures(features: GeoJSON.Feature[]): string | null {
  for (const feature of features) {
    const groupId = feature.properties?.group_id;
    if (groupId) return String(groupId);
  }
  return null;
}

function findNearestImpactGroup(
  map: Map,
  point: Point | { x: number; y: number },
): ImpactMapGroup | null {
  let nearest: ImpactMapGroup | null = null;
  let nearestDistance = Infinity;

  for (const group of IMPACT_MAP_GROUPS) {
    const projected = map.project([group.lng, group.lat]);
    const distance = Math.hypot(projected.x - point.x, projected.y - point.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = group;
    }
  }

  return nearestDistance <= GROUP_CLICK_RADIUS_PX ? nearest : null;
}

function resolveGroupFromClick(
  map: Map,
  point: Point | { x: number; y: number },
  features?: GeoJSON.Feature[],
): ImpactMapGroup | null {
  const groupId = features?.length ? groupIdFromFeatures(features) : null;
  if (groupId) {
    return getImpactGroupById(groupId) ?? null;
  }

  const rendered = map.queryRenderedFeatures(point, {
    layers: [IMPACT_POINTS_LAYER_ID],
  });
  const renderedGroupId = groupIdFromFeatures(rendered);
  if (renderedGroupId) {
    return getImpactGroupById(renderedGroupId) ?? null;
  }

  return findNearestImpactGroup(map, point);
}

function selectGroupAtPoint(
  map: Map,
  point: Point | { x: number; y: number },
  features: GeoJSON.Feature[] | undefined,
  callbacks: ImpactMapGroupInteractionCallbacks,
): boolean {
  const group = resolveGroupFromClick(map, point, features);
  if (!group) return false;

  callbacks.onSelectGroup(group, projectGroupAnchor(map, group));
  return true;
}

export interface ImpactMapGroupInteractionController {
  destroy: () => void;
  setSelectedGroupId: (groupId: string | null) => void;
  setHoveredGroupId: (groupId: string | null) => void;
}

export function setupImpactMapGroupInteractions(
  map: Map,
  useSymbols: boolean,
  callbacks: ImpactMapGroupInteractionCallbacks,
): ImpactMapGroupInteractionController {
  let hoveredGroupId: string | null = null;
  let selectedGroupId: string | null = null;

  const syncStyles = () => {
    syncImpactMapMarkerStyles(map, useSymbols, { selectedGroupId });
  };

  const setHoveredGroupId = (nextId: string | null) => {
    if (hoveredGroupId === nextId) return;

    hoveredGroupId = nextId;

    if (!nextId) {
      callbacks.onHoverGroup(null);
      return;
    }

    const group = getImpactGroupById(nextId);
    callbacks.onHoverGroup(group ?? null);
  };

  const setHoveredGroup = (group: ImpactMapGroup | null) => {
    setHoveredGroupId(group?.id ?? null);
  };

  const onMouseMove = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    const groupId = feature?.properties?.group_id;

    if (!groupId) {
      setHoveredGroup(null);
      return;
    }

    const group = getImpactGroupById(String(groupId));
    if (!group) {
      setHoveredGroup(null);
      return;
    }

    setHoveredGroup(group);
  };

  const onMouseLeave = () => {
    setHoveredGroup(null);
  };

  const onLayerClick = (event: MapLayerMouseEvent) => {
    event.originalEvent.stopPropagation();
    selectGroupAtPoint(map, event.point, event.features, callbacks);
  };

  const onMapClick = (event: MapMouseEvent) => {
    const rendered = map.queryRenderedFeatures(event.point, {
      layers: [IMPACT_POINTS_LAYER_ID],
    });
    if (rendered.length) return;

    if (selectGroupAtPoint(map, event.point, undefined, callbacks)) return;
    callbacks.onSelectGroup(null, null);
  };

  const syncAnchors = () => {
    if (hoveredGroupId) {
      const group = getImpactGroupById(hoveredGroupId);
      if (group) {
        callbacks.onHoverGroup(group);
      }
    }
  };

  map.on("mousemove", IMPACT_POINTS_LAYER_ID, onMouseMove);
  map.on("mouseleave", IMPACT_POINTS_LAYER_ID, onMouseLeave);
  map.on("click", IMPACT_POINTS_LAYER_ID, onLayerClick);
  map.on("click", onMapClick);
  map.on("move", syncAnchors);
  map.on("zoom", syncAnchors);
  map.on("resize", syncAnchors);

  return {
    setSelectedGroupId: (groupId: string | null) => {
      selectedGroupId = groupId;
      syncStyles();
    },
    setHoveredGroupId,
    destroy: () => {
      map.off("mousemove", IMPACT_POINTS_LAYER_ID, onMouseMove);
      map.off("mouseleave", IMPACT_POINTS_LAYER_ID, onMouseLeave);
      map.off("click", IMPACT_POINTS_LAYER_ID, onLayerClick);
      map.off("click", onMapClick);
      map.off("move", syncAnchors);
      map.off("zoom", syncAnchors);
      map.off("resize", syncAnchors);
      syncImpactMapMarkerStyles(map, useSymbols, {
        selectedGroupId: null,
      });
      callbacks.onHoverGroup(null);
    },
  };
}
