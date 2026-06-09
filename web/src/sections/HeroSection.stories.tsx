import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./HeroSection";

const meta = {
  title: "Sections/HeroSection",
  component: HeroSection,
  parameters: { renderer: "@storybook/react" },
  args: {
    theme: "dark",
    title: "Rescue food. Feed communities.",
    subtitle: "Sharing Excess connects surplus food to people who need it.",
    ctaLabel: "Get involved",
    ctaHref: "/get-involved",
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Light: Story = { args: { theme: "light" } };
