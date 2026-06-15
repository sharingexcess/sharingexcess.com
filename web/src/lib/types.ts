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
export type ImageStyle = "square" | "round";

export interface SectionProps {
  theme?: SectionTheme;
  id?: string;
  className?: string;
  children?: ReactNode;
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
  className?: string;
}

export type HeroLayout =
  | "full-width"
  | "rounded"
  | "stack-left"
  | "stack-centered"
  /** Text-only placeholder during migration — no image */
  | "text";
