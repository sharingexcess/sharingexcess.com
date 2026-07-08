import type { Meta, StoryObj } from "@storybook/react";
import { TextImageSection } from "./TextImageSection";
import { sectionControlArgs, sectionControlArgTypes, withSectionControls } from "./sectionStoryControls";

const meta = {
  title: "Sections/TextImage",
  component: TextImageSection,
  parameters: { layout: "fullscreen" },
  decorators: [withSectionControls],
  args: {
    ...sectionControlArgs,
    isCard: false,
    eyebrow: "Lorem ipsum",
    title: "*Lorem ipsum* dolor sit amet.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    primaryCta: "Lorem ipsum",
    secondaryCta: "Dolor sit amet",
    imageSrc: "/images/peppers.jpg",
    imageAlt: "",
  },
  argTypes: {
    ...sectionControlArgTypes,
    isCard:      { control: "boolean" },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize:    { control: "radio", options: ["xl", "lg", "md"] },
  },
} satisfies Meta<typeof TextImageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageRight: Story = {
  args: { imagePosition: "right", imageStyle: "square" },
};

export const ImageContain: Story = {
  args: {
    imagePosition: "right",
    imageStyle: "square",
    imageFit: "contain",
    imageSrc: "/images/diagram_1.avif",
    showButtons: false,
  },
};

export const ImageLeft: Story = {
  args: { imagePosition: "left", imageStyle: "square" },
};

export const RoundImageRight: Story = {
  args: { imagePosition: "right", imageStyle: "round" },
};

export const RoundImageLeft: Story = {
  args: { imagePosition: "left", imageStyle: "round" },
};

export const StackLeft: Story = {
  args: {
    layout: "stack-left",
    headingSize: "h2",
    bodySize: "lg",
    titleEmphasis: false,
    showButtons: false
  },
};

export const StackCentered: Story = {
  args: {
    layout: "stack-centered",
    headingSize: "h2",
    bodySize: "lg"
  },
};

export const FullImage: Story = {
  args: {
    layout: "full-image",
    headingSize: "h1",
    bodySize: "lg",
    imageSrc: "/images/peppers.jpg",
    showButtons: false,
    eyebrow: ""
  },
  argTypes: {
    isCard:        { control: false },
    titleEmphasis: { control: false },
  },
};

const threeImages = [
  {
    src: "/images/peppers.jpg",
    alt: "",
    title: "Lorem ipsum dolor",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis amet.",
    stat: "1.2M",
    label: "Lorem ipsum",
  },
  {
    src: "/images/peppers.jpg",
    alt: "",
    title: "Lorem ipsum dolor",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis amet.",
    stat: "80+",
    label: "Lorem ipsum",
  },
  {
    src: "/images/peppers.jpg",
    alt: "",
    title: "Lorem ipsum dolor",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis amet.",
    stat: "5K",
    label: "Lorem ipsum",
  },
];

export const ThreeImageCaption: Story = {
  args: {
    layout: "three-image-caption",
    headingSize: "h2",
    bodySize: "lg",
    images: threeImages,
  },
};

export const ThreeImageStat: Story = {
  args: {
    layout: "three-image-stat",
    headingSize: "h2",
    bodySize: "lg",
    images: threeImages,
  },
};

const fourImages = [
  ...threeImages,
  {
    src: "/images/peppers.jpg",
    alt: "",
    title: "Lorem ipsum dolor",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis amet.",
    stat: "2.3K",
    label: "Lorem ipsum",
  },
];

export const FourImageCaption: Story = {
  args: {
    layout: "four-image-caption",
    headingSize: "h2",
    bodySize: "lg",
    images: fourImages,
  },
};

export const FourImageStat: Story = {
  args: {
    layout: "four-image-stat",
    headingSize: "h2",
    bodySize: "lg",
    images: fourImages,
  },
};
