import type { Meta, StoryObj } from "@storybook/react";
import { SocialMediaSection } from "./SocialMediaSection";
import { sectionThemeArgs, sectionThemeArgTypes } from "./sectionStoryControls";

const SOCIAL_ITEMS = [
  {
    src: "/images/peppers.jpg",
    alt: "",
    aspect: "story" as const,
  },
  {
    src: "/images/tomatoes.jpg",
    alt: "",
    aspect: "post" as const,
  },
  {
    src: "/images/oranges.jpg",
    alt: "",
    aspect: "story" as const,
  },
  {
    src: "/images/bananas.png",
    alt: "",
    aspect: "story" as const,
  },
];

const meta = {
  title: "Sections/SocialMedia",
  component: SocialMediaSection,
  parameters: { layout: "fullscreen" },
  args: {
    ...sectionThemeArgs,
    title: "Lorem ipsum dolor sit amet *conspectus*.",
    headingSize: "h2",
    items: SOCIAL_ITEMS,
    showNavigation: false,
    highlightedIndex: 1,
  },
  argTypes: {
    ...sectionThemeArgTypes,
    headingSize: { control: "radio", options: ["h1", "h2"] },
    showNavigation: { control: "boolean" },
  },
} satisfies Meta<typeof SocialMediaSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  args: {
    showNavigation: true,
    highlightedIndex: 1,
  },
};
