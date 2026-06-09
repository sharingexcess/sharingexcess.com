/**
 * Converts Webflow ZIP export HTML into Astro pages + head/body fragment files.
 * Run: bun scripts/migration/generate-webflow-astro.ts
 */
import { parseHTML } from "linkedom";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative } from "node:path";

const REPO = join(import.meta.dirname, "../..");
/** Webflow “Export code” folder (ZIP extracted here). */
const EXPORT = join(REPO, "sharingexcess.webflow");
const FRAG = join(REPO, "src/webflow-fragments");
const PAGES = join(REPO, "src/pages");

function isExternalHref(href: string): boolean {
  const t = href.trim();
  return (
    /^https?:\/\//i.test(t) ||
    t.startsWith("//") ||
    t.startsWith("mailto:") ||
    t.startsWith("tel:") ||
    t.startsWith("javascript:") ||
    t.startsWith("data:")
  );
}

/** Routes that match Astro static output (`build.format: "file"` → `about.html` on disk). */
function htmlFileToRoute(filePath: string): string {
  const f = filePath.replace(/^\/+/, "");
  if (f === "index.html") return "/";
  return "/" + f;
}

function resolvePathFromPage(href: string, pagePath: string): string {
  const trimmed = href.trim();
  const pageDir = posix.dirname(pagePath);
  const base = `https://webflow.local/${pageDir === "." ? "" : pageDir + "/"}`;
  const u = new URL(trimmed, base);
  return u.pathname.replace(/^\/+/, "");
}

function isAssetPath(resolvedNoLeading: string): boolean {
  if (
    /\.(css|js|png|jpg|jpeg|svg|webp|avif|gif|mp4|webm|pdf|json|woff2?|ico|map)$/i.test(
      resolvedNoLeading,
    )
  ) {
    return true;
  }
  return /^(css|js|images|documents|videos)\//.test(resolvedNoLeading);
}

function toSiteUrl(resolvedNoLeading: string, hash?: string): string {
  const ext = (/\.([^.]+)$/.exec(resolvedNoLeading)?.[1] ?? "").toLowerCase();
  const isHtml = ext === "html" || ext === "htm";
  let path: string;
  if (isHtml) {
    path = htmlFileToRoute(resolvedNoLeading);
  } else if (!isAssetPath(resolvedNoLeading) && !ext) {
    path = htmlFileToRoute(`${resolvedNoLeading}.html`);
  } else {
    path = "/" + resolvedNoLeading;
  }
  return hash ? `${path}#${hash}` : path;
}

function rewriteAttrValue(value: string, pagePath: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("data:")) return value;
  const hashIdx = trimmed.indexOf("#");
  const pathPart = hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed;
  const hash = hashIdx >= 0 ? trimmed.slice(hashIdx + 1) : undefined;
  if (!pathPart || pathPart === "") return value;
  if (isExternalHref(pathPart)) return value;
  if (pathPart.startsWith("/")) {
    const p = pathPart.replace(/^\/+/, "");
    if (!p) return "/";
    return toSiteUrl(p, hash);
  }
  const resolved = resolvePathFromPage(pathPart, pagePath);
  return toSiteUrl(resolved, hash);
}

function rewriteSrcset(value: string, pagePath: string): string {
  return value
    .split(",")
    .map((part) => {
      const m = part.trim().match(/^(\S+)(\s+.*)?$/);
      if (!m || !m[1]) return part.trim();
      const url = m[1];
      const rest = m[2] ?? "";
      if (isExternalHref(url) || url.startsWith("data:")) return part.trim();
      const rewritten = rewriteAttrValue(url, pagePath);
      return `${rewritten}${rest}`;
    })
    .join(", ");
}

