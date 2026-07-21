import { DonationForm } from "@/components/donation/DonationForm";
import { Button } from "@/components/ui/Button";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";
import { Sticker, STICKER_OVERLAP_TOP_CLASS, STICKER_SIZE_CLASS, type StickerName } from "@/components/ui/Sticker";
import { Text } from "@/components/ui/Text";
import { TextSection } from "@/components/ui/TextSection";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import type { HeroLayout, SectionContentProps } from "@/lib/types";
import {
  heroWordSpring,
  motion,
  useReducedMotion,
} from "@/lib/motion";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { SectionShell } from "./SectionShell";
import { sectionCardContentIsDark } from "./sectionCardConfig";

export interface HeroSectionProps extends SectionContentProps {
  layout?: HeroLayout;
  /** Photo credit or caption overlaid on subpage hero images */
  imageCaption?: string;
  /** Overlap a brand sticker on the hero image (stack layouts). */
  sticker?: boolean;
  /** Which sticker to show when `sticker` is true. Defaults to `free-food`. */
  stickerName?: StickerName;
  /** @deprecated Hero donate form uses Give Now / Give Monthly — kept for Storybook controls */
  submitLabel?: string;
  /** Sticky scroll-driven fade on the home donate hero — disable for in-page donate sections */
  pinOnScroll?: boolean;
  id?: string;
}

/** Figma MacBook Pro 14" artboard (1512×982) — cqw clamps need `@container` parent */
const FIGMA_ARTBOARD_CLASS = "@container mx-auto w-full max-w-[1512px]";
const FIGMA_CONTENT_CLASS = "max-w-[1512px]";
/** Figma space/7xl — equal padding on all sides of hero text containers */
const FIGMA_PADDING = "p-[clamp(24px,6.35cqw,96px)]";
/** Tighter inset for full-bleed home hero text */
const HOME_HERO_PADDING =
  "px-[clamp(12px,2.12cqw,24px)] pb-[clamp(16px,4.23cqw,56px)] pt-[clamp(12px,2.12cqw,24px)]";
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

/** Full-width home hero fades — inline gradients so they always paint */
const HOME_HERO_BOTTOM_GRADIENT =
  "linear-gradient(to top, rgba(27,27,21,0.88) 0%, rgba(27,27,21,0.62) 35%, rgba(27,27,21,0.28) 65%, transparent 100%)";
const HOME_HERO_TOP_GRADIENT =
  "linear-gradient(to bottom, rgba(27,27,21,0.32) 0%, rgba(27,27,21,0.12) 45%, transparent 100%)";
const HOME_HERO_GRADIENT_HEIGHT = "h-[clamp(260px,48vh,420px)]";
const HOME_HERO_DONATE_GRADIENT_HEIGHT = "h-[clamp(280px,55vh,520px)]";
const HOME_HERO_TOP_GRADIENT_HEIGHT = "h-[clamp(120px,20vh,200px)]";

function HomeHeroGradients({
  bottomHeightClass = HOME_HERO_GRADIENT_HEIGHT,
  showTopGradient = false,
}: {
  bottomHeightClass?: string;
  showTopGradient?: boolean;
}) {
  return (
    <>
      {showTopGradient && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-[1]",
            HOME_HERO_TOP_GRADIENT_HEIGHT,
          )}
          style={{ backgroundImage: HOME_HERO_TOP_GRADIENT }}
        />
      )}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[1]",
          bottomHeightClass,
        )}
        style={{ backgroundImage: HOME_HERO_BOTTOM_GRADIENT }}
      />
    </>
  );
}

function heroHeadingTag(level: 1 | 2 | 3): "h1" | "h2" | "h3" {
  return level === 1 ? "h1" : level === 2 ? "h2" : "h3";
}

const heroHomeBodyClasses = {
  xl: "text-base leading-[1.4] lg:text-[clamp(18px,1.59cqw,24px)]",
  lg: "text-sm leading-[1.4] lg:text-[20px]",
  md: "text-sm leading-[1.4] lg:text-lg",
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
  showButtons = true,
  headingAs = "h1",
  headingClassName,
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
  showButtons?: boolean;
  headingAs?: "h1" | "h2";
  headingClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [bodyVisible, setBodyVisible] = useState(reduceMotion);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-[clamp(16px,1.59cqw,24px)]",
        constrainWidth && "max-w-[min(915px,60.55cqw)]",
        className,
      )}
    >
      <AnimatedHeroHeading
        title={title}
        as={headingAs}
        multiline
        onRevealComplete={() => setBodyVisible(true)}
        className={cn("w-full text-white", headingClassName ?? heroHeadingClasses.home)}
      />
      {body &&
        (reduceMotion ? (
          <p
            className={cn(
              heroHomeBodyClasses[bodySize],
              "whitespace-pre-line text-white",
            )}
          >
            {body}
          </p>
        ) : (
          <motion.p
            initial="hidden"
            animate={bodyVisible ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            className={cn(heroHomeBodyClasses[bodySize], "text-white")}
          >
            {body.split("\n").map((line, lineIndex) => (
              <motion.span
                key={lineIndex}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: heroWordSpring,
                  },
                }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </motion.p>
        ))}
      {showButtons && (primaryCta || secondaryCta) &&
        (reduceMotion ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={bodyVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={heroWordSpring}
            className="flex flex-wrap gap-4"
          >
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
          </motion.div>
        ))}
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
          className={cn(STICKER_OVERLAP_TOP_CLASS, STICKER_SIZE_CLASS)}
          aria-hidden
        >
          <Sticker name={stickerName} fillContainer alt="" />
        </div>
      )}
    </div>
  );
}

