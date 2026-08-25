import { cn } from "@/lib/cn";
import { AnimatePresence, useReducedMotion } from "@/lib/motion";
import mapboxgl, { type LngLatBounds, type Map, type Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import "./map.css";
import {
  HubMarkerCard,
  type HubCardAnchor,
  getHubCardEdgePaddingPx,
  getHubCardMapCenterOffsetPx,
  getHubMarkerCardEstimatedHeightPx,
  getHubMarkerCardWidthPx,
  getPinnedHubCardAnchor,
  HUB_CARD_MARKER_GAP_PX,
  isMobileHubCardLayout,
  syncHubCardLayoutCssVars,
} from "./HubMarkerCard";
import { createHubMarkerElement } from "./hubMarkerElement";
import {
  addRecipientMarkerImage,
  addRecipientMutedMarkerImage,
  IMPACT_MARKER_INNER_RADIUS_PX,
  RECIPIENT_IMAGE_ID,
  RECIPIENT_MUTED_IMAGE_ID,
} from "./impactMapMarkers";
import {
  enrichImpactGeoJsonWithGroups,
  IMPACT_MAP_GROUPS,
  IMPACT_MAP_GROUPS_BY_STACK,
  IMPACT_MAP_TOUR_GROUPS,
  projectImpactGroupLabelAnchor,
  type ImpactMapGroup,
} from "./impactMapGroups";
import { applyImpactMapTheme } from "./impactMapTheme";
import { setupImpactMapConnectors } from "./impactMapConnectors";
import { startImpactMapPulse } from "./impactMapPulse";
import {
  setupImpactMapGroupInteractions,
  type ImpactMapGroupInteractionController,
  type MapOverlayAnchor,
} from "./setupImpactMapGroupInteractions";
import { useImpactGroupMetrics } from "./useImpactGroupMetrics";
import { useImpactMapLocationTour } from "./useImpactMapLocationTour";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_HUBS,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAX_ZOOM,
  getImpactGeoJsonUrls,
  applyImpactMapViewport,
  getImpactMapView,
  getMapboxAccessToken,
  getMapStyleForVariant,
  MAP_HUB_MARKER_COLOR,
  MAP_POINT_COLOR,
  STATIC_MAP_INTERACTION,
} from "./mapConfig";
import type { ImpactMapViewportFit, InteractiveMapProps, MapHub, MapMacroRegion } from "./types";

const GROUP_METRICS_PLACEHOLDER = DEFAULT_MAP_HUBS[0]?.metrics ?? [];

const IMPACT_SOURCE_ID = "impact-locations";
const IMPACT_LAYER_ID = "impact-points";
const REGION_SOURCE_ID = "se-regions";
const REGION_FILL_LAYER_ID = "se-regions-fill";
const REGION_LINE_LAYER_ID = "se-regions-line";

const REGION_FILL_COLOR = MAP_HUB_MARKER_COLOR;
const REGION_FILL_OPACITY = 0.35;
const REGION_BORDER_COLOR = MAP_HUB_MARKER_COLOR;
const REGION_BORDER_WIDTH = 1.5;

/** Zoom when a hub pin is selected — close enough to read the card above the marker. */
const HUB_SELECT_ZOOM = 6;
const GROUP_ZOOM_DURATION_MS = 600;
const HUB_MARKER_HEIGHT = 54;
const HUB_CARD_GAP = 12;

function clampHubCardAnchorX(
  pointX: number,
  containerWidth: number,
  cardWidth: number,
  edgePadding: number,
): number {
  const halfCard = cardWidth / 2;
  const minX = edgePadding + halfCard;
  const maxX = containerWidth - edgePadding - halfCard;

  return maxX <= minX ? containerWidth / 2 : Math.min(maxX, Math.max(minX, pointX));
}

function clampHubCardAnchorY(
  preferredY: number,
  containerHeight: number,
  topPadding: number,
  bottomPadding: number,
  estimatedHeight: number,
): number {
  const minCardBottomY = topPadding + estimatedHeight;
  const maxCardBottomY = containerHeight - bottomPadding;

  return maxCardBottomY <= minCardBottomY
    ? minCardBottomY
    : Math.min(maxCardBottomY, Math.max(minCardBottomY, preferredY));
}

