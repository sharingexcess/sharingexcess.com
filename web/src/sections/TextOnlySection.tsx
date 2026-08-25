import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { SectionContentProps, SectionLayoutType } from "@/lib/types";
import { SectionLayout } from "./SectionLayout";
import { SectionShell } from "./SectionShell";
import { sectionCardContentIsDark } from "./sectionCardConfig";

export interface TextOnlySectionProps extends SectionContentProps {
  align?: "left" | "center";
  layout?: SectionLayoutType;
  /** Bold emphasis line below body — e.g. a footnote */
  bodyEmphasis?: string;
  bodyEmphasisSize?: "xl" | "lg" | "md";
  /** Optional full-bleed background image behind the section */
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
  id?: string;
}

export function TextOnlySection({
  theme = "light",
  isCard = false,
  cardColor = "surface",
  eyebrow,
  title,
  headingSize = "h1",
  body,
  bodyEmphasis,
  bodyEmphasisSize,
  bodySize = "xl",
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  align = "left",
  layout = "vertical",
  backgroundImageSrc,
  backgroundImageAlt = "",
  className,
  id,
}: TextOnlySectionProps) {
  const isCentered = align === "center";
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);

  const textBlock = (
    <TextSection
      eyebrow={eyebrow}
      heading={title}
      headingSize={headingSize}
      body={body}
      bodyEmphasis={bodyEmphasis}
      bodyEmphasisSize={bodyEmphasisSize}
      bodySize={bodySize}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      secondaryCta={secondaryCta}
      secondaryCtaHref={secondaryCtaHref}
      buttonScheme={isDark ? "dark" : "light"}
      layout={layout}
      align={align}
      emphasis={!isCard}
      isCard={isCard}
      className={cn(isCentered && "mx-auto max-w-3xl")}
    />
  );

  if (backgroundImageSrc) {
    return (
      <section
        id={id}
        data-theme={theme}
        className={cn("relative overflow-hidden px-6 py-12 lg:px-24 lg:py-[120px]", className)}
      >
        <img
          src={backgroundImageSrc}
          alt={backgroundImageAlt}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="relative mx-auto max-w-6xl">{textBlock}</div>
      </section>
    );
  }

  return (
    <SectionShell theme={theme} className={className} id={id}>
      <SectionLayout
        layout={layout}
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        centered={isCentered}
        textSlotClassName={
          isCentered
            ? isCard
              ? "w-full"
              : "w-full max-w-3xl"
            : cn("w-full", !isCard && "max-w-[915px]")
        }
        textSlot={textBlock}
      />
    </SectionShell>
  );
}

export default TextOnlySection;
