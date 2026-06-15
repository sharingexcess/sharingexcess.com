import StyleDictionary from "style-dictionary";
import type { Config } from "style-dictionary/types";

const primitiveFilter = (token: any) =>
  ["color", "font", "radius", "spacing"].includes(
    token.attributes?.category ?? ""
  ) && token.path[0] !== "section";

const sectionFilter = (token: any) => token.path[0] === "section";

// Section semantic tokens are scoped per theme — drop the mode segment from names
// so `section.light.surface` becomes `--section-surface` under [data-theme="light"].
StyleDictionary.registerTransform({
  name: "name/section",
  type: "name",
  filter: sectionFilter,
  transform: (token) => `section-${token.path[2]}`,
});

StyleDictionary.registerTransformGroup({
  name: "css/section",
  transforms: [
    "attribute/cti",
    "name/section",
    "time/seconds",
    "html/icon",
    "size/px",
    "color/css",
  ],
});

const config: Config = {
  source: ["tokens/**/*.json"],
  platforms: {
    // ─── CSS custom properties ────────────────────────────────────────────────
    css: {
      transformGroup: "css",
      prefix: "",
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          filter: primitiveFilter,
          options: {
            outputReferences: false,
            selector: ":root",
          },
        },
      ],
    },

    "css-section": {
      transformGroup: "css/section",
      prefix: "",
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens-semantic.css",
          format: "css/variables",
          filter: (token) => sectionFilter(token) && token.path[1] === "light",
          options: {
            outputReferences: false,
            selector: '[data-theme="light"]',
          },
        },
        {
          destination: "tokens-semantic-dark.css",
          format: "css/variables",
          filter: (token) => sectionFilter(token) && token.path[1] === "dark",
          options: {
            outputReferences: false,
            selector: '[data-theme="dark"]',
          },
        },
      ],
    },

    // ─── JavaScript ES6 exports ───────────────────────────────────────────────
    js: {
      transformGroup: "js",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
          filter: primitiveFilter,
        },
        {
          destination: "section.js",
          format: "javascript/es6",
          filter: sectionFilter,
        },
      ],
    },

    // ─── Flat JSON ────────────────────────────────────────────────────────────
    json: {
      transformGroup: "js",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "tokens.json",
          format: "json/flat",
          filter: primitiveFilter,
        },
        {
          destination: "section.json",
          format: "json/flat",
          filter: sectionFilter,
        },
      ],
    },
  },
};

const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();
