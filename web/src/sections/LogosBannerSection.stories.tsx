import type { Meta, StoryObj } from "@storybook/react";
import { LogosBannerSection } from "./LogosBannerSection";
import { sectionThemeArgs, sectionThemeArgTypes } from "./sectionStoryControls";

const PARTNER_LOGOS = Array.from({ length: 10 }, (_, index) => ({
  src: "/images/partner-logo-placeholder.svg",
  alt: "",
}));

const meta = {
  title: "Sections/LogosBanner",
  component: LogosBannerSection,
  parameters: { layout: "fullscreen" },
  args: {
    ...sectionThemeArgs,
    title: "Lorem ispum dolor sit amet",
    logos: PARTNER_LOGOS,
    grayscale: true,
    duration: 50,
  },
  argTypes: {
    ...sectionThemeArgTypes,
    grayscale: { control: "boolean" },
    duration: { control: { type: "number", min: 10, max: 120, step: 5 } },
  },
} satisfies Meta<typeof LogosBannerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullColor: Story = {
  args: { grayscale: false },
};
