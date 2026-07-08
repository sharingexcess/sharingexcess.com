import type { Meta, StoryObj } from "@storybook/react";
import { LogosBannerSection } from "./LogosBannerSection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const PARTNER_LOGOS = Array.from({ length: 10 }, (_, index) => ({
  src: "/images/partner-logo-placeholder.svg",
  alt: "",
}));

const meta = {
  title: "Sections/LogosBanner",
  component: LogosBannerSection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    eyebrow: "Lorem ipsum",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    primaryCta: "Primary CTA",
    logos: PARTNER_LOGOS,
    grayscale: true,
    duration: 40,
    bodySize: "lg",
  },
  argTypes: {
    ...sectionControlArgTypes,
    bodySize: { control: "radio", options: ["xl", "lg", "md"] },
    logos: { control: false },
    grayscale: { control: "boolean" },
    duration: { control: { type: "number", min: 10, max: 120, step: 5 } },
  },
} satisfies Meta<typeof LogosBannerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bodySize: "md"
  }
};

export const LogosOnly: Story = {
  args: {
    eyebrow: undefined,
    body: undefined,
    primaryCta: undefined,
    showButtons: false,
  },
};

export const FullColor: Story = {
  args: { grayscale: false },
};
