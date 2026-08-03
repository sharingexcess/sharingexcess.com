import type { Meta, StoryObj } from "@storybook/react";
import { VideoTestimonialsCarouselSection } from "./VideoTestimonialsCarouselSection";
import { sectionThemeArgs, sectionThemeArgTypes } from "./sectionStoryControls";

const TESTIMONIAL_ITEMS = [
  {
    posterSrc: "/images/peppers.jpg",
    posterAlt: "",
    videoSrc: "https://www.youtube.com/shorts/-6JX7-pEVrA",
    caption: "Lorem ipsum, dolor sit",
  },
  {
    posterSrc: "/images/tomatoes.jpg",
    posterAlt: "",
    videoSrc: "https://www.youtube.com/shorts/rBza6eJcFrU",
    caption: "Amet consectetur adipiscing",
  },
  {
    posterSrc: "/images/oranges.jpg",
    posterAlt: "",
    videoSrc: "https://www.youtube.com/watch?v=L-4UTfPUinM",
    caption: "Elit sed do eiusmod",
  },
];

const meta = {
  title: "Sections/VideoTestimonials",
  component: VideoTestimonialsCarouselSection,
  parameters: { layout: "fullscreen" },
  args: {
    ...sectionThemeArgs,
    eyebrow: "Lorem ipsum",
    title: "Lorem ipsum dolor sit amet *conspectus*.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    headingSize: "h2",
    items: TESTIMONIAL_ITEMS,
    defaultIndex: 0,
  },
  argTypes: {
    ...sectionThemeArgTypes,
    headingSize: { control: "radio", options: ["h1", "h2"] },
    defaultIndex: { control: { type: "number", min: 0, max: 2 } },
  },
} satisfies Meta<typeof VideoTestimonialsCarouselSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dark: Story = {
  args: {
    theme: "dark",
  },
};
