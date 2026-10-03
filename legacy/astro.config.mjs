// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

/** Production URL for absolute links / metadata; override on Railway with PUBLIC_SITE_URL. */
const site =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.sharingexcess.com";

/** Utility, template, and preview pages kept out of the sitemap (first path segment). */
const SITEMAP_EXCLUDED = new Set([
  "401",
  "404",
  "checkout",
  "order-confirmation",
  "paypal-checkout",
  "search",
  "global-classes",
  "detail_category",
  "detail_product",
  "detail_sku",
  "find-food-v2",
  "find-food-v2-copy",
]);

/** @param {string} page absolute page URL */
function includeInSitemap(page) {
  const first = new URL(page).pathname.split("/").filter(Boolean)[0] ?? "";
  return !SITEMAP_EXCLUDED.has(first) && !first.startsWith("component-");
}

export default {
  site,
  publicDir: "../public",
  output: "static",
  integrations: [
    sitemap({ filter: includeInSitemap }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  compressHTML: false,
  trailingSlash: "never",
  build: {
    format: "directory",
  },
};
