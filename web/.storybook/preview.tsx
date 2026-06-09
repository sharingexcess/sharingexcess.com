import type { Preview } from "storybook";
import "../src/styles/global.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
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
        <div data-theme={theme}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
