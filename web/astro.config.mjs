// @ts-check
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.sharingexcess.com";

const CLIENT_OPTIMIZE_DEPS = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "@astrojs/react/client.js",
];

/** Astro view-transition modules pull in virtual:astro:adapter-config/client, which esbuild cannot pre-bundle. */
const CLIENT_OPTIMIZE_EXCLUDE = [
  "astro:*",
  "virtual:astro:*",
  "astro/virtual-modules/transitions-router.js",
  "astro/virtual-modules/transitions-events.js",
  "astro/virtual-modules/transitions-types.js",
  "astro/virtual-modules/transitions-swap-functions.js",
  "astro/dist/transitions/router.js",
];

/** Vite 7 Environment API: top-level optimizeDeps does not reach the client graph reliably. */
function optimizeClientDeps() {
  return {
    name: "optimize-client-deps",
    configEnvironment(name) {
      if (name === "client") {
        return {
          optimizeDeps: {
            include: CLIENT_OPTIMIZE_DEPS,
            exclude: CLIENT_OPTIMIZE_EXCLUDE,
          },
        };
      }
    },
  };
}

/** @type {import('astro').AstroUserConfig} */
export default {
  site,
  publicDir: "../public",
  output: "static",
  integrations: [react()],
  compressHTML: true,
  trailingSlash: "never",
  build: {
    format: "file",
  },
  vite: {
    plugins: [tailwindcss(), optimizeClientDeps()],
    resolve: {
      tsconfigPaths: true,
      dedupe: ["react", "react-dom"],
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
};
