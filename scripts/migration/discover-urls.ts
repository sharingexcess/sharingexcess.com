/**
 * BFS crawl of sharingexcess.com — collects internal URLs and third-party dependencies.
 * Run: bun scripts/migration/discover-urls.ts
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const OUT_DIR = join(import.meta.dirname, "output");
const SEED_URLS = ["https://sharingexcess.com/", "https://www.sharingexcess.com/"];
const ALLOWED_HOSTS = new Set(["sharingexcess.com", "www.sharingexcess.com"]);
const MAX_PAGES = 200;

function canonicalKey(url: URL): string {
  const host =
    url.hostname === "sharingexcess.com" ? "www.sharingexcess.com" : url.hostname;
  const path = url.pathname.endsWith("/") && url.pathname.length > 1
    ? url.pathname.slice(0, -1)
    : url.pathname;
  return `${host}${path}${url.search}`;
}

function toCanonicalUrl(key: string): string {
  const [hostPath, ...rest] = key.split("?");
  const search = rest.length ? `?${rest.join("?")}` : "";
  return `https://${hostPath}${search}`;
}

function normalizeInternal(href: string, base: URL): string | null {
  try {
    const u = new URL(href, base);
    if (!ALLOWED_HOSTS.has(u.hostname)) return null;
    u.hash = "";
    const key = canonicalKey(u);
    return key;
  } catch {
    return null;
  }
}

type DepKind = "script" | "link" | "img" | "iframe" | "source" | "video" | "other";

function recordDep(
  deps: Map<string, { kinds: Set<DepKind>; samples: string[] }>,
  urlStr: string,
  kind: DepKind,
  samplePage: string,
) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname;
    if (ALLOWED_HOSTS.has(host)) return;
    let row = deps.get(host);
    if (!row) {
      row = { kinds: new Set(), samples: [] };
      deps.set(host, row);
    }
    row.kinds.add(kind);
    if (row.samples.length < 5 && !row.samples.includes(urlStr)) {
      row.samples.push(urlStr);
    }
  } catch {
    /* ignore */
  }
}

async function collectPageDeps(page: import("playwright").Page, pageUrl: string, deps: Map<string, { kinds: Set<DepKind>; samples: string[] }>) {
  const attrs = await page.evaluate(() => {
    const out: { tag: string; attr: string; val: string }[] = [];
    for (const el of document.querySelectorAll(
      "script[src], link[href], img[src], iframe[src], source[src], video[poster]",
    )) {
      const tag = el.tagName.toLowerCase();
      const attr = tag === "link" ? "href" : tag === "img" || tag === "iframe" || tag === "source" ? "src" : tag === "video" ? "poster" : "src";
      const val = el.getAttribute(attr);
      if (val) out.push({ tag, attr, val });
    }
    return out;
  });

  for (const { tag, val } of attrs) {
    const kind: DepKind =
      tag === "script"
        ? "script"
        : tag === "link"
          ? "link"
          : tag === "img"
            ? "img"
            : tag === "iframe"
              ? "iframe"
              : tag === "source"
                ? "source"
                : tag === "video"
                  ? "video"
                  : "other";
    if (val.startsWith("data:") || val.startsWith("blob:")) continue;
    try {
      const abs = new URL(val, pageUrl).href;
      recordDep(deps, abs, kind, pageUrl);
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (compatible; SharingExcessMigration/1.0; +https://sharingexcess.com)",
  });
  const page = await context.newPage();

  const visitedKeys = new Set<string>();
  const queue: string[] = [];
  const thirdParty = new Map<string, { kinds: Set<DepKind>; samples: string[] }>();

  for (const s of SEED_URLS) {
    const u = new URL(s);
    const k = canonicalKey(u);
    if (!visitedKeys.has(k)) {
      visitedKeys.add(k);
      queue.push(k);
    }
  }

  let pagesFetched = 0;
  while (queue.length > 0 && pagesFetched < MAX_PAGES) {
    const key = queue.shift()!;
    const url = toCanonicalUrl(key);
    console.error(`Crawl: ${url}`);

    try {
      pagesFetched += 1;
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      await page.waitForTimeout(800);
      // Lazy sections
      await page.evaluate(async () => {
        const step = () =>
          window.scrollBy(0, Math.min(800, document.body.scrollHeight - window.scrollY));
        for (let i = 0; i < 40; i++) {
          step();
          await new Promise((r) => setTimeout(r, 120));
          if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 2) break;
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);

      await collectPageDeps(page, page.url(), thirdParty);

      const hrefs = await page.$$eval("a[href]", (els) =>
        els.map((a) => (a as HTMLAnchorElement).href),
      );

      for (const href of hrefs) {
        const nk = normalizeInternal(href, new URL(page.url()));
        if (nk && !visitedKeys.has(nk)) {
          visitedKeys.add(nk);
          queue.push(nk);
        }
      }
    } catch (e) {
      console.error(`  fail: ${e}`);
    }
  }

  await browser.close();

  const urls = [...visitedKeys].sort().map(toCanonicalUrl);

  const matrix = {
    generatedAt: new Date().toISOString(),
    seedUrls: SEED_URLS,
    pageCount: urls.length,
    thirdParty: Object.fromEntries(
      [...thirdParty.entries()].map(([host, v]) => [
        host,
        {
          kinds: [...v.kinds].sort(),
          sampleUrls: v.samples,
        },
      ]),
    ),
  };

  await writeFile(join(OUT_DIR, "urls.json"), JSON.stringify({ urls, keys: [...visitedKeys].sort() }, null, 2));
  await writeFile(join(OUT_DIR, "dependency-matrix.json"), JSON.stringify(matrix, null, 2));

  const md = [
    `# Third-party dependency matrix`,
    ``,
    `Generated: ${matrix.generatedAt}`,
    `Pages discovered: ${urls.length}`,
    ``,
    `| Host | Kinds | Sample URLs |`,
    `|------|-------|-------------|`,
    ...[...thirdParty.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([host, v]) => {
        const kinds = [...v.kinds].join(", ");
        const samples = v.samples.map((s) => "`" + s + "`").join("<br>");
        return `| ${host} | ${kinds} | ${samples} |`;
      }),
    ``,
  ].join("\n");

  await writeFile(join(OUT_DIR, "dependency-matrix.md"), md);

  console.log(JSON.stringify({ pageCount: urls.length, outDir: OUT_DIR }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
