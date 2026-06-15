import type { ComponentProps } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { TextSection } from "./TextSection";

type TextSectionStoryArgs = ComponentProps<typeof TextSection> & {
  /** Story-only control — sets surface background, text theme, and button scheme */
  surfaceTheme?: "light" | "dark";
};

const withSurfaceTheme: Decorator<TextSectionStoryArgs> = (Story, { args }) => {
  const { surfaceTheme = "light", layout = "vertical", ...componentArgs } = args;
  const maxWidth = layout === "horizontal" ? 1200 : 860;

  return (
    <div
      data-theme={surfaceTheme}
      style={{
        background: surfaceTheme === "dark" ? "var(--color-se-green-700)" : "#fff",
        padding: 48,
        maxWidth,
      }}
    >
      <Story
        args={{
          ...componentArgs,
          layout,
          buttonScheme: surfaceTheme === "dark" ? "dark" : "light",
        }}
      />
    </div>
  );
};

const meta = {
  title: "UI/TextSection",
  component: TextSection,
  parameters: { layout: "padded" },
  decorators: [withSurfaceTheme],
  args: {
    eyebrow: "Lorem ipsum",
    heading: "Lorem ipsum dolor sit amet *conspectus*.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    primaryCta: "Primary CTA",
    secondaryCta: "Secondary CTA",
    surfaceTheme: "light",
  },
  argTypes: {
    surfaceTheme: {
      name: "theme",
      control: "radio",
      options: ["light", "dark"],
    },
    buttonScheme: { table: { disable: true } },
    layout: { control: "radio", options: ["vertical", "horizontal"] },
  },
} satisfies Meta<TextSectionStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { layout: "horizontal" },
};

export const HeadingOnly: Story = {
  name: "Heading only",
  args: { eyebrow: undefined, body: undefined, primaryCta: undefined, secondaryCta: undefined },
};
