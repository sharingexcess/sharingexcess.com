import type { Meta, StoryObj } from "@storybook/react";
import { StatsCardSection } from "./StatsCardSection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const STATS_3 = [
  { value: "1.2M+", label: "Lorem ipsum",       variant: "green"  as const },
  { value: "80+",   label: "Dolor sit",          variant: "yellow" as const },
  { value: "5K+",   label: "Amet consectetur",   variant: "orange" as const },
];

const STATS_2 = [
  { value: "1.2M+", label: "Lorem ipsum",       variant: "green"  as const },
  { value: "80+",   label: "Dolor sit",          variant: "yellow" as const },
];

const meta = {
  title: "Sections/Stats",
  component: StatsCardSection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    isCard: false,
    eyebrow: "Lorem ipsum",
    title: "*Lorem ipsum* dolor sit amet.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    stats: STATS_3,
    sticker: false,
    stickerName: "free-food",
  },
  argTypes: {
    ...sectionControlArgTypes,
    isCard:      { control: "boolean" },
    columns:     { control: false },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize:    { control: "radio", options: ["xl", "lg", "md"] },
    sticker: { control: "boolean" },
    stickerName: {
      control: "select",
      options: ["free-food", "waste-less", "sunrise", "lemon"],
    },
  },
} satisfies Meta<typeof StatsCardSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeCards: Story = {};

export const WithSticker: Story = {
  args: {
    sticker: true,
    stickerName: "free-food",
    align: "left",
    textLayout: "vertical",
  },
};

export const TwoCards: Story = {
  args: { columns: 2, stats: STATS_2 },
};

const IMAGE_STATS_3 = [
  {
    value: "1.2M+",
    label: "Lorem ipsum",
    type: "image" as const,
    tilt: "tiltLeft" as const,
    imageSrc: "/images/peppers.jpg",
  },
  {
    value: "80+",
    label: "Dolor sit",
    type: "image" as const,
    tilt: "tiltRight" as const,
    imageSrc: "/images/tomatoes.jpg",
  },
  {
    value: "5K+",
    label: "Amet consectetur",
    type: "image" as const,
    tilt: "tiltLeft" as const,
    imageSrc: "/images/oranges.jpg",
  },
];

export const ImageCards: Story = {
  args: { stats: IMAGE_STATS_3 },
};

export const ImageCardsTwoUp: Story = {
  args: { columns: 2, stats: IMAGE_STATS_3.slice(0, 2) },
};

const TEXT_IMAGE_STATS_2 = [
  {
    value: "Lorem ipsum?",
    label: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    type: "image" as const,
    variant: "green" as const,
    tilt: "tiltLeft" as const,
    imageSrc: "/images/peppers.jpg",
  },
  {
    value: "Dolor sit?",
    label: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    type: "image" as const,
    variant: "yellow" as const,
    tilt: "tiltRight" as const,
    imageSrc: "/images/tomatoes.jpg",
  },
];

export const ImageCardsTwoUpText: Story = {
  args: {
    columns: 2,
    contentVariant: "text",
    title: "Lorem ipsum",
    headingSize: "h2",
    align: "center",
    stats: TEXT_IMAGE_STATS_2,
  },
};
