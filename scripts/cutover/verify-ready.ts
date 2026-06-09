/**
 * Pre-cutover checks: web app builds; compares legacy vs web route counts.
 * Run: bun scripts/cutover/verify-ready.ts
 *
 * Cutover itself: see AGENTS.md — flip root `build` script and Dockerfile to web/.
 */
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

const ROOT = join(import.meta.dirname, "../..");
const LEGACY_DIST = join(ROOT, "legacy/dist");
const WEB_DIST = join(ROOT, "web/dist");

async function countHtml(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  let count = 0;
  async function walk(d: string) {
    for (const entry of await readdir(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) await walk(p);
      else if (entry.name.endsWith(".html")) count++;
    }
  }
  await walk(dir);
  return count;
}

async function main() {
  console.error("Building web app...");
  await $`bun run --cwd ${join(ROOT, "web")} build`.quiet();

  const legacyPages = await countHtml(LEGACY_DIST);
  const webPages = await countHtml(WEB_DIST);

  console.log("Cutover readiness:");
  console.log(`  legacy/dist HTML files: ${legacyPages}`);
  console.log(`  web/dist HTML files:    ${webPages}`);
  console.log(`  web build:              OK`);

  if (webPages < legacyPages) {
    console.log(`\nNot ready to cutover: migrate ${legacyPages - webPages} more route(s) first.`);
    process.exit(0);
  }

  console.log("\nRoute parity reached. Safe to flip build target per AGENTS.md.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
