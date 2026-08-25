import type { ReactNode } from "react";

export type SectionTheme = "light" | "dark";
export type SectionLayoutType = "vertical" | "horizontal";

export type FormSectionVariant =
  | "brand-green"
  | "brand-green-glass"
  | "kale-glass"
  | "dark-green"
  | "white"
  | "yellow"
  | "orange"
  /** @deprecated use "kale-glass" */
  | "kale"
  /** @deprecated use "white" */
  | "light-green"
  /** @deprecated use "kale-glass" */
  | "glass"
  /** @deprecated use "yellow" */
  | "banana"
  /** @deprecated use "orange" */
  | "tangerine";

export type FormSectionLayout =
  | "horizontal-card"
  | "vertical-card"
  | "horizontal"
  | "vertical";

export type ImagePosition = "left" | "right";
export type ImageStyle = "square" | "round" | "video";
/** "cover" crops into a square frame (photos). "contain" preserves natural aspect ratio (diagrams, logos). */
export type ImageFit = "cover" | "contain";

export interface SectionProps {
  theme?: SectionTheme;
  id?: string;
  className?: string;
  children?: ReactNode;
  /** Drop top padding when the previous section already provides the gap. */
  flushTop?: boolean;
  /** Drop bottom padding before a full-bleed section or same-theme follower. */
  flushBottom?: boolean;
  /** Let a parent handoff layer supply the section background (scroll fade). */
  transparentBg?: boolean;
}

/** Card fill when `isCard` is true — options depend on section theme (see sectionCardConfig). */
export type SectionCardColor =
  | "surface"
  | "brand-green"
  | "kale"
  | "tangerine"
  | "banana";

/** Shared content props for text-forward sections (Hero, Text + Image, Stats, etc.) */
export interface SectionContentProps {
  theme?: SectionTheme;
  isCard?: boolean;
  /** Only applies when `isCard` is true */
  cardColor?: SectionCardColor;
  eyebrow?: string;
  title: string;
  headingSize?: "h1" | "h2";
  body?: string;
  bodySize?: "xl" | "lg" | "md";
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Autoplaying background video for full-bleed home heroes; `imageSrc` serves as poster */
  videoSrc?: string;
  id?: string;
  className?: string;
  flushTop?: boolean;
  flushBottom?: boolean;
  transparentBg?: boolean;
}

export type HeroLayout =
  | "full-width"
  /** Full-bleed home hero with embedded donation form */
  | "full-width-donate"
  | "rounded"
  /** Rounded home hero with embedded donation form and scroll fade */
  | "rounded-donate"
  | "stack-left"
  | "stack-centered"
  /** Centered subpage hero with donation form overlapping the image bottom */
  | "stack-centered-donate"
  /** Text-only placeholder during migration — no image */
  | "text";
