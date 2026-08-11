import { cn } from "@/lib/cn";
import { AnimatePresence } from "@/lib/motion";
import mapboxgl, { type LngLatBounds, type Map, type Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import "./map.css";
import { HubMarkerCard, type HubCardAnchor } from "./HubMarkerCard";
import { createHubMarkerElement } from "./hubMarkerElement";
import {
  addRecipientMarkerImage,
  enrichImpactGeoJson,
  IMPACT_MARKER_INNER_RADIUS_PX,
  RECIPIENT_IMAGE_ID,
} from "./impactMapMarkers";
import { applyImpactMapTheme } from "./impactMapTheme";
import { startImpactMapPulse } from "./impactMapPulse";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_HUBS,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAX_ZOOM,
  getImpactGeoJsonUrls,
  getMapboxAccessToken,
  getMapStyleForVariant,
  MAP_HUB_MARKER_COLOR,
  MAP_POINT_COLOR,
  STATIC_MAP_INTERACTION,
} from "./mapConfig";
import type { InteractiveMapProps, MapHub, MapMacroRegion } from "./types";

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
const HUB_MARKER_HEIGHT = 54;
const HUB_CARD_GAP = 12;
const HUB_CARD_MAX_WIDTH = 320;
const HUB_CARD_EDGE_PADDING = 16;

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
): HubCardAnchor {
  const point = map.project([hub.lng, hub.lat]);
  const halfCard = HUB_CARD_MAX_WIDTH / 2;
  const minX = HUB_CARD_EDGE_PADDING + halfCard;
  const maxX = containerWidth - HUB_CARD_EDGE_PADDING - halfCard;
  const x =
    maxX <= minX
      ? containerWidth / 2
      : Math.min(maxX, Math.max(minX, point.x));

  return {
    x,
    y: point.y - HUB_MARKER_HEIGHT - HUB_CARD_GAP,
  };
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

function fitBoundsFromGeoJson(
  map: Map,
  geojson: GeoJSON.FeatureCollection,
): void {
  if (!geojson.features?.length) return;

  const bounds = new mapboxgl.LngLatBounds();
  for (const feature of geojson.features) {
    if (feature.geometry?.type === "Point") {
      bounds.extend(feature.geometry.coordinates as [number, number]);
    }
  }

  if (bounds.isEmpty()) return;

  const isMobile = window.matchMedia("(max-width: 1023px)").matches;
  const padding = isMobile ? 16 : 28;
  const maxZoom = isMobile ? 5.25 : 4.75;
  const zoomBoost = isMobile ? 0.85 : 0.55;

  map.fitBounds(bounds, { padding, maxZoom, animate: false });
  map.setZoom(Math.min(map.getZoom() + zoomBoost, maxZoom));
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
      "circle-opacity": 0.85,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff",
    },
  });
}