const heroCoverClass = "absolute inset-0 size-full object-cover";

function HomeHeroBackground({
  imageSrc,
  imageAlt,
  videoSrc,
}: {
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
}) {
  return videoSrc ? (
    <div className="absolute inset-0 z-0">
      <img src={imageSrc} alt="" aria-hidden className={heroCoverClass} />
      <video autoPlay loop muted playsInline aria-hidden className={heroCoverClass}>
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  ) : (
    <img src={imageSrc} alt={imageAlt} className={cn(heroCoverClass, "z-0")} />
  );
}

function HomeFullWidthHero({
  id,
  imageSrc,
  imageAlt,
  videoSrc,
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
  videoSrc?: string;
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
      <HomeHeroBackground imageSrc={imageSrc} imageAlt={imageAlt} videoSrc={videoSrc} />
      <HomeHeroGradients />
      <div className="absolute inset-0 z-[2] flex">
        <div
          className={cn(
            FIGMA_ARTBOARD_CLASS,
            HOME_HERO_PADDING,
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

/** rAF-batched scroll progress → CSS var (avoids Framer Motion per-frame work) */
function useHomeHeroDonateScrollCssVar(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduceMotion) return;

    let raf = 0;

    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = sectionRef.current;
        if (!el) return;

        const scrollY = lenis?.scroll ?? window.scrollY;
        const viewport = window.innerHeight || 1;
        el.style.setProperty(
          "--hero-scroll",
          String(Math.max(0, Math.min(1, scrollY / viewport))),
        );
      });
    };

    update();

    if (lenis) {
      lenis.on("scroll", update);
      return () => {
        lenis.off("scroll", update);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, lenis, reduceMotion, sectionRef]);
}

function HomeFullWidthHeroWithDonate({
  id,
  imageSrc,
  imageAlt,
  videoSrc,
  title,
  body,
  bodySize,
  pinOnScroll = true,
  className,
}: {
  id?: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  title: string;
  body?: string;
  bodySize?: HeroSectionProps["bodySize"];
  pinOnScroll?: boolean;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const scrollFx = pinOnScroll && !reduceMotion;
  useHomeHeroDonateScrollCssVar(sectionRef, scrollFx);

  const donateContent = (
    <div
      className={cn(
        FIGMA_ARTBOARD_CLASS,
        HOME_HERO_PADDING,
        "flex w-full flex-col items-start gap-8 pb-[clamp(16px,4.23cqw,56px)] lg:flex-row lg:items-end lg:justify-between lg:gap-16",
      )}
    >
      <HeroHomeContent
        title={title}
        body={body}
        bodySize={bodySize}
        showButtons={false}
        headingAs="h2"
        headingClassName={heroHeadingClasses.h2}
        constrainWidth={false}
        className="w-full max-w-[min(915px,60.55cqw)] max-lg:max-w-none lg:w-auto lg:shrink-0"
      />
      <div className="w-full min-w-0 max-w-[480px] shrink-0 self-stretch">
        <DonationForm
          variant="hero"
          sectionTheme="dark"
          className="shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
        />
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      data-home-hero
      data-theme="dark"
      style={{ "--section-emphasis": "var(--color-neutral-000)" } as CSSProperties}
      className={cn(
        pinOnScroll
          ? "home-hero-donate sticky top-0 z-0 h-screen overflow-hidden"
          : cn("relative overflow-hidden", HERO_HEIGHT),
        scrollFx && "home-hero-donate--scroll-fx",
        className,
      )}
    >
      {scrollFx ? (
        <div className="home-hero-donate__bg-wrap absolute inset-0 z-0" aria-hidden>
          <HomeHeroBackground
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            videoSrc={videoSrc}
          />
        </div>
      ) : (
        <HomeHeroBackground
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          videoSrc={videoSrc}
        />
      )}
      <HomeHeroGradients
        bottomHeightClass={HOME_HERO_DONATE_GRADIENT_HEIGHT}
        showTopGradient
      />
      <div
        className={cn(
          "relative z-[2] flex h-full flex-col justify-end",
          scrollFx && "home-hero-donate__content",
        )}
      >
        {donateContent}
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
  videoSrc,
  imageCaption,
  sticker = false,
  stickerName = "free-food",
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  submitLabel = "Donate Now",
  pinOnScroll = true,
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
        theme={theme}
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
        theme={theme}
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
        theme={theme}
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
        videoSrc={videoSrc}
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

  if (resolvedLayout === "full-width-donate") {
    return (
      <HomeFullWidthHeroWithDonate
        id={id}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        videoSrc={videoSrc}
        title={title}
        body={body}
        bodySize={bodySize}
        pinOnScroll={pinOnScroll}
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
