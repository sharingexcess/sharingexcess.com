/**
 * After `bun run build`, checks that dist HTML files exist and key assets resolve.
 * Run: bun scripts/migration/verify-build.ts
 */
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");
const DIST = join(ROOT, "dist");

async function listHtml(dir: string, base = ""): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...(await listHtml(join(dir, e.name), rel)));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      out.push(rel);
    }
  }
  return out;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error("Run `bun run build` first.");
    process.exit(1);
  }
  const pages = await listHtml(DIST);
  console.error(`Found ${pages.length} HTML files in dist.`);

  const required = ["index.html", "css/sharingexcess.webflow.css", "js/webflow.js", "images/favicon.png"];
  let ok = true;
  for (const r of required) {
    const p = join(DIST, r);
    if (!existsSync(p)) {
      console.error(`Missing: ${r}`);
      ok = false;
    }
  }

  if (!ok) process.exit(1);
  console.error("verify-build: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
