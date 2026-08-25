import type { Meta, StoryObj } from "@storybook/react";
import { StackingCardsSection, type StackingCardItem } from "./StackingCardsSection";
import { sectionThemeArgs, sectionThemeArgTypes } from "./sectionStoryControls";

const HOMEPAGE_ITEMS: StackingCardItem[] = [
  {
    title: "It's free.",
    body: "Every pound we deliver is donated. Dollars fund trucks, not food.",
    imageSrc: "/images/handoff.jpg",
    imageAlt: "SE volunteer handing boxes of food to a community member",
    primaryCta: "Our Financials",
    primaryCtaHref: "/about/financials",
  },
  {
    title: "It's fast.",
    body: "Rescued and delivered while it's still fresh, often same-day.",
    imageSrc: "/images/truck-driver.jpg",
    imageAlt: "SE truck driver ready for a food rescue run",
    primaryCta: "Our Model",
    primaryCtaHref: "/about",
  },
  {
    title: "It's measurable.",
    body: "Every pound moves through [Surplus](https://surplus.sharingexcess.com), our platform for tracking food from pickup to delivery.",
    imageSrc: "/images/its-measurable.png",
    imageSrcMobile: "/images/its-measurable-mobile.png",
    imageAlt: "Surplus impact dashboard showing food rescue data",
    primaryCta: "Our Impact",
    primaryCtaHref: "/about/impact",
  },
  {
    title: "It's everywhere.",
    body: "2,000+ distribution sites across 36 states.",
    imageSrc: "/images/Jul2026-ImpactMap.png",
    imageAlt: "Map showing Sharing Excess distribution sites across the US",
    primaryCta: "Our Impact",
    primaryCtaHref: "/about/impact",
  },
];

const LOREM_ITEMS: StackingCardItem[] = [
  {
    title: "Lorem ipsum.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    imageSrc: "/images/peppers.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    primaryCtaHref: "#",
  },
  {
    title: "Dolor sit.",
    body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    imageSrc: "/images/tomatoes.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    primaryCtaHref: "#",
  },
  {
    title: "Amet consectetur.",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    imageSrc: "/images/oranges.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    primaryCtaHref: "#",
  },
  {
    title: "Adipiscing elit.",
    body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/mangoes-2.jpg",
    imageAlt: "",
    primaryCta: "Primary CTA",
    primaryCtaHref: "#",
  },
];

const meta = {
  title: "Sections/StackingCards",
  component: StackingCardsSection,
  parameters: { layout: "fullscreen" },
  args: {
    ...sectionThemeArgs,
    transparentBg: false,
    exitScrollVh: 50,
    heading: "*Lorem ipsum* dolor sit amet.",
    intro: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    items: LOREM_ITEMS,
  },
  argTypes: {
    ...sectionThemeArgTypes,
    items: { control: false },
    scrollStepVh: { control: { type: "number", min: 50, max: 200, step: 10 } },
    exitScrollVh: { control: { type: "number", min: 0, max: 150, step: 10 } },
    transparentBg: { control: "boolean" },
  },
} satisfies Meta<typeof StackingCardsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Former homepage section — scroll to advance through each card. */
export const WhyItWorks: Story = {
  args: {
    theme: "light",
    transparentBg: true,
    heading: "*Food rescue* creates access to excess.",
    intro:
      "We built a network of 2,200+ partners to move fresh, healthy food where it's needed most. Here's why it works.",
    items: HOMEPAGE_ITEMS,
  },
};

export const Default: Story = {};
