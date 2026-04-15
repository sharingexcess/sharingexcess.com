// @ts-check
import tailwind from "@astrojs/tailwind";

export default {
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
