import { Button } from "@/components/ui/Button";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { Text } from "@/components/ui/Text";
import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { HeroLayout, SectionContentProps } from "@/lib/types";
import type { CSSProperties } from "react";
import { SectionShell } from "./SectionShell";
import { sectionCardContentIsDark } from "./sectionCardConfig";

export interface HeroSectionProps extends SectionContentProps {
  layout?: HeroLayout;
  id?: string;
}

/** Figma MacBook Pro 14" artboard (1512×982) — cqw clamps need `@container` parent */
const FIGMA_ARTBOARD_CLASS = "@container mx-auto w-full max-w-[1512px]";
const FIGMA_CONTENT_CLASS = "max-w-[1512px]";
/** Figma space/7xl — equal padding on all sides of hero text containers */
const FIGMA_PADDING = "p-[clamp(24px,6.35cqw,96px)]";
const FIGMA_INNER_PADDING = "px-[clamp(24px,6.35cqw,96px)]";
const HERO_HEIGHT = "h-[100vh]";

const heroHeadingLevel: Record<"h1" | "h2", 1 | 2 | 3> = { h1: 2, h2: 3 };

const heroHeadingClasses = {
  home: "text-[clamp(64px,7.94cqw,120px)] font-medium leading-none tracking-[-0.05em]",
  h1: "text-[clamp(48px,6.35cqw,96px)] font-medium leading-[1.06] tracking-[-0.04em]",
  h2: "text-[clamp(40px,4.76cqw,72px)] font-medium leading-[1.06] tracking-[-0.04em]",
};

const heroGradient =
  "bg-gradient-to-t from-[rgba(27,27,21,0.36)] from-50% to-transparent to-[96.35%] mix-blend-multiply";

function heroHeadingTag(level: 1 | 2 | 3): "h1" | "h2" | "h3" {
  return level === 1 ? "h1" : level === 2 ? "h2" : "h3";
}

function HeroHomeContent({
  title,
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  constrainWidth = true,
  className,
}: Pick<
  HeroSectionProps,
  "title" | "primaryCta" | "primaryCtaHref" | "secondaryCta" | "secondaryCtaHref" | "className"
> & {
  /** Figma full-width home text block is 915px; rounded home uses full strip width */
  constrainWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[clamp(24px,2.65cqw,40px)]",
        constrainWidth && "max-w-[min(915px,60.55cqw)]",
        className,
      )}
    >
      <AnimatedHeroHeading
        title={title}
        as="h1"
        multiline
        className={cn("text-white", heroHeadingClasses.home)}
      />
      {(primaryCta || secondaryCta) && (
        <div className="flex flex-wrap gap-4">
          {primaryCta && (
            <Button variant="primary" href={primaryCtaHref}>
              {primaryCta}
            </Button>
          )}
          {secondaryCta && (
            <Button variant="ghost" href={secondaryCtaHref}>
              {secondaryCta}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SubpageHeroImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[52px]",
        HERO_HEIGHT,
        className,
      )}
    >
      <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
    </div>
  );
}

