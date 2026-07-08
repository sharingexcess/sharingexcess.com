import { MAP_HUB_MARKER_COLOR } from "./mapConfig";
import type { MapHub } from "./types";

/** White map-pin silhouette from Surplus / Figma hub marker. */
const HUB_PIN_PATH =
  "M24 2C14.5 2 7 9.5 7 18.5C7 34.5 26.2 51.4 24 52.5C21.8 51.4 41 34.5 41 18.5C41 9.5 33.5 2 24 2Z";

/** Branded hub pin — green SE badge inset in white map-pin (Surplus impact map). */
export function createHubMarkerElement(hub: MapHub): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "se-map-hub-marker";
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", `${hub.name} hub — view metrics`);
  el.setAttribute("aria-pressed", "false");

  el.innerHTML = `
    <svg
      width="48"
      height="54"
      viewBox="0 0 48 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="${HUB_PIN_PATH}" fill="#FFFFFF" />
      <circle cx="24" cy="15" r="11.5" fill="${MAP_HUB_MARKER_COLOR}" />
      <text
        x="24"
        y="15"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#FFFFFF"
        font-family="Poppins, ui-sans-serif, system-ui, sans-serif"
        font-size="10.5"
        font-weight="700"
        letter-spacing="-0.06em"
      >SE</text>
    </svg>
  `.trim();

  return el;
}