function rewriteInlineStyle(style: string, pagePath: string): string {
  return style.replace(/url\(\s*([^)]+?)\s*\)/gi, (_m, inner: string) => {
    const raw = inner.replace(/^["']|["']$/g, "").trim();
    if (raw.startsWith("data:") || /^https?:\/\//i.test(raw)) return `url(${inner})`;
    const rewritten = rewriteAttrValue(raw, pagePath);
    return `url("${rewritten}")`;
  });
}

function rewriteDocument(document: Document, pagePath: string) {
  const attrs = ["href", "src", "poster", "data-src", "data-href"];
  for (const el of document.querySelectorAll("*")) {
    for (const a of attrs) {
      const v = el.getAttribute(a);
      if (v && !v.startsWith("data:")) {
        el.setAttribute(a, rewriteAttrValue(v, pagePath));
      }
    }
    if (el.hasAttribute("srcset")) {
      const s = el.getAttribute("srcset");
      if (s) el.setAttribute("srcset", rewriteSrcset(s, pagePath));
    }
    const st = el.getAttribute("style");
    if (st) el.setAttribute("style", rewriteInlineStyle(st, pagePath));
  }
}

function attrsObject(el: HTMLElement | null): Record<string, string> {
  const o: Record<string, string> = {};
  if (!el?.attributes) return { lang: "en" };
  for (const a of el.attributes) {
    o[a.name] = a.value;
  }
  return o;
}

async function collectHtmlFiles(dir: string, base = ""): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...(await collectHtmlFiles(join(dir, e.name), rel)));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      out.push(rel);
    }
  }
  return out;
}

function fragNameFromPage(pageRel: string): string {
  return pageRel.replace(/\//g, "__");
}

/** Scripts loaded site-wide from WebflowHtml.astro / public/js — strip on Webflow regen. */
function stripCentralizedScripts(html: string): string {
  return html
    .replace(/\s*<script id="cookie-consent">[\s\S]*?<\/script>/g, "")
    .replace(
      /\s*<script type="text\/javascript" id="getImpactData">[\s\S]*?<\/script>/g,
      "",
    )
    .replace(
      /\s*<script src="https:\/\/js\.sentry-cdn\.com\/d73e9e40eaf6f191cb6758409bebcaa4\.min\.js" crossorigin="anonymous">[\s\S]*?<\/script>\s*<script>[\s\S]*?Sentry\.onLoad[\s\S]*?<\/script>/g,
      "",
    );
}

function pagePathToAstroPath(pageRel: string): string {
  const base = pageRel.replace(/\.html$/i, "");
  if (base === "index") return join(PAGES, "index.astro");
  const parts = base.split("/");
  const file = parts.pop()!;
  const sub = parts.length ? join(PAGES, ...parts) : PAGES;
  return join(sub, `${file}.astro`);
}

async function main() {
  await mkdir(FRAG, { recursive: true });
  await mkdir(PAGES, { recursive: true });

  const htmlFiles = await collectHtmlFiles(EXPORT);
  htmlFiles.sort();

  for (const pageRel of htmlFiles) {
    const abs = join(EXPORT, pageRel);
    const raw = await readFile(abs, "utf-8");
    const { document } = parseHTML(raw);
    const htmlEl = document.documentElement as HTMLElement | null;

    let headInner = "";
    let bodyInner = "";
    if (htmlEl) {
      rewriteDocument(document, pageRel);
      headInner = stripCentralizedScripts(document.head?.innerHTML ?? "");
      bodyInner = document.body?.innerHTML ?? "";
    }

    const htmlAttrs = attrsObject(htmlEl);

    const fragBase = fragNameFromPage(pageRel);
    const headPath = join(FRAG, `${fragBase}.head.html`);
    const bodyPath = join(FRAG, `${fragBase}.body.html`);
    await mkdir(dirname(headPath), { recursive: true });
    await writeFile(headPath, headInner, "utf-8");
    await writeFile(bodyPath, bodyInner, "utf-8");

    const astroOut = pagePathToAstroPath(pageRel);
    await mkdir(dirname(astroOut), { recursive: true });

    // Compute import paths robustly
    const relToLayouts = relative(dirname(astroOut), join(REPO, "src/layouts/WebflowHtml.astro")).replace(
      /\\/g,
      "/",
    );
    const relToHead = relative(dirname(astroOut), headPath).replace(/\\/g, "/");
    const relToBody = relative(dirname(astroOut), bodyPath).replace(/\\/g, "/");

    const finalAstro = `---
import WebflowHtml from "${relToLayouts.startsWith(".") ? relToLayouts : "./" + relToLayouts}";
import headHtml from "${relToHead}?raw";
import bodyHtml from "${relToBody}?raw";

const htmlAttrs = ${JSON.stringify(htmlAttrs)} as Record<string, string>;
---
<WebflowHtml htmlAttrs={htmlAttrs} headHtml={headHtml} bodyHtml={bodyHtml} />
`;

    await writeFile(astroOut, finalAstro, "utf-8");
    console.error(`Wrote ${relative(REPO, astroOut)}`);
  }

  console.error(`Done: ${htmlFiles.length} pages`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
