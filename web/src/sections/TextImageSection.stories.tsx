import type { Meta, StoryObj } from "@storybook/react";
import { TextImageSection } from "./TextImageSection";

const meta = {
  title: "Sections/TextImageSection",
  component: TextImageSection,
  parameters: { renderer: "@storybook/react" },
  args: {
    theme: "light",
    title: "Food rescue at scale",
    body: "Sharing Excess coordinates volunteers and partners to move surplus food quickly.",
    imageSrc: "/images/financials.jpg",
    imageAlt: "Team distributing food",
    imagePosition: "right",
    imageStyle: "square",
  },
} satisfies Meta<typeof TextImageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageRight: Story = {};
export const ImageLeft: Story = { args: { imagePosition: "left" } };
export const RoundImage: Story = { args: { imageStyle: "round" } };
