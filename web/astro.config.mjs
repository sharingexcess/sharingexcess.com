// @ts-check
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.sharingexcess.com";

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
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
};
