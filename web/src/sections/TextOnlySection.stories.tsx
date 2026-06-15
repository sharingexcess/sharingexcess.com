import type { Meta, StoryObj } from "@storybook/react";
import { TextOnlySection } from "./TextOnlySection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const meta = {
  title: "Sections/TextOnly",
  component: TextOnlySection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    eyebrow: "Section Eyebrow",
    title: "Lorem ipsum dolor sit *conspectus*.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    primaryCta: "Primary CTA",
    secondaryCta: "Secondary CTA",
    align: "left",
    layout: "vertical",
  },
  argTypes: {
    ...sectionControlArgTypes,
    align: { control: "radio", options: ["left", "center"] },
    layout: { control: "radio", options: ["vertical", "horizontal"] },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize: { control: "radio", options: ["xl", "lg", "md"] },
  },
} satisfies Meta<typeof TextOnlySection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAligned: Story = {
  args: { align: "left", layout: "vertical" },
};

export const CenterAligned: Story = {
  args: {
    align: "center",
    layout: "vertical",
    eyebrow: "Section Eyebrow",
  },
};