async function fetchImpactGeoJson(
  urls: string[],
  signal?: AbortSignal,
): Promise<GeoJSON.FeatureCollection | null> {
  for (const url of urls) {
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

type HubMarkerEntry = {
  marker: Marker;
  hub: MapHub;
  el: HTMLDivElement;
  destroy: () => void;
};

function attachHubMarkerInteractions(
  el: HTMLDivElement,
  hub: MapHub,
  onHubClick: (hub: MapHub) => void,
): () => void {
  const activate = (event: Event) => {
    event.stopPropagation();
    onHubClick(hub);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(event);
    }
  };

  el.addEventListener("click", activate);
  el.addEventListener("keydown", onKeyDown);

  return () => {
    el.removeEventListener("click", activate);
    el.removeEventListener("keydown", onKeyDown);
  };
}

function addHubMarker(
  map: Map,
  hub: MapHub,
  bounds: LngLatBounds,
  onHubClick: (hub: MapHub) => void,
): HubMarkerEntry {
  const el = createHubMarkerElement(hub);
  const destroyInteractions = attachHubMarkerInteractions(el, hub, onHubClick);

  const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
    .setLngLat([hub.lng, hub.lat])
    .addTo(map);

  bounds.extend([hub.lng, hub.lat]);

  return {
    marker,
    hub,
    el,
    destroy: () => {
      destroyInteractions();
      marker.remove();
    },
  };
}

function setupHubMarkers(
  map: Map,
  hubs: MapHub[],
  onHubClick: (hub: MapHub) => void,
): HubMarkerEntry[] {
  const bounds = new mapboxgl.LngLatBounds();
  const entries: HubMarkerEntry[] = [];

  for (const hub of hubs) {
    entries.push(addHubMarker(map, hub, bounds, onHubClick));
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 48, bottom: 48, left: 48, right: 48 },
      maxZoom: 5,
    });
  }

  return entries;
}

function syncHubMarkerSelection(
  entries: HubMarkerEntry[],
  selectedHub: MapHub | null,
): void {
  for (const { hub, el } of entries) {
    const isSelected = selectedHub?.name === hub.name;
    el.classList.toggle("se-map-hub-marker--selected", isSelected);
    el.setAttribute("aria-pressed", isSelected ? "true" : "false");
  }
}

function getHubCardAnchor(
  map: Map,
  hub: MapHub,
  containerWidth: number,
  containerHeight: number,
): HubCardAnchor {
  if (isMobileHubCardLayout(containerWidth)) {
    return getPinnedHubCardAnchor(containerWidth);
  }

  const point = map.project([hub.lng, hub.lat]);
  const edgePadding = getHubCardEdgePaddingPx(containerWidth);
  const cardWidth = getHubMarkerCardWidthPx(containerWidth);
  const x = clampHubCardAnchorX(point.x, containerWidth, cardWidth, edgePadding);
  const preferredY = point.y - HUB_MARKER_HEIGHT - HUB_CARD_GAP;
  const y = clampHubCardAnchorY(
    preferredY,
    containerHeight,
    edgePadding,
    edgePadding,
    getHubMarkerCardEstimatedHeightPx(containerWidth),
  );

  return { x, y };
}

function projectGroupCardAnchor(
  map: Map,
  group: ImpactMapGroup,
  containerWidth: number,
  containerHeight: number,
): HubCardAnchor {
  if (isMobileHubCardLayout(containerWidth)) {
    return getPinnedHubCardAnchor(containerWidth);
  }

  const point = projectImpactGroupLabelAnchor(map, group);
  const edgePadding = getHubCardEdgePaddingPx(containerWidth);
  const cardWidth = getHubMarkerCardWidthPx(containerWidth);
  const x = clampHubCardAnchorX(point.x, containerWidth, cardWidth, edgePadding);
  const preferredY = point.y - HUB_CARD_MARKER_GAP_PX;
  const y = clampHubCardAnchorY(
    preferredY,
    containerHeight,
    edgePadding,
    edgePadding,
    getHubMarkerCardEstimatedHeightPx(containerWidth),
  );

  return { x, y };
}

