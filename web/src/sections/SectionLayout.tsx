import { cn } from "@/lib/cn";
import type { SectionCardColor, SectionLayoutType, SectionTheme } from "@/lib/types";
import type { ReactNode } from "react";
import {
  coerceSectionCardColor,
  getSectionCardClassName,
  getSectionCardDataAttributes,
  getSectionCardInteriorTheme,
  SECTION_CARD_SHELL_CLASS,
} from "./sectionCardConfig";

export interface SectionLayoutProps {
  layout?: SectionLayoutType;
  /** Wraps content in the rounded green card treatment from Figma */
  isCard?: boolean;
  /** Card fill — only used when `isCard` is true */
  cardColor?: SectionCardColor;
  /** Section theme — used to resolve surface and available card colors */
  sectionTheme?: SectionTheme;
  /** Left column (horizontal) or top block (vertical) — eyebrow, heading, body, CTAs */
  textSlot?: ReactNode;
  /** Right column (horizontal) or bottom block (vertical) — stats, image, media, etc. */
  contentSlot?: ReactNode;
  /** Swap text and content order — content appears left/first */
  reverse?: boolean;
  /** Vertical layout — center text and content */
  centered?: boolean;
  /** Vertical layout — wrapper class for the text slot (default max-w-[60%]) */
  textSlotClassName?: string;
  /** Vertical layout — gap between text and content slots */
  verticalGapClassName?: string;
  className?: string;
}

export function SectionLayout({
  layout = "vertical",
  isCard = false,
  cardColor = "surface",
  sectionTheme = "light",
  textSlot,
  contentSlot,
  reverse = false,
  centered = false,
  textSlotClassName = "w-full lg:max-w-[60%]",
  verticalGapClassName = "gap-10 lg:gap-16",
  className,
}: SectionLayoutProps) {
  const isHorizontal = layout === "horizontal";

  const inner = isHorizontal ? (
    <div
      className={cn(
        "grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16",
        reverse && "lg:[&>*:last-child]:order-first",
      )}
    >
      <div>{textSlot}</div>
      <div>{contentSlot}</div>
    </div>
  ) : (
    <div className={cn("flex flex-col", verticalGapClassName, centered && "items-center")}>
      {textSlot && (
        <div className={cn(centered && "min-w-0", textSlotClassName)}>{textSlot}</div>
      )}
      {contentSlot && <div className="w-full min-w-0">{contentSlot}</div>}
    </div>
  );

  if (isCard) {
    const resolvedColor = coerceSectionCardColor(sectionTheme, cardColor);
    const interiorTheme = getSectionCardInteriorTheme(resolvedColor, sectionTheme);

    return (
      <div
        data-section-card
        data-theme={interiorTheme}
        {...getSectionCardDataAttributes(resolvedColor)}
        className={cn(
          SECTION_CARD_SHELL_CLASS,
          getSectionCardClassName(resolvedColor),
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  return <div className={cn(className)}>{inner}</div>;
}

export default SectionLayout;
