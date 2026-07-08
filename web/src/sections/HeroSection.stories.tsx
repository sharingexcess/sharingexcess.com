import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./HeroSection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const homeTitle = "Lorem ipsum dolor,\nsit amet conspectus.";
const subpageTitle = "Lorem ipsum dolor sit amet *conspectus*.";
const subpageBody =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.";

const meta = {
  title: "Sections/Hero",
  component: HeroSection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    isCard: false,
    eyebrow: "Section Eyebrow",
    title: subpageTitle,
    body: subpageBody,
    imageSrc: "/images/tomatoes.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    primaryCtaHref: "#",
    secondaryCta: "Secondary CTA",
    secondaryCtaHref: "#",
    bodySize: "md",
  },
  argTypes: {
    ...sectionControlArgTypes,
    layout: {
      control: "radio",
      options: ["full-width", "rounded", "stack-left", "stack-centered", "text"],
    },
    isCard: { control: "boolean" },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize: { control: "radio", options: ["xl", "lg", "md"] },
    sticker: { control: "boolean" },
    stickerName: {
      control: "select",
      options: ["free-food", "waste-less", "sunrise", "lemon"],
    },
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeFullWidth: Story = {
  parameters: {
    viewport: { defaultViewport: "figmaDesktop" },
  },
  args: {
    layout: "full-width",
    title: homeTitle,
    body: subpageBody,
    bodySize: "xl",
    eyebrow: undefined,
    imageSrc: "/images/oranges.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    secondaryCta: "Secondary CTA",
  },
  argTypes: {
    layout: { control: false },
    isCard: { control: false },
    eyebrow: { control: false },
    headingSize: { control: false },
  },
};

export const HomeRounded: Story = {
  parameters: {
    viewport: { defaultViewport: "figmaDesktop" },
  },
  args: {
    layout: "rounded",
    title: homeTitle,
    body: undefined,
    eyebrow: undefined,
    imageSrc: "/images/oranges.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    secondaryCta: "Secondary CTA",
  },
  argTypes: {
    layout: { control: false },
    isCard: { control: false },
    eyebrow: { control: false },
    body: { control: false },
    headingSize: { control: false },
    bodySize: { control: false },
  },
};

export const StackLeft: Story = {
  args: {
    layout: "stack-left",
    title: subpageTitle,
    body: undefined,
    eyebrow: undefined,
    imageCaption: "Lorem ipsum dolor sit amet.",
    showButtons: false,
    sticker: false,
    stickerName: "free-food",
  },
  argTypes: {
    layout: { control: false },
    eyebrow: { control: false },
  },
};

export const StackCentered: Story = {
  args: {
    layout: "stack-centered",
    title: subpageTitle,
    body: subpageBody,
    eyebrow: undefined,
    showButtons: false,
    sticker: false,
    stickerName: "free-food",
  },
  argTypes: {
    layout: { control: false },
    eyebrow: { control: false },
  },
};

export const TextOnly: Story = {
  args: {
    layout: "text",
    theme: "dark",
    title: "Lorem ipsum dolor sit amet *conspectus*.",
    body: subpageBody,
    imageSrc: undefined,
    eyebrow: undefined,
    primaryCta: "Primary CTA",
    secondaryCta: undefined,
  },
  argTypes: {
    layout: { control: false },
    imageSrc: { control: false },
    eyebrow: { control: false },
    secondaryCta: { control: false },
  },
};