function setupRegionHighlights(
  map: Map,
  macroRegions: MapMacroRegion[] | undefined,
): Promise<void> {
  return import("./regionHighlights").then((regionHighlights) => {
    const {
      buildMergedRegionFeatureCollection,
      DEFAULT_MAP_MACRO_REGIONS,
      DEFAULT_MERGED_REGION_COLLECTION,
      findLabelLayerBeforeId,
      fitBoundsToMacroRegions,
    } = regionHighlights;

    const resolvedRegions =
      macroRegions?.length ? macroRegions : DEFAULT_MAP_MACRO_REGIONS;
    if (!resolvedRegions.length) return;

    const collection =
      resolvedRegions === DEFAULT_MAP_MACRO_REGIONS
        ? DEFAULT_MERGED_REGION_COLLECTION
        : buildMergedRegionFeatureCollection(resolvedRegions);
    const beforeId = findLabelLayerBeforeId(map);

    map.addSource(REGION_SOURCE_ID, {
      type: "geojson",
      data: collection,
    });

    map.addLayer(
      {
        id: REGION_FILL_LAYER_ID,
        type: "fill",
        source: REGION_SOURCE_ID,
        paint: {
          "fill-color": REGION_FILL_COLOR,
          "fill-opacity": REGION_FILL_OPACITY,
        },
      },
      beforeId,
    );

    map.addLayer(
      {
        id: REGION_LINE_LAYER_ID,
        type: "line",
        source: REGION_SOURCE_ID,
        paint: {
          "line-color": REGION_BORDER_COLOR,
          "line-width": REGION_BORDER_WIDTH,
          "line-opacity": 0.85,
        },
      },
      beforeId,
    );

    fitBoundsToMacroRegions(map, resolvedRegions);
  });
}

