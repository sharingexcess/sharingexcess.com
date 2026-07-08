import type { Meta, StoryObj } from "@storybook/react";
import {
  DEFAULT_FOOTER_BADGES,
  DEFAULT_FOOTER_NAV_SECTIONS,
  SiteFooter,
} from "./SiteFooter";

// Figma badge assets (Charity Navigator + Candid Platinum)
const BADGE_CHARITY_NAV = "https://www.figma.com/api/mcp/asset/dcef9994-38bc-4c98-a849-b3d1f3ada103";
const BADGE_CANDID      = "https://www.figma.com/api/mcp/asset/70923e88-d7f8-4b44-8404-332ae6e1e5ad";

const meta = {
  title: "Layout/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading:     "Lorem ipsum?",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    ctaLabel:    "Contact Us",
    ctaHref:     "/contact",
    navSections: DEFAULT_FOOTER_NAV_SECTIONS,
    badges: [
      { src: BADGE_CHARITY_NAV, alt: "Charity Navigator 4-star rating" },
      { src: BADGE_CANDID,      alt: "Candid Platinum Transparency 2026" },
    ],
  },
};

/** Site default placeholders — matches Astro pages before real content is wired. */
export const Placeholders: Story = {
  args: {
    navSections: DEFAULT_FOOTER_NAV_SECTIONS,
    badges: DEFAULT_FOOTER_BADGES,
  },
};
