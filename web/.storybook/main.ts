import type { StorybookConfig } from "storybook";
import { react } from "@storybook-astro/framework/integrations";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook-astro/framework",
    options: {
      integrations: [react({ include: ["**/*.{tsx,jsx}"] })],
    },
  },
};

export default config;
