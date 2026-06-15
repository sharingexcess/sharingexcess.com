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
  },
  argTypes: {
    ...sectionControlArgTypes,
    isCard:      { control: "boolean" },
    columns:     { control: false },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize:    { control: "radio", options: ["xl", "lg", "md"] },
  },
} satisfies Meta<typeof StatsCardSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeCards: Story = {};

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
