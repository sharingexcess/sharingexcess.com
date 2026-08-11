import type { Map } from "mapbox-gl";
import { IMPACT_MAP_GROUPS } from "./impactMapGroups";

export interface ImpactPulseLocation {
  lng: number;
  lat: number;
  groupId: string;
}

/** Hub cities with labels — kept in sync with IMPACT_MAP_GROUPS. */
export const IMPACT_PULSE_LOCATIONS: ImpactPulseLocation[] = IMPACT_MAP_GROUPS.map(
  (group) => ({
    lng: group.lng,
    lat: group.lat,
    groupId: group.id,
  }),
);

/** Must match `se-map-live-pulse` animation duration in map.css. */
const PULSE_ANIMATION_MS = 1600;
const PULSE_DELAY_MS = 600;
const PULSE_INTERVAL_MS = PULSE_ANIMATION_MS + PULSE_DELAY_MS;

export interface ImpactMapPulseCallbacks {
  onPulseGroup?: (groupId: string | null) => void;
}

export function startImpactMapPulse(
  map: Map,
  overlay: HTMLElement,
  callbacks: ImpactMapPulseCallbacks = {},
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  let index = 0;
  let pulseEl: HTMLDivElement | null = null;
  let activeLocation = IMPACT_PULSE_LOCATIONS[0];
  let pulseEndTimer: ReturnType<typeof setTimeout> | null = null;

  const clearPulseEndTimer = () => {
    if (pulseEndTimer) {
      window.clearTimeout(pulseEndTimer);
      pulseEndTimer = null;
    }
  };

  const notifyPulseGroup = (location: ImpactPulseLocation) => {
    clearPulseEndTimer();
    callbacks.onPulseGroup?.(location.groupId);

    pulseEndTimer = window.setTimeout(() => {
      callbacks.onPulseGroup?.(null);
      pulseEndTimer = null;
    }, PULSE_ANIMATION_MS);
  };

  const syncPosition = () => {
    if (!pulseEl) return;
    const point = map.project([activeLocation.lng, activeLocation.lat]);
    pulseEl.style.left = `${point.x}px`;
    pulseEl.style.top = `${point.y}px`;
  };

  const firePulse = () => {
    activeLocation = IMPACT_PULSE_LOCATIONS[index]!;
    index = (index + 1) % IMPACT_PULSE_LOCATIONS.length;

    pulseEl?.remove();
    pulseEl = document.createElement("div");
    pulseEl.className = "se-map-live-pulse";
    overlay.appendChild(pulseEl);
    syncPosition();

    pulseEl.classList.remove("se-map-live-pulse--active");
    void pulseEl.offsetWidth;
    pulseEl.classList.add("se-map-live-pulse--active");
    notifyPulseGroup(activeLocation);
  };

  firePulse();
  const interval = window.setInterval(firePulse, PULSE_INTERVAL_MS);
  map.on("move", syncPosition);
  map.on("zoom", syncPosition);
  map.on("resize", syncPosition);

  return () => {
    window.clearInterval(interval);
    clearPulseEndTimer();
    callbacks.onPulseGroup?.(null);
    map.off("move", syncPosition);
    map.off("zoom", syncPosition);
    map.off("resize", syncPosition);
    pulseEl?.remove();
  };
}