function addImpactPointLayer(map: Map, useSymbols: boolean): void {
  if (map.getLayer(IMPACT_LAYER_ID)) return;

  if (useSymbols) {
    map.addLayer({
      id: IMPACT_LAYER_ID,
      type: "symbol",
      source: IMPACT_SOURCE_ID,
      layout: {
        "icon-image": RECIPIENT_IMAGE_ID,
        "icon-size": ["/", ["get", "marker_size"], IMPACT_MARKER_INNER_RADIUS_PX],
        "symbol-sort-key": ["get", "marker_size"],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });
    return;
  }

  map.addLayer({
    id: IMPACT_LAYER_ID,
    type: "circle",
    source: IMPACT_SOURCE_ID,
    paint: {
      "circle-color": MAP_POINT_COLOR,
      "circle-radius": ["get", "marker_size"],
      "circle-radius-transition": { duration: 280, delay: 0 },
      "circle-opacity": 0.85,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff",
    },
  });
}

function setupImpactMapLayers(
  map: Map,
  geojsonPromise: Promise<GeoJSON.FeatureCollection | null>,
  pulseOverlayRef: RefObject<HTMLDivElement | null>,
  groupCallbacks: {
    onHoverGroup: (group: ImpactMapGroup | null) => void;
    onSelectGroup: (group: ImpactMapGroup | null, anchor: MapOverlayAnchor | null) => void;
    onPulseGroup: (groupId: string | null) => void;
  },
  groupInteractionsRef: RefObject<ImpactMapGroupInteractionController | null>,
  selectedGroupIdRef: RefObject<string | null>,
  impactGeoJsonRef: RefObject<GeoJSON.FeatureCollection | null>,
  onMarkersReady?: () => void,
  isCancelled?: () => boolean,
  viewportFit: ImpactMapViewportFit = "framed",
): () => void {
  applyImpactMapTheme(map);

  const hasMarkerImage = addRecipientMarkerImage(map);
  addRecipientMutedMarkerImage(map);

  map.on("styleimagemissing", (event) => {
    if (event.id === RECIPIENT_IMAGE_ID) {
      addRecipientMarkerImage(map);
    }
    if (event.id === RECIPIENT_MUTED_IMAGE_ID) {
      addRecipientMutedMarkerImage(map);
    }
  });

  let stopPulse: (() => void) | undefined;
  let stopConnectors: (() => void) | undefined;
  let groupInteractions: ImpactMapGroupInteractionController | undefined;
  let useSymbols = hasMarkerImage;

  const pulseOverlay = pulseOverlayRef.current;
  if (pulseOverlay) {
    stopPulse = startImpactMapPulse(map, pulseOverlay, {
      onPulseGroup: groupCallbacks.onPulseGroup,
    });
  }

  try {
    stopConnectors = setupImpactMapConnectors(map);
  } catch (error) {
    console.warn("Impact map connectors failed to start:", error);
  }

  applyImpactMapViewport(map, viewportFit);

  void (async () => {
    try {
      const raw = await geojsonPromise;
      if (isCancelled?.() || !raw?.features?.length) return;

      const data = enrichImpactGeoJsonWithGroups(raw);

      if (!map.getSource(IMPACT_SOURCE_ID)) {
        map.addSource(IMPACT_SOURCE_ID, {
          type: "geojson",
          data,
          promoteId: "id",
        });
      }

      try {
        addImpactPointLayer(map, useSymbols);
      } catch {
        useSymbols = false;
        addImpactPointLayer(map, false);
      }

      groupInteractions = setupImpactMapGroupInteractions(
        map,
        useSymbols,
        groupCallbacks,
      );
      groupInteractionsRef.current = groupInteractions;
      groupInteractions.setSelectedGroupId(selectedGroupIdRef.current);

      impactGeoJsonRef.current = raw;
      applyImpactMapViewport(map, viewportFit, raw);
    } catch (error) {
      console.warn("Impact map markers failed to load:", error);
    } finally {
      onMarkersReady?.();
    }
  })();

  return () => {
    stopPulse?.();
    stopConnectors?.();
    groupInteractions?.destroy();
    groupInteractionsRef.current = null;
  };
}

export function InteractiveMap({
  variant,
  className,
  showLoadingLogo = variant === "impact-clusters",
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  hubs = DEFAULT_MAP_HUBS,
  regions,
  maxZoom = DEFAULT_MAX_ZOOM,
  showNavigation = false,
  onReady,
  viewportFit = "framed",
  locationTour = true,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapShellRef = useRef<HTMLDivElement>(null);
  const pulseOverlayRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const hubMarkersRef = useRef<HubMarkerEntry[]>([]);
  const groupInteractionsRef = useRef<ImpactMapGroupInteractionController | null>(null);
  const selectedGroupIdRef = useRef<string | null>(null);
  const impactGeoJsonRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const readyCalledRef = useRef(false);
  const mapId = useId().replace(/:/g, "");
  const [isLoading, setIsLoading] = useState(showLoadingLogo);
  const [selectedHub, setSelectedHub] = useState<MapHub | null>(null);
  const [cardAnchor, setCardAnchor] = useState<HubCardAnchor | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<ImpactMapGroup | null>(null);
  const [pulsingGroupId, setPulsingGroupId] = useState<string | null>(null);
  const [groupLabelAnchors, setGroupLabelAnchors] = useState<Record<string, MapOverlayAnchor>>({});
  const [selectedGroup, setSelectedGroup] = useState<ImpactMapGroup | null>(null);
  const [groupCardAnchor, setGroupCardAnchor] = useState<MapOverlayAnchor | null>(null);
  const impactGroupMetrics = useImpactGroupMetrics();
  const accessToken = getMapboxAccessToken();
  const reduceMotion = useReducedMotion();
  const tourEnabled =
    variant === "impact-clusters" && locationTour && !reduceMotion;

  const selectImpactGroup = useCallback((group: ImpactMapGroup | null) => {
    if (!group) {
      setSelectedGroup(null);
      setGroupCardAnchor(null);
      return;
    }

    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;

    setGroupCardAnchor(
      projectGroupCardAnchor(
        map,
        group,
        container.clientWidth,
        container.clientHeight,
      ),
    );
    setSelectedGroup(group);
  }, []);

  const { pauseTour } = useImpactMapLocationTour({
    enabled: tourEnabled,
    groups: IMPACT_MAP_TOUR_GROUPS,
    isReady: variant === "impact-clusters" && !isLoading,
    onSelectGroup: selectImpactGroup,
  });

  const handleHoverGroup = useCallback((group: ImpactMapGroup | null) => {
    setHoveredGroup(group);
  }, []);

  const handleGroupLabelEnter = useCallback((group: ImpactMapGroup) => {
    groupInteractionsRef.current?.setHoveredGroupId(group.id);
  }, []);

  const handleGroupLabelLeave = useCallback(() => {
    groupInteractionsRef.current?.setHoveredGroupId(null);
  }, []);

  const handlePulseGroup = useCallback((groupId: string | null) => {
    setPulsingGroupId(groupId);
  }, []);

  const handleSelectGroup = useCallback(
    (group: ImpactMapGroup | null, anchor: MapOverlayAnchor | null) => {
      pauseTour();

      if (!group) {
        setSelectedGroup(null);
        setGroupCardAnchor(null);
        return;
      }

      setSelectedGroup((prev) => {
        if (prev?.id === group.id) {
          setGroupCardAnchor(null);
          return null;
        }

        setGroupCardAnchor(anchor);
        return group;
      });
    },
    [pauseTour],
  );

  const handleGroupClick = useCallback(
    (group: ImpactMapGroup, event?: { stopPropagation?: () => void }) => {
      pauseTour();
      event?.stopPropagation?.();

      const map = mapRef.current;
      const container = containerRef.current;
      if (!map || !container) return;

      handleSelectGroup(
        group,
        projectGroupCardAnchor(
          map,
          group,
          container.clientWidth,
          container.clientHeight,
        ),
      );
    },
    [handleSelectGroup, pauseTour],
  );

  const handleGroupLabelKeyDown = useCallback(
    (group: ImpactMapGroup, event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleGroupClick(group);
      }
    },
    [handleGroupClick],
  );

  const handleCloseGroupCard = useCallback(() => {
    pauseTour();
    setSelectedGroup(null);
    setGroupCardAnchor(null);
  }, [pauseTour]);

  const focusImpactGroup = useCallback((group: ImpactMapGroup | null) => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map) return;

    if (group) {
      const offsetY = container
        ? getHubCardMapCenterOffsetPx(container.clientWidth, container.clientHeight)
        : 0;

      map.easeTo({
        center: [group.lng, group.lat],
        zoom: Math.max(map.getZoom(), HUB_SELECT_ZOOM),
        duration: GROUP_ZOOM_DURATION_MS,
        offset: [0, offsetY],
      });
      return;
    }

    if (viewportFit === "fill") {
      applyImpactMapViewport(map, "fill", impactGeoJsonRef.current);
    } else {
      applyImpactMapViewport(map, "framed", impactGeoJsonRef.current);
    }
  }, [viewportFit]);

  const centerMapOnHub = useCallback((hub: MapHub) => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map) return;

    const offsetY = container
      ? getHubCardMapCenterOffsetPx(container.clientWidth, container.clientHeight)
      : 0;

    map.easeTo({
      center: [hub.lng, hub.lat],
      zoom: Math.max(map.getZoom(), HUB_SELECT_ZOOM),
      duration: 600,
      offset: [0, offsetY],
    });
  }, []);

  const handleHubClick = useCallback(
    (hub: MapHub) => {
      const map = mapRef.current;
      const container = containerRef.current;

      setSelectedHub((prev) => {
        if (prev?.name === hub.name) return null;

        if (map && container) {
          setCardAnchor(
            getHubCardAnchor(map, hub, container.clientWidth, container.clientHeight),
          );
          centerMapOnHub(hub);
        }

        return hub;
      });
    },
    [centerMapOnHub],
  );

  const handleCloseHubCard = useCallback(() => {
    setSelectedHub(null);
  }, []);

  useEffect(() => {
    selectedGroupIdRef.current = selectedGroup?.id ?? null;
    groupInteractionsRef.current?.setSelectedGroupId(selectedGroupIdRef.current);
  }, [selectedGroup]);

  const prevSelectedGroupRef = useRef<ImpactMapGroup | null | undefined>(undefined);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || variant !== "impact-clusters" || isLoading) return;

    const prev = prevSelectedGroupRef.current;
    if (prev === undefined) {
      prevSelectedGroupRef.current = selectedGroup;
      return;
    }

    if (prev?.id === selectedGroup?.id) return;

    prevSelectedGroupRef.current = selectedGroup;
    focusImpactGroup(selectedGroup);
  }, [focusImpactGroup, isLoading, selectedGroup, variant]);

  useEffect(() => {
    syncHubMarkerSelection(hubMarkersRef.current, selectedHub);
  }, [selectedHub]);

  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !selectedGroup) {
      setGroupCardAnchor(null);
      return;
    }

    const syncAnchor = () => {
      setGroupCardAnchor(
        projectGroupCardAnchor(
          map,
          selectedGroup,
          container.clientWidth,
          container.clientHeight,
        ),
      );
    };

    syncAnchor();
    map.on("move", syncAnchor);
    map.on("zoom", syncAnchor);
    map.on("resize", syncAnchor);

    return () => {
      map.off("move", syncAnchor);
      map.off("zoom", syncAnchor);
      map.off("resize", syncAnchor);
    };
  }, [selectedGroup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || variant !== "impact-clusters" || isLoading) return;

    const syncLabelAnchors = () => {
      const anchors: Record<string, MapOverlayAnchor> = {};
      for (const group of IMPACT_MAP_GROUPS) {
        anchors[group.id] = projectImpactGroupLabelAnchor(map, group);
      }
      setGroupLabelAnchors(anchors);
    };

    syncLabelAnchors();
    map.on("move", syncLabelAnchors);
    map.on("zoom", syncLabelAnchors);
    map.on("resize", syncLabelAnchors);

    return () => {
      map.off("move", syncLabelAnchors);
      map.off("zoom", syncLabelAnchors);
      map.off("resize", syncLabelAnchors);
    };
  }, [variant, isLoading]);

  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !selectedHub) {
      setCardAnchor(null);
      return;
    }

    const syncAnchor = () => {
      setCardAnchor(
        getHubCardAnchor(map, selectedHub, container.clientWidth, container.clientHeight),
      );
    };

    syncAnchor();
    map.on("move", syncAnchor);
    map.on("zoom", syncAnchor);
    map.on("resize", syncAnchor);

    return () => {
      map.off("move", syncAnchor);
      map.off("zoom", syncAnchor);
      map.off("resize", syncAnchor);
    };
  }, [selectedHub]);

  useEffect(() => {
    const container = containerRef.current;
    const shell = mapShellRef.current;
    if (!container || !shell) return;

    const syncLayout = () => {
      syncHubCardLayoutCssVars(shell, container.clientWidth);
    };

    syncLayout();

    const resizeObserver = new ResizeObserver(syncLayout);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !accessToken) return;

    const abortController = new AbortController();
    let cancelled = false;
    let map: Map | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let stopImpactPulse: (() => void) | undefined;

    const geojsonUrls = variant === "impact-clusters" ? getImpactGeoJsonUrls() : [];
    const geojsonPromise =
      geojsonUrls.length > 0
        ? fetchImpactGeoJson(geojsonUrls, abortController.signal)
        : null;

    const hideLoading = () => {
      setIsLoading(false);
      if (!readyCalledRef.current) {
        readyCalledRef.current = true;
        onReady?.();
      }
    };
    const loadingFallbackTimer =
      showLoadingLogo
        ? window.setTimeout(hideLoading, 12000)
        : null;

    mapboxgl.accessToken = accessToken;

    const impactView = variant === "impact-clusters" ? getImpactMapView() : null;

    map = new mapboxgl.Map({
      container,
      style: getMapStyleForVariant(variant),
      center: impactView?.center ?? center,
      zoom: impactView?.zoom ?? zoom,
      maxZoom: variant === "hub-markers" ? 8 : maxZoom,
      ...STATIC_MAP_INTERACTION,
    });

    mapRef.current = map;

    if (showNavigation) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    const resizeMap = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map?.resize();
        if (variant === "impact-clusters" && map) {
          applyImpactMapViewport(map, viewportFit, impactGeoJsonRef.current);
        }
      }, 150);
    };

    const dismissHubCard = () => setSelectedHub(null);

    map.on("load", () => {
      if (variant === "impact-clusters" && viewportFit === "fill") {
        applyImpactMapViewport(map!, "fill");
      }
      resizeMap();

      if (variant === "impact-clusters" && geojsonPromise) {
        stopImpactPulse = setupImpactMapLayers(
          map!,
          geojsonPromise,
          pulseOverlayRef,
          {
            onHoverGroup: handleHoverGroup,
            onSelectGroup: handleSelectGroup,
            onPulseGroup: handlePulseGroup,
          },
          groupInteractionsRef,
          selectedGroupIdRef,
          impactGeoJsonRef,
          () => {
            if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
            hideLoading();
          },
          () => cancelled,
          viewportFit,
        );
      } else if (variant === "hub-markers" && hubs.length > 0) {
        hubMarkersRef.current = setupHubMarkers(map!, hubs, handleHubClick);
        map!.on("click", dismissHubCard);
        if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
        hideLoading();
      } else if (variant === "region-highlights") {
        void setupRegionHighlights(map!, regions ?? []).then(() => {
          if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
          hideLoading();
        });
      } else {
        if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
        hideLoading();
      }
    });

    resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      abortController.abort();
      if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      stopImpactPulse?.();
      impactGeoJsonRef.current = null;
      prevSelectedGroupRef.current = undefined;
      for (const entry of hubMarkersRef.current) {
        entry.destroy();
      }
      hubMarkersRef.current = [];
      mapRef.current = null;
      map?.remove();
    };
  }, [
    accessToken,
    center,
    handleGroupLabelEnter,
    handleGroupLabelLeave,
    handleGroupClick,
    handleHoverGroup,
    handlePulseGroup,
    handleSelectGroup,
    focusImpactGroup,
    handleHubClick,
    hubs,
    maxZoom,
    regions,
    showLoadingLogo,
    showNavigation,
    onReady,
    viewportFit,
    variant,
    zoom,
  ]);

  if (!accessToken) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-[var(--color-neutral-500)] text-sm text-[var(--color-neutral-100)]",
          className,
        )}
      >
        Map unavailable — set PUBLIC_MAPBOX_ACCESS_TOKEN
      </div>
    );
  }

  const selectedGroupCard = selectedGroup
    ? {
        ...selectedGroup,
        metrics: impactGroupMetrics[selectedGroup.id] ?? GROUP_METRICS_PLACEHOLDER,
      }
    : null;

  return (
    <div
      ref={mapShellRef}
      className={cn("se-map", hoveredGroup && "se-map--group-hover", className)}
      style={{ "--se-map-point-color": MAP_POINT_COLOR } as CSSProperties}
    >
      <div ref={containerRef} id={mapId} className="size-full" />
      {variant === "impact-clusters" && (
        <div ref={pulseOverlayRef} className="se-map-pulse-overlay" aria-hidden />
      )}
      {variant === "impact-clusters" && (
        <div className="se-map-overlay">
          {IMPACT_MAP_GROUPS_BY_STACK.map((group) => {
            const anchor = groupLabelAnchors[group.id];
            if (!anchor || selectedGroup?.id === group.id) return null;

            const isHovered = hoveredGroup?.id === group.id;
            const isPulsing = pulsingGroupId === group.id;
            const stackZIndex = group.labelStackPriority ?? 0;

            return (
              <button
                key={group.id}
                type="button"
                className={cn(
                  "se-map-group-label-anchor",
                  isHovered && "se-map-group-label-anchor--hover",
                  isPulsing && "se-map-group-label-anchor--pulse",
                )}
                style={{ left: anchor.x, top: anchor.y, zIndex: stackZIndex }}
                aria-label={`View ${group.name} impact`}
                onClick={(event) => handleGroupClick(group, event)}
                onMouseEnter={() => handleGroupLabelEnter(group)}
                onMouseLeave={handleGroupLabelLeave}
                onKeyDown={(event) => handleGroupLabelKeyDown(group, event)}
              >
                <span className="se-map-group-label">
                  <img
                    src="/images/se-circle.png"
                    alt=""
                    className="se-map-group-label__logo"
                    width={20}
                    height={20}
                    aria-hidden
                  />
                  <span className="se-map-group-label__text">{group.name}</span>
                </span>
              </button>
            );
          })}
          <AnimatePresence mode="wait">
            {selectedGroupCard && groupCardAnchor && (
              <HubMarkerCard
                key={selectedGroupCard.id}
                hub={selectedGroupCard}
                anchor={groupCardAnchor}
                onClose={handleCloseGroupCard}
              />
            )}
          </AnimatePresence>
        </div>
      )}
      {variant === "hub-markers" && (
        <div className="se-map-overlay">
          <AnimatePresence mode="wait">
            {selectedHub && cardAnchor && (
              <HubMarkerCard
                key={selectedHub.name}
                hub={selectedHub}
                anchor={cardAnchor}
                onClose={handleCloseHubCard}
              />
            )}
          </AnimatePresence>
        </div>
      )}
      {showLoadingLogo && isLoading && (
        <div className="se-map-loading" aria-hidden>
          <img src="/images/logo_1.svg" alt="" width={80} />
        </div>
      )}
    </div>
  );
}

export default InteractiveMap;
