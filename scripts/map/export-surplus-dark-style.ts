/**
 * Exports Surplus `darkMapStyle` (from ../surplus) for the legacy site impact map.
 * Re-run when Surplus map palette changes: `bun run map:export-style`
 */
import { darkMapStyle } from "../../../surplus/apps/client/src/lib/mapStyles.ts";

const MAP_LAND_COLOR = "#003619";
const MAP_WATER_COLOR = "#001F0A";

const style = structuredClone(darkMapStyle) as {
  name: string;
  layers: Array<{ id: string; paint?: Record<string, unknown> }>;
  fog?: Record<string, string>;
  lights?: unknown[];
  projection?: { name: string };
};

style.name = "Sharing Excess Impact";
style.projection = { name: "globe" };
delete style.fog;
delete style.lights;

for (const layer of style.layers) {
  if (layer.id === "land" && layer.paint?.["background-color"]) {
    layer.paint["background-color"] = MAP_LAND_COLOR;
  }
  if (layer.id === "water" && layer.paint?.["fill-color"]) {
    layer.paint["fill-color"] = MAP_WATER_COLOR;
  }
  if (layer.id === "waterway" && layer.paint?.["line-color"]) {
    layer.paint["line-color"] = MAP_WATER_COLOR;
  }
  if (layer.id === "land-structure-polygon" && layer.paint?.["fill-color"]) {
    layer.paint["fill-color"] = MAP_LAND_COLOR;
  }
  if (layer.id === "land-structure-line" && layer.paint?.["line-color"]) {
    layer.paint["line-color"] = MAP_LAND_COLOR;
  }
}

const outPath = new URL(
  "../../public/js/surplus-dark-map-style.json",
  import.meta.url,
);

await Bun.write(outPath, JSON.stringify(style));
console.log(`Wrote ${outPath.pathname} (${(await Bun.file(outPath)).size} bytes)`);
