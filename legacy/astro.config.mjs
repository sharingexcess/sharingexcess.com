// @ts-check
import tailwind from "@astrojs/tailwind";

/** Production URL for absolute links / metadata; override on Railway with PUBLIC_SITE_URL. */
const site =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.sharingexcess.com";

export default {
  site,
  publicDir: "../public",
  output: "static",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  compressHTML: false,
  trailingSlash: "never",
  build: {
    format: "file",
  },
};