function setupImpactMapLayers(
  map: Map,
  geojsonPromise: Promise<GeoJSON.FeatureCollection | null>,
  pulseOverlay: HTMLElement | null,
  onMarkersReady?: () => void,
  isCancelled?: () => boolean,
): () => void {
  applyImpactMapTheme(map);

  const hasMarkerImage = addRecipientMarkerImage(map);

  map.on("styleimagemissing", (event) => {
    if (event.id === RECIPIENT_IMAGE_ID) {
      addRecipientMarkerImage(map);
    }
  });

  let stopPulse: (() => void) | undefined;

  void (async () => {
    try {
      const raw = await geojsonPromise;
      if (isCancelled?.() || !raw?.features?.length) return;

      const data = enrichImpactGeoJson(raw);

      if (!map.getSource(IMPACT_SOURCE_ID)) {
        map.addSource(IMPACT_SOURCE_ID, {
          type: "geojson",
          data,
        });
      }

      try {
        addImpactPointLayer(map, hasMarkerImage);
      } catch {
        addImpactPointLayer(map, false);
      }

      map.on("mouseenter", IMPACT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", IMPACT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      if (pulseOverlay) {
        stopPulse = startImpactMapPulse(map, pulseOverlay);
      }

      fitBoundsFromGeoJson(map, raw);
    } catch (error) {
      console.warn("Impact map markers failed to load:", error);
    } finally {
      onMarkersReady?.();
    }
  })();

  return () => stopPulse?.();
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
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseOverlayRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const hubMarkersRef = useRef<HubMarkerEntry[]>([]);
  const mapId = useId().replace(/:/g, "");
  const [isLoading, setIsLoading] = useState(showLoadingLogo);
  const [selectedHub, setSelectedHub] = useState<MapHub | null>(null);
  const [cardAnchor, setCardAnchor] = useState<HubCardAnchor | null>(null);
  const accessToken = getMapboxAccessToken();

  const centerMapOnHub = useCallback((hub: MapHub) => {
    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: [hub.lng, hub.lat],
      zoom: Math.max(map.getZoom(), HUB_SELECT_ZOOM),
      duration: 600,
    });
  }, []);

  const handleHubClick = useCallback(
    (hub: MapHub) => {
      const map = mapRef.current;
      const container = containerRef.current;

      setSelectedHub((prev) => {
        if (prev?.name === hub.name) return null;

        if (map && container) {
          setCardAnchor(getHubCardAnchor(map, hub, container.clientWidth));
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
    syncHubMarkerSelection(hubMarkersRef.current, selectedHub);
  }, [selectedHub]);

  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !selectedHub) {
      setCardAnchor(null);
      return;
    }

    const syncAnchor = () => {
      setCardAnchor(getHubCardAnchor(map, selectedHub, container.clientWidth));
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

    const hideLoading = () => setIsLoading(false);
    const loadingFallbackTimer =
      showLoadingLogo
        ? window.setTimeout(hideLoading, 12000)
        : null;

    mapboxgl.accessToken = accessToken;

    map = new mapboxgl.Map({
      container,
      style: getMapStyleForVariant(variant),
      center,
      zoom,
      maxZoom: variant === "hub-markers" ? 8 : maxZoom,
      ...STATIC_MAP_INTERACTION,
    });

    mapRef.current = map;

    if (showNavigation) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    const resizeMap = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => map?.resize(), 150);
    };

    const dismissHubCard = () => setSelectedHub(null);

    map.on("load", () => {
      resizeMap();

      if (variant === "impact-clusters" && geojsonPromise) {
        stopImpactPulse = setupImpactMapLayers(
          map!,
          geojsonPromise,
          pulseOverlayRef.current,
          () => {
            if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
            if (showLoadingLogo) hideLoading();
          },
          () => cancelled,
        );
      } else if (variant === "hub-markers" && hubs.length > 0) {
        hubMarkersRef.current = setupHubMarkers(map!, hubs, handleHubClick);
        map!.on("click", dismissHubCard);
        if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
        if (showLoadingLogo) hideLoading();
      } else if (variant === "region-highlights") {
        void setupRegionHighlights(map!, regions ?? []).then(() => {
          if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
          if (showLoadingLogo) hideLoading();
        });
      } else {
        if (loadingFallbackTimer) window.clearTimeout(loadingFallbackTimer);
        if (showLoadingLogo) hideLoading();
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
    handleHubClick,
    hubs,
    maxZoom,
    regions,
    showLoadingLogo,
    showNavigation,
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

  return (
    <div
      className={cn("se-map", className)}
      style={{ "--se-map-point-color": MAP_POINT_COLOR } as CSSProperties}
    >
      <div ref={containerRef} id={mapId} className="size-full" />
      {variant === "impact-clusters" && (
        <div ref={pulseOverlayRef} className="se-map-pulse-overlay" aria-hidden />
      )}
      {variant === "hub-markers" && (
        <div className="se-map-hub-overlay">
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
