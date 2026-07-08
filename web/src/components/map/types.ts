export type MapVariant =
  | "impact-clusters"
  | "hub-markers"
  | "region-highlights";

/** Single stat shown on the hub marker overlay card. */
export interface MapHubMetric {
  value: string;
  label: string;
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
}
