import type { Map } from "mapbox-gl";

/** High-volume hub regions — fixed list, cycled every 1.2s (no runtime selection). */
export const IMPACT_PULSE_LOCATIONS = [
  { lng: -75.1652, lat: 39.9526 }, // Philadelphia
  { lng: -73.8847, lat: 40.8094 }, // Hunts Point
  { lng: -87.6298, lat: 41.8781 }, // Chicago
  { lng: -83.0458, lat: 42.3314 }, // Detroit
  { lng: -118.2437, lat: 34.0522 }, // Los Angeles
  { lng: -96.797, lat: 32.7767 }, // Dallas
  { lng: -84.388, lat: 33.749 }, // Atlanta
  { lng: -95.3698, lat: 29.7604 }, // Houston
] as const;

const PULSE_INTERVAL_MS = 1200;

export function startImpactMapPulse(
  map: Map,
  overlay: HTMLElement,
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  let index = 0;
  let pulseEl: HTMLDivElement | null = null;
  let activeLocation = IMPACT_PULSE_LOCATIONS[0];

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
  };

  firePulse();
  const interval = window.setInterval(firePulse, PULSE_INTERVAL_MS);
  map.on("move", syncPosition);
  map.on("zoom", syncPosition);
  map.on("resize", syncPosition);

  return () => {
    window.clearInterval(interval);
    map.off("move", syncPosition);
    map.off("zoom", syncPosition);
    map.off("resize", syncPosition);
    pulseEl?.remove();
  };
}
