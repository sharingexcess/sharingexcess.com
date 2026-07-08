import { Button } from "@/components/ui/Button";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";
import { Sticker, type StickerName } from "@/components/ui/Sticker";
import { Text } from "@/components/ui/Text";
import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { HeroLayout, SectionContentProps } from "@/lib/types";
import { useRef, type CSSProperties } from "react";
import { SectionShell } from "./SectionShell";
import { sectionCardContentIsDark } from "./sectionCardConfig";

/** Figma hero sticker — 150px on 1320px content, ~196px from right edge */
const HERO_STICKER_SIZE = "size-[clamp(100px,11.36vw,150px)]";
const HERO_STICKER_POSITION =
  "pointer-events-none absolute top-0 right-[clamp(40px,14.85%,196px)] z-10 -translate-y-1/2";

export interface HeroSectionProps extends SectionContentProps {
  layout?: HeroLayout;
  /** Photo credit or caption overlaid on subpage hero images */
  imageCaption?: string;
  /** Overlap a brand sticker on the hero image (stack layouts). */
  sticker?: boolean;
  /** Which sticker to show when `sticker` is true. Defaults to `free-food`. */
  stickerName?: StickerName;
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
  home: "font-medium max-lg:hyphens-none max-lg:break-normal max-lg:text-[clamp(3rem,14vw,3.75rem)] max-lg:leading-[1.06] max-lg:tracking-[-0.04em] lg:text-[clamp(64px,7.94cqw,120px)] lg:leading-none lg:tracking-[-0.05em]",
  h1: "text-[clamp(48px,6.35cqw,96px)] font-medium leading-[1.06] tracking-[-0.04em]",
  h2: "text-[clamp(40px,4.76cqw,72px)] font-medium leading-[1.06] tracking-[-0.04em]",
};

const heroGradient =
  "bg-gradient-to-t from-[rgba(27,27,21,0.36)] from-50% to-transparent to-[96.35%] mix-blend-multiply";

function heroHeadingTag(level: 1 | 2 | 3): "h1" | "h2" | "h3" {
  return level === 1 ? "h1" : level === 2 ? "h2" : "h3";
}

const heroHomeBodyClasses = {
  xl: "text-sm leading-[1.4] lg:text-[20px]",
  lg: "text-sm leading-[1.4] lg:text-[18px]",
  md: "text-sm leading-[1.4] lg:text-base",
};

function HeroHomeContent({
  title,
  body,
  bodySize = "xl",
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  constrainWidth = true,
  className,
}: Pick<
  HeroSectionProps,
  | "title"
  | "body"
  | "bodySize"
  | "primaryCta"
  | "primaryCtaHref"
  | "secondaryCta"
  | "secondaryCtaHref"
  | "className"
> & {
  /** Figma full-width home text block is 915px; rounded home uses full strip width */
  constrainWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-[clamp(24px,2.65cqw,40px)]",
        constrainWidth && "max-w-[min(915px,60.55cqw)]",
        className,
      )}
    >
      <AnimatedHeroHeading
        title={title}
        as="h1"
        multiline
        className={cn("w-full text-white", heroHeadingClasses.home)}
      />
      {body && (
        <p className={cn(heroHomeBodyClasses[bodySize], "text-white")}>{body}</p>
      )}
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
  caption,
  sticker,
  stickerName = "free-food",
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  sticker?: boolean;
  stickerName?: StickerName;
  className?: string;
}) {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <div className={cn("relative w-full", className)}>
      <figure
        ref={scrollRef}
        className={cn(
          "relative w-full overflow-hidden rounded-[52px]",
          "h-[80vh]",
        )}
      >
        <ParallaxBackground scrollRef={scrollRef} src={src} alt={alt} />
        {caption && (
          <>
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-1/3",
                heroGradient,
              )}
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-[clamp(24px,4.23cqw,64px)]">
              <p className="text-sm leading-[1.4] text-white">{caption}</p>
            </figcaption>
          </>
        )}
      </figure>
      {sticker && (
        <div
          className={cn(HERO_STICKER_POSITION, HERO_STICKER_SIZE)}
          aria-hidden
        >
          <Sticker name={stickerName} fillContainer alt="" />
        </div>
      )}
    </div>
  );
}

