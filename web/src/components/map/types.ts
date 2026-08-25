export type MapVariant =
  | "impact-clusters"
  | "hub-markers"
  | "region-highlights";

/** Single stat shown on the hub marker overlay card. */
export type MapHubMetricId = "meals" | "weight" | "partners" | "emissions";

export interface MapHubMetric {
  id: MapHubMetricId;
  value: string;
  label: string;
  /** Shown in the metric info popover when provided. */
  tooltip?: string;
}

/** Sharing Excess operational hub — shown with branded SE pin markers. */
export interface MapHub {
  lng: number;
  lat: number;
  name: string;
  /** Shown in the overlay card when the pin is clicked. */
  metrics?: MapHubMetric[];
}

/** Macro US region — states are matched against `/geo/us-states.json`. */
export interface MapMacroRegion {
  id: string;
  name: string;
  states: string[];
  fillColor?: string;
}

export type ImpactMapViewportFit = "framed" | "fill";

export interface InteractiveMapProps {
  variant: MapVariant;
  className?: string;
  /** Impact clusters — show logo while tiles load */
  showLoadingLogo?: boolean;
  center?: [number, number];
  zoom?: number;
  /** Hub-markers — defaults to the four SE hub cities when omitted */
  hubs?: MapHub[];
  /** Region-highlights — defaults to Northeast / Southeast / Central / West Coast */
  regions?: MapMacroRegion[];
  maxZoom?: number;
  showNavigation?: boolean;
  /** Fires once when tiles/markers are ready and the loading overlay is dismissed */
  onReady?: () => void;
  /** Impact clusters — `fill` uses mercator + fitBounds for full-bleed map stages */
  viewportFit?: ImpactMapViewportFit;
  /** Impact clusters — auto-cycle through hub cards (default on) */
  locationTour?: boolean;
}
