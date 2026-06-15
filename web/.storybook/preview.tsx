import type { Preview } from "storybook";
import { AppProviders } from "../src/components/providers/AppProviders";
import "../src/styles/global.css";

const preview: Preview = {
  parameters: {
    renderer: "react",
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
    viewport: {
      viewports: {
        figmaDesktop: {
          name: "Figma desktop (1512)",
          styles: { width: "1512px", height: "982px" },
          type: "desktop",
        },
      },
    },
  },
  globalTypes: {
    sectionTheme: {
      description: "Section light/dark theme",
      toolbar: {
        title: "Section theme",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.sectionTheme ?? "light";
      return (
        <AppProviders smoothScroll={false}>
          <div data-theme={theme}>
            <Story />
          </div>
        </AppProviders>
      );
    },
  ],
};

export default preview;