function HomeFullWidthHero({
  id,
  imageSrc,
  imageAlt,
  title,
  body,
  bodySize,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  className,
}: {
  id?: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  body?: string;
  bodySize?: HeroSectionProps["bodySize"];
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-home-hero
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
            body={body}
            bodySize={bodySize}
            primaryCta={primaryCta}
            primaryCtaHref={primaryCtaHref}
            secondaryCta={secondaryCta}
            secondaryCtaHref={secondaryCtaHref}
            constrainWidth={false}
            className="w-full max-w-[min(915px,60.55cqw)] max-lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}

function HomeRoundedHero({
  id,
  imageSrc,
  imageAlt,
  title,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  className,
}: {
  id?: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  className?: string;
}) {
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
  imageCaption,
  sticker = false,
  stickerName = "free-food",
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  className,
  id,
  flushTop = false,
  flushBottom = false,
  transparentBg = false,
}: HeroSectionProps) {
  const resolvedLayout: HeroLayout = layout ?? (imageSrc ? "stack-left" : "text");

  const subpageShellClass =
    "pb-[48px] pt-[100px] lg:pb-[120px] lg:pt-[140px]";
  const stackShellClass = cn(
    "px-0 py-0",
    subpageShellClass,
    flushBottom && "pb-0 lg:pb-0",
    sticker && "overflow-visible",
    className,
  );

  if (resolvedLayout === "text") {
    const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
    return (
      <SectionShell
        theme={isCard ? "light" : theme}
        className={cn(
          "pb-12 pt-[calc(var(--site-header-height)+3rem)] lg:pb-[120px] lg:pt-[calc(var(--site-header-height)+7.5rem)]",
          className,
        )}
        id={id}
        flushTop={flushTop}
        flushBottom={flushBottom}
        transparentBg={transparentBg}
      >
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
        className={stackShellClass}
        contentClassName={cn(FIGMA_CONTENT_CLASS, FIGMA_INNER_PADDING)}
        id={id}
        flushTop={flushTop}
        flushBottom={flushBottom}
        transparentBg={transparentBg}
      >
        <div className="flex flex-col gap-8 lg:gap-16">
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
          <SubpageHeroImage
            src={imageSrc}
            alt={imageAlt}
            caption={imageCaption}
            sticker={sticker}
            stickerName={stickerName}
          />
        </div>
      </SectionShell>
    );
  }

  if (resolvedLayout === "stack-centered") {
    return (
      <SectionShell
        theme={isCard ? "light" : theme}
        className={stackShellClass}
        contentClassName={cn(FIGMA_CONTENT_CLASS, FIGMA_INNER_PADDING)}
        id={id}
        flushTop={flushTop}
        flushBottom={flushBottom}
        transparentBg={transparentBg}
      >
        <div className="flex flex-col gap-24">
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
            align="center"
            className="w-full px-0 lg:px-[336px]"
          />
          <SubpageHeroImage
            src={imageSrc}
            alt={imageAlt}
            caption={imageCaption}
            sticker={sticker}
            stickerName={stickerName}
          />
        </div>
      </SectionShell>
    );
  }

  if (resolvedLayout === "full-width") {
    return (
      <HomeFullWidthHero
        id={id}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        title={title}
        body={body}
        bodySize={bodySize}
        primaryCta={primaryCta}
        primaryCtaHref={primaryCtaHref}
        secondaryCta={secondaryCta}
        secondaryCtaHref={secondaryCtaHref}
        className={className}
      />
    );
  }

  return (
    <HomeRoundedHero
      id={id}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      title={title}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      secondaryCta={secondaryCta}
      secondaryCtaHref={secondaryCtaHref}
      className={className}
    />
  );
}

export default HeroSection;
