import type { Meta, StoryObj } from "@storybook/react";
import { TextImageBackground, type TextImageItem } from "./TextImageBackground";

const carouselItems: TextImageItem[] = [
  {
    title: "Ipsum dol",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio.",
    imageSrc: "/images/peppers.jpg",
    imageAlt: "",
    primaryCta: "Lorem ipsum",
  },
  {
    title: "Dolor sit",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio.",
    imageSrc: "/images/tomatoes.jpg",
    imageAlt: "",
    primaryCta: "Lorem ipsum",
  },
  {
    title: "Amet elit",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    imageSrc: "/images/oranges.jpg",
    imageAlt: "",
    primaryCta: "Lorem ipsum",
  },
  {
    title: "Nunc odio",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis amet.",
    imageSrc: "/images/bananas.png",
    imageAlt: "",
    primaryCta: "Lorem ipsum",
  },
];

const meta = {
  title: "UI/TextImageBackground",
  component: TextImageBackground,
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Lorem ipsum",
    items: carouselItems,
    align: "left",
    defaultIndex: 1,
    autoAdvance: false,
  },
  argTypes: {
    align: { control: "radio", options: ["left", "center"] },
    autoAdvance: { control: "boolean" },
    defaultIndex: {
      control: { type: "number", min: 0, max: 3, step: 1 },
    },
  },
} satisfies Meta<typeof TextImageBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Centered: Story = {
  args: { align: "center" },
};
