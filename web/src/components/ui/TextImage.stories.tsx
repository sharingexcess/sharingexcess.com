import type { Meta, StoryObj } from "@storybook/react";
import { TextImage, type TextImageItem } from "./TextImage";

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

const withTheme: Meta<typeof TextImage>["decorators"] = [
  (Story, { globals }) => {
    const theme = (globals.sectionTheme as "light" | "dark" | undefined) ?? "light";

    return (
      <div
        data-theme={theme}
        style={{
          padding: "48px 24px",
          background: "var(--section-bg)",
          color: "var(--section-text)",
        }}
      >
        <Story />
      </div>
    );
  },
];

const meta = {
  title: "UI/TextImage",
  component: TextImage,
  decorators: withTheme,
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Lorem ipsum",
    items: carouselItems,
    imagePosition: "left",
    defaultIndex: 1,
    autoAdvance: false,
  },
  argTypes: {
    imagePosition: { control: "radio", options: ["left", "right"] },
    autoAdvance: { control: "boolean" },
    defaultIndex: {
      control: { type: "number", min: 0, max: 3, step: 1 },
    },
  },
} satisfies Meta<typeof TextImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 989:54572 — second slide active */
export const Default: Story = {
  args: { defaultIndex: 1 },
};

export const ImageRight: Story = {
  args: { imagePosition: "right", defaultIndex: 1 },
};

/** Figma 582:579 — first slide active, stacked image transition */
export const FirstSlide: Story = {
  args: { defaultIndex: 0 },
};

/** Figma 596:740 — second slide with stacked photos */
export const SecondSlideStacked: Story = {
  args: { defaultIndex: 1 },
};

export const ThirdSlide: Story = {
  args: { defaultIndex: 2 },
};

export const WithoutCtas: Story = {
  args: {
    defaultIndex: 1,
    items: carouselItems.map(({ primaryCta, primaryCtaHref, ...item }) => item),
  },
};
