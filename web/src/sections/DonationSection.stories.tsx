import type { Meta, StoryObj } from "@storybook/react";
import { DonationSection } from "./DonationSection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const meta = {
  title: "Sections/Donation",
  component: DonationSection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    theme: "dark",
    isCard: false,
    showButtons: false,
    title: "Lorem ipsum dolor sit amet *conspectus*.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    headingSize: "h2",
    bodySize: "lg",
    formPosition: "left",
    submitLabel: "Make a donation",
  },
  argTypes: {
    ...sectionControlArgTypes,
    isCard: { control: "boolean" },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize: { control: "radio", options: ["xl", "lg", "md"] },
    formPosition: { control: "radio", options: ["left", "right"] },
    showButtons: { control: false },
    titleEmphasis: { control: "boolean" },
  },
} satisfies Meta<typeof DonationSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormLeft: Story = {
  args: {
    formPosition: "left",
    theme: "light"
  },
};

export const FormRight: Story = {
  args: { formPosition: "right" },
};
