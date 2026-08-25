import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "storybook";
import { react } from "@storybook-astro/framework/integrations";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../../public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook-astro/framework",
    options: {
      integrations: [react({ include: ["**/*.{tsx,jsx}"] })],
    },
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      server: {
        proxy: {
          "/__surplus": {
            target: "https://surplus-api.sharingexcess.com",
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/__surplus/, ""),
          },
        },
      },
      plugins: [tailwindcss()],
      optimizeDeps: {
        exclude: [
          "astro:*",
          "virtual:astro:*",
          "astro/virtual-modules/transitions-router.js",
          "astro/dist/transitions/router.js",
        ],
      },
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("../src", import.meta.url)),
        },
      },
    });
  },
};

export default config;
