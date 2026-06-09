/**
 * Extracts headings, paragraphs, and image srcs from legacy Webflow fragment HTML
 * to aid copy migration into web/ section props.
 *
 * Run: bun scripts/rewrite/extract-fragment-content.ts [fragment-name]
 * Example: bun scripts/rewrite/extract-fragment-content.ts about.html.body.html
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const REPO = join(import.meta.dirname, "../..");
const FRAG_DIR = join(REPO, "legacy/src/webflow-fragments");

interface ExtractedContent {
  file: string;
  headings: string[];
  paragraphs: string[];
  images: { src: string; alt: string }[];
}

function extractFromHtml(html: string): Omit<ExtractedContent, "file"> {
  const headings: string[] = [];
  const paragraphs: string[] = [];
  const images: { src: string; alt: string }[] = [];

  for (const match of html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)) {
    const text = match[1]?.replace(/<[^>]+>/g, "").trim();
    if (text) headings.push(text);
  }

  for (const match of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = match[1]?.replace(/<[^>]+>/g, "").trim();
    if (text && text.length > 20) paragraphs.push(text);
  }

  for (const match of html.matchAll(/<img[^>]+>/gi)) {
    const tag = match[0];
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
    const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] ?? "";
    if (src) images.push({ src, alt });
  }

  return {
    headings: headings.slice(0, 20),
    paragraphs: paragraphs.slice(0, 20),
    images: images.slice(0, 20),
  };
}

async function main() {
  const target = process.argv[2];
  const files = target
    ? [target]
    : (await readdir(FRAG_DIR)).filter((f) => f.endsWith(".body.html"));

  const results: ExtractedContent[] = [];

  for (const file of files) {
    const html = await readFile(join(FRAG_DIR, file), "utf8");
    results.push({ file, ...extractFromHtml(html) });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