export function HeroSection({
  layout,
  theme = "dark",
  isCard = false,
  cardColor = "surface",
  eyebrow,
  title,
  headingSize = "h1",
  body,
  bodySize = "md",
  imageSrc,
  imageAlt = "",
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  className,
  id,
}: HeroSectionProps) {
  const resolvedLayout: HeroLayout = layout ?? (imageSrc ? "stack-left" : "text");

  const subpageShellClass =
    "pb-[120px] pt-[140px] lg:pb-[120px] lg:pt-[140px]";

  if (resolvedLayout === "text") {
    const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
    return (
      <SectionShell theme={isCard ? "light" : theme} className={className} id={id}>
        <div className="flex flex-col gap-8">
          <AnimatedHeroHeading
            title={title}
            as={heroHeadingTag(heroHeadingLevel[headingSize])}
            emphasis={!isCard}
            className={cn("text-kale", heroHeadingClasses[headingSize])}
          />
          {body && (
            <Text size="xl" className="max-w-2xl">
              {body}
            </Text>
          )}
          {primaryCta && (
            <div>
              <Button
                href={primaryCtaHref}
                variant="primary"
                colorScheme={isDark ? "dark" : "light"}
              >
                {primaryCta}
              </Button>
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  if (!imageSrc) {
    throw new Error(`HeroSection layout "${resolvedLayout}" requires imageSrc`);
  }

  if (resolvedLayout === "stack-left") {
    return (
      <SectionShell
        theme={isCard ? "light" : theme}
        className={cn("px-0 py-0", subpageShellClass, className)}
        contentClassName={cn(FIGMA_CONTENT_CLASS, FIGMA_INNER_PADDING)}
        id={id}
      >
        <div className="flex flex-col gap-16">
          <TextSection
            eyebrow={eyebrow}
            heading={title}
            headingSize={headingSize}
            animateHeading
            emphasis={!isCard}
            isCard={isCard}
            body={body}
            bodySize={bodySize}
            primaryCta={primaryCta}
            primaryCtaHref={primaryCtaHref}
            secondaryCta={secondaryCta}
            secondaryCtaHref={secondaryCtaHref}
            buttonScheme={sectionCardContentIsDark(isCard, cardColor, theme) ? "dark" : "light"}
            className="w-full lg:pr-[328px]"
          />
          <SubpageHeroImage src={imageSrc} alt={imageAlt} />
        </div>
      </SectionShell>
    );
  }

  if (resolvedLayout === "stack-centered") {
    return (
      <SectionShell
        theme={isCard ? "light" : theme}
        className={cn("px-0 py-0", subpageShellClass, className)}
        contentClassName={cn(FIGMA_CONTENT_CLASS, FIGMA_INNER_PADDING)}
        id={id}
      >
        <div className="flex flex-col gap-24">
          <TextSection
            heading={title}
            headingSize={headingSize}
            animateHeading
            emphasis={!isCard}
            isCard={isCard}
            body={body}
            bodySize={bodySize}
            primaryCta={primaryCta}
            primaryCtaHref={primaryCtaHref}
            secondaryCta={secondaryCta}
            secondaryCtaHref={secondaryCtaHref}
            buttonScheme={sectionCardContentIsDark(isCard, cardColor, theme) ? "dark" : "light"}
            align="center"
            className="w-full px-0 lg:px-[336px]"
          />
          <SubpageHeroImage src={imageSrc} alt={imageAlt} />
        </div>
      </SectionShell>
    );
  }

  if (resolvedLayout === "full-width") {
    return (
      <section
        id={id}
        data-theme="dark"
        style={{ "--section-emphasis": "var(--color-neutral-000)" } as CSSProperties}
        className={cn("relative overflow-hidden", HERO_HEIGHT, className)}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", heroGradient)}
        />
        <div className="absolute inset-0 flex">
          <div
            className={cn(
              FIGMA_ARTBOARD_CLASS,
              FIGMA_PADDING,
              "flex h-full w-full flex-col items-start justify-end",
            )}
          >
            <HeroHomeContent
              title={title}
              primaryCta={primaryCta}
              primaryCtaHref={primaryCtaHref}
              secondaryCta={secondaryCta}
              secondaryCtaHref={secondaryCtaHref}
              constrainWidth={false}
              className="w-full max-w-[min(915px,60.55cqw)]"
            />
          </div>
        </div>
      </section>
    );
  }

  // rounded — inner card 1464px (1512 − 48px shell padding); text strip is full width with 64px padding
  return (
    <section
      id={id}
      className={cn("mx-auto max-w-[1512px] bg-white p-6", className)}
    >
      <div
        className={cn(
          "@container relative overflow-hidden rounded-[var(--radius-xl)]",
          HERO_HEIGHT,
        )}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", heroGradient)}
        />
        <div className="relative flex h-full items-end">
          <div className="w-full p-[clamp(40px,4.23cqw,64px)]">
            <HeroHomeContent
              title={title}
              primaryCta={primaryCta}
              primaryCtaHref={primaryCtaHref}
              secondaryCta={secondaryCta}
              secondaryCtaHref={secondaryCtaHref}
              constrainWidth={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
