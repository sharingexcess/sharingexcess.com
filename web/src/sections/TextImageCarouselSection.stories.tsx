import type { Meta, StoryObj } from "@storybook/react";
import { TextImageCarouselSection } from "./TextImageCarouselSection";
import {
  sectionCardControlArgTypes,
  sectionCardControlArgs,
  sectionThemeArgs,
  sectionThemeArgTypes,
} from "./sectionStoryControls";
import type { TextImageItem } from "@/components/ui/TextImage";

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
  title: "Sections/TextImage Carousel",
  component: TextImageCarouselSection,
  parameters: { layout: "fullscreen" },
  args: {
    ...sectionThemeArgs,
    ...sectionCardControlArgs,
    isCard: false,
    eyebrow: "Lorem ipsum",
    items: carouselItems,
    imagePosition: "left",
    defaultIndex: 1,
    advanceOnScroll: true,
    autoAdvance: false,
  },
  argTypes: {
    ...sectionThemeArgTypes,
    ...sectionCardControlArgTypes,
    isCard: { control: "boolean" },
    imagePosition: { control: "radio", options: ["left", "right"] },
    imageBleed: { control: "boolean" },
    advanceOnScroll: { control: "boolean" },
    autoAdvance: { control: "boolean" },
    defaultIndex: {
      control: { type: "number", min: 0, max: 3, step: 1 },
    },
  },
} satisfies Meta<typeof TextImageCarouselSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ImageRight: Story = {
  args: { imagePosition: "right" },
};

export const EdgeBleed: Story = {
  args: { imagePosition: "left", imageBleed: true },
};

export const WithoutEyebrow: Story = {
  args: { eyebrow: "" },
};

export const ManualTabs: Story = {
  args: { advanceOnScroll: false },
};

export const InCard: Story = {
  args: {
    isCard: true,
    cardColor: "surface",
  },
};
