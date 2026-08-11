import type { Expression, Map, MapLayerMouseEvent, MapMouseEvent } from "mapbox-gl";
import {
  getImpactGroupById,
  type ImpactMapGroup,
} from "./impactMapGroups";
import {
  IMPACT_MARKER_INNER_RADIUS_PX,
  RECIPIENT_IMAGE_ID,
  RECIPIENT_MUTED_IMAGE_ID,
} from "./impactMapMarkers";
import { MAP_POINT_COLOR } from "./mapConfig";

export const IMPACT_POINTS_LAYER_ID = "impact-points";

export const IMPACT_MARKER_HOVER_SCALE = 1.25;
export const IMPACT_MARKER_TRANSITION_MS = 280;

const HOVER_SCALE = IMPACT_MARKER_HOVER_SCALE;
const MUTED_MARKER_COLOR = "#C9C9C9";

export interface MapOverlayAnchor {
  x: number;
  y: number;
}

export interface ImpactMapGroupInteractionCallbacks {
  onHoverGroup: (group: ImpactMapGroup | null) => void;
  onSelectGroup: (group: ImpactMapGroup | null, anchor: MapOverlayAnchor | null) => void;
}

export interface ImpactMapMarkerStyleState {
  hoveredGroupId?: string | null;
  selectedGroupId?: string | null;
}

function buildMarkerSizeExpression(hoveredGroupId: string | null): Expression {
  const baseSize: Expression = ["get", "marker_size"];

  if (!hoveredGroupId) return baseSize;

  return [
    "case",
    ["==", ["get", "group_id"], hoveredGroupId],
    ["*", baseSize, HOVER_SCALE],
    baseSize,
  ];
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

  const hoveredGroupId = state.hoveredGroupId ?? null;
  const selectedGroupId = state.selectedGroupId ?? null;
  const sizeExpression = buildMarkerSizeExpression(hoveredGroupId);

  if (useSymbols) {
    map.setLayoutProperty(IMPACT_POINTS_LAYER_ID, "icon-size", [
      "/",
      sizeExpression,
      IMPACT_MARKER_INNER_RADIUS_PX,
    ]);
    map.setLayoutProperty(
      IMPACT_POINTS_LAYER_ID,
      "icon-image",
      buildMarkerImageExpression(selectedGroupId),
    );
    return;
  }

  map.setPaintProperty(IMPACT_POINTS_LAYER_ID, "circle-radius", sizeExpression);
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
    syncImpactMapMarkerStyles(map, useSymbols, { hoveredGroupId, selectedGroupId });
  };

  const setHoveredGroupId = (nextId: string | null) => {
    if (hoveredGroupId === nextId) return;

    hoveredGroupId = nextId;
    syncStyles();

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

  const onClick = (event: MapMouseEvent) => {
    const features = map.queryRenderedFeatures(event.point, {
      layers: [IMPACT_POINTS_LAYER_ID],
    });

    if (!features.length) {
      callbacks.onSelectGroup(null, null);
      return;
    }

    const groupId = features[0]?.properties?.group_id;
    if (!groupId) return;

    const group = getImpactGroupById(String(groupId));
    if (!group) return;

    callbacks.onSelectGroup(group, projectGroupAnchor(map, group));
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
  map.on("click", onClick);
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
      map.off("click", onClick);
      map.off("move", syncAnchors);
      map.off("zoom", syncAnchors);
      map.off("resize", syncAnchors);
      syncImpactMapMarkerStyles(map, useSymbols, {
        hoveredGroupId: null,
        selectedGroupId: null,
      });
      callbacks.onHoverGroup(null);
    },
  };
}
