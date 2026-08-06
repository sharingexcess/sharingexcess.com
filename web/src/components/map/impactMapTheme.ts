import type mapboxgl from "mapbox-gl";

export type ImpactMapAppearance = "dark" | "light";

/** Toggle impact map base style — `"light"` uses Mapbox light-v11. */
export const IMPACT_MAP_APPEARANCE: ImpactMapAppearance = "light";

/** Brand greens — dark impact map only. */
export const IMPACT_MAP_LAND_COLOR = "#003619";
export const IMPACT_MAP_WATER_COLOR = "#001F0A";
export const SURPLUS_MAP_STYLE_URL = "/js/surplus-dark-map-style.json";

/** Flat brand palette on dark style — no fog or ambient lighting. */
export function applyImpactMapTheme(
  map: mapboxgl.Map,
  appearance: ImpactMapAppearance = IMPACT_MAP_APPEARANCE,
): void {
  if (appearance === "light") return;

  if (typeof map.setProjection === "function") {
    map.setProjection("globe");
  }
  if (typeof map.setFog === "function") {
    map.setFog(null);
  }
  if (typeof map.setLights === "function") {
    map.setLights([]);
  }

  if (map.getLayer("land")) {
    map.setPaintProperty("land", "background-color", IMPACT_MAP_LAND_COLOR);
  }
  if (map.getLayer("water")) {
    map.setPaintProperty("water", "fill-color", IMPACT_MAP_WATER_COLOR);
  }
  if (map.getLayer("waterway")) {
    map.setPaintProperty("waterway", "line-color", IMPACT_MAP_WATER_COLOR);
  }
  if (map.getLayer("land-structure-polygon")) {
    map.setPaintProperty("land-structure-polygon", "fill-color", IMPACT_MAP_LAND_COLOR);
  }
  if (map.getLayer("land-structure-line")) {
    map.setPaintProperty("land-structure-line", "line-color", IMPACT_MAP_LAND_COLOR);
  }
}
