/**
 * Exports Surplus `darkMapStyle` (from ../surplus) for the legacy site impact map.
 * Re-run when Surplus map palette changes: `bun run map:export-style`
 */
import { darkMapStyle } from "../../../surplus/apps/client/src/lib/mapStyles.ts";

const outPath = new URL(
  "../../public/js/surplus-dark-map-style.json",
  import.meta.url,
);

await Bun.write(outPath, JSON.stringify(darkMapStyle));
console.log(`Wrote ${outPath.pathname} (${(await Bun.file(outPath)).size} bytes)`);
