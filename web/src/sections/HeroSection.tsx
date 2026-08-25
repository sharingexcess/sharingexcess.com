import { DonationForm } from "@/components/donation/DonationForm";
import { HeroBackgroundPulses } from "@/components/ui/HeroBackgroundPulses";
import { HeroContentCard } from "@/components/ui/HeroContentCard";
import { Button } from "@/components/ui/Button";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";
import {
  Sticker,
  STICKER_OVERLAP_TOP_CENTER_EDGE_CLASS,
  STICKER_OVERLAP_TOP_CLASS,
  STICKER_SIZE_CLASS,
  type StickerName,
} from "@/components/ui/Sticker";
import { Text } from "@/components/ui/Text";
import { TextSection } from "@/components/ui/TextSection";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { parseEmphasis } from "@/lib/parseEmphasis";
import type { HeroLayout, SectionContentProps } from "@/lib/types";
import { bodyLgClassName, bodyMdClassName, bodyXlClassName, eyebrowClassName } from "@/lib/typography";
import {
  heroWordSpring,
  homeHeroRevealDelay,
  homeHeroRevealStagger,
  homeHeroVideoEnterDelay,
  homeHeroVideoEnterSpring,
  homeNavEnterCompleteDelay,
  motion,
  useReducedMotion,
} from "@/lib/motion";
import { useIntroRevealed } from "@/lib/useIntroRevealed";
import { useVideoPlayback } from "@/lib/useVideoPlayback";
import { useEffect, useRef, useState, useCallback, type CSSProperties, type ReactNode, type RefObject } from "react";
import { SectionShell } from "./SectionShell";
import { sectionCardContentIsDark, sectionMediaRadiusClass } from "./sectionCardConfig";

export interface HeroSectionProps extends SectionContentProps {
  layout?: HeroLayout;
  /** White overlay card — heading, body, and CTAs over the hero video */
  cardTitle?: string;
  cardBody?: string;
  cardBodySize?: "xl" | "lg" | "md";
  cardPrimaryCta?: string;
  cardPrimaryCtaHref?: string;
  cardSecondaryCta?: string;
  cardSecondaryCtaHref?: string;
  /** Photo credit or caption overlaid on subpage hero images */
  imageCaption?: string;
  /** Emphasized closing line below hero body copy */
  bodyEmphasis?: string;
  /** Supporting line under the stacked home hero heading (green intro band) */
  introCaption?: string;
  /** Embed hero donation form below intro caption instead of text CTAs */
  introDonationForm?: boolean;
  /** Overlap a brand sticker on the hero image (stack layouts). */
  sticker?: boolean;
  /** Which sticker to show when `sticker` is true. Defaults to `free-food`. */
  stickerName?: StickerName;
  /** CSS object-position for subpage hero image framing */
  imageObjectPosition?: string;
  /** CSS aspect-ratio for the hero image frame — avoids cropping when set */
  imageAspect?: string;
  /** @deprecated Hero donate form uses Give Now / Give Monthly — kept for Storybook controls */
  submitLabel?: string;
  /** Sticky scroll-driven fade on the home donate hero — disable for in-page donate sections */
  pinOnScroll?: boolean;
  id?: string;
}

/** Figma MacBook Pro 14" artboard (1512×982) — cqw clamps need `@container` parent */
const FIGMA_ARTBOARD_CLASS = "@container mx-auto w-full max-w-[1512px]";
/** Standard page content width — matches SiteHeader nav bar */
const STANDARD_CONTENT_CLASS = "mx-auto w-full max-w-[1320px] px-4 lg:px-8";
/** Vertical inset around intro copy — anchored toward the nav, room for heading + form */
const HOME_HERO_INTRO_BAND_CLASS =
  "box-border flex w-full flex-col items-start justify-start pt-[clamp(12px,2.5vh,32px)] pb-[clamp(32px,5vh,64px)] lg:items-center lg:pt-[clamp(16px,3vh,40px)] lg:pb-[clamp(40px,6vh,72px)]";
/** Gap between multiline hero body paragraphs */
const HOME_HERO_BODY_PARAGRAPH_GAP = "gap-3 lg:gap-4";
/** Max width for hero donate card over video */
const HOME_HERO_DONATE_FORM_MAX_WIDTH = "w-full max-w-[480px]";
/** Centered subpage hero donate form — overlaps image bottom edge */
const SUBPAGE_HERO_DONATE_FORM_MAX_WIDTH = "w-full max-w-[480px]";
/** Anchor form bottom to image bottom, then shift down 50% — half on image, half on section bg */
const SUBPAGE_HERO_DONATE_OVERLAP_CLASS =
  "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 lg:px-8 translate-y-1/2";
/** Reserve space below the image for the half of the form that sits on the section background */
const SUBPAGE_HERO_DONATE_BLEED_CLASS = "h-[clamp(200px,28vh,360px)]";
const SUBPAGE_HERO_CAPTION_CLASS =
  "flex flex-col gap-3 text-base leading-[1.4] text-white lg:gap-4 lg:text-[18px]";
/** Intro-band donate form — compact donation widget */
const HOME_HERO_INTRO_FORM_MAX_WIDTH = "w-full max-w-[400px]";
const FIGMA_CONTENT_CLASS = "max-w-[1512px]";
/** Figma space/7xl — equal padding on all sides of hero text containers */
const FIGMA_PADDING = "p-[clamp(24px,6.35cqw,96px)]";
/** Tighter inset for full-bleed home hero text */
const HOME_HERO_PADDING =
  "px-[clamp(12px,2.12cqw,24px)] pb-[clamp(16px,4.23cqw,56px)] pt-[clamp(12px,2.12cqw,24px)]";
const FIGMA_INNER_PADDING = "px-[clamp(24px,6.35cqw,96px)]";
const HERO_HEIGHT = "h-[100vh]";
/** Rounded home hero — inset card within brand-green frame */
const HOME_ROUNDED_SHELL_CLASS = "mx-auto max-w-[1512px] bg-se-green p-6";
/** Top inset positions the inner hero edge at the nav midpoint for a half overlap */
const HOME_ROUNDED_SHELL_FULL_WIDTH_CLASS =
  "w-full bg-se-green px-6 pb-6 pt-[calc(var(--site-header-height)/2)]";
const HOME_ROUNDED_INNER_CLASS =
  "@container relative overflow-hidden rounded-[var(--radius-2xl)] h-[80vh]";
const HOME_ROUNDED_DONATE_INNER_CLASS =
  "@container relative overflow-hidden rounded-[var(--radius-xl)] h-[100vh]";

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
const HOME_HERO_TOP_GRADIENT_HEIGHT = "h-[clamp(120px,20vh,200px)]";

function HomeHeroGradients({
  bottomHeightClass = HOME_HERO_GRADIENT_HEIGHT,
  showTopGradient = false,
  showBottomGradient = true,
}: {
  bottomHeightClass?: string;
  showTopGradient?: boolean;
  showBottomGradient?: boolean;
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
      {showBottomGradient && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-[1]",
            bottomHeightClass,
          )}
          style={{ backgroundImage: HOME_HERO_BOTTOM_GRADIENT }}
        />
      )}
    </>
  );
}

function heroHeadingTag(level: 1 | 2 | 3): "h1" | "h2" | "h3" {
  return level === 1 ? "h1" : level === 2 ? "h2" : "h3";
}

const heroHomeBodyClasses = {
  xl: cn(bodyXlClassName, "text-white"),
  lg: cn(bodyLgClassName, "text-white"),
  md: cn(bodyMdClassName, "text-white"),
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
          <div
            className={cn(
              "flex flex-col",
              HOME_HERO_BODY_PARAGRAPH_GAP,
              heroHomeBodyClasses[bodySize],
              "text-white",
            )}
          >
            {body.split("\n").map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate={bodyVisible ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            className={cn(
              "flex flex-col",
              HOME_HERO_BODY_PARAGRAPH_GAP,
              heroHomeBodyClasses[bodySize],
              "text-white",
            )}
          >
            {body.split("\n").map((line, lineIndex) => (
              <motion.p
                key={lineIndex}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: heroWordSpring,
                  },
                }}
              >
                {line}
              </motion.p>
            ))}
          </motion.div>
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
  stickerAlign = "right",
  objectPosition = "center",
  imageAspect,
  isCard = false,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  sticker?: boolean;
  stickerName?: StickerName;
  /** Horizontal placement when `sticker` is true. Stack-centered heroes use `center`. */
  stickerAlign?: "right" | "center";
  objectPosition?: string;
  imageAspect?: string;
  isCard?: boolean;
  className?: string;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const isTopAligned = objectPosition.startsWith("top");
  const parallaxTravel = imageAspect ? 0 : 20;
  const parallaxRestOffset = isTopAligned && !imageAspect ? parallaxTravel / 2 : 0;

  return (
    <div className={cn("relative w-full", className)}>
      <figure
        ref={scrollRef}
        style={imageAspect ? { aspectRatio: imageAspect } : undefined}
        className={cn(
          "relative w-full overflow-hidden",
          sectionMediaRadiusClass(isCard),
          !imageAspect && "h-[80vh]",
        )}
      >
        <ParallaxBackground
          scrollRef={scrollRef}
          src={src}
          alt={alt}
          objectPosition={objectPosition}
          travel={parallaxTravel}
          restOffset={parallaxRestOffset}
        />
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
              <div
                className={SUBPAGE_HERO_CAPTION_CLASS}
                style={
                  { "--section-emphasis": "var(--color-neutral-000)" } as CSSProperties
                }
              >
                {caption.split("\n").map((line, lineIndex) => (
                  <p key={lineIndex}>
                    {parseEmphasis(line, true, "paragraph")}
                  </p>
                ))}
              </div>
            </figcaption>
          </>
        )}
      </figure>
      {sticker && (
        <div
          className={cn(
            stickerAlign === "center"
              ? STICKER_OVERLAP_TOP_CENTER_EDGE_CLASS
              : STICKER_OVERLAP_TOP_CLASS,
            STICKER_SIZE_CLASS,
          )}
          aria-hidden
        >
          <Sticker name={stickerName} fillContainer alt="" />
        </div>
      )}
    </div>
  );
}

function SubpageHeroWithDonate({
  src,
  alt,
  sticker,
  stickerName = "free-food",
  submitLabel = "Donate Now",
  isCard = false,
  className,
}: {
  src: string;
  alt: string;
  sticker?: boolean;
  stickerName?: StickerName;
  submitLabel?: string;
  isCard?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative w-full">
        <SubpageHeroImage
          src={src}
          alt={alt}
          sticker={sticker}
          stickerName={stickerName}
          stickerAlign="center"
          isCard={isCard}
        />
        <div className={SUBPAGE_HERO_DONATE_OVERLAP_CLASS}>
          <div className={cn("pointer-events-auto", SUBPAGE_HERO_DONATE_FORM_MAX_WIDTH)}>
            <DonationForm
              variant="hero"
              formCard="white"
              sectionTheme="light"
              headerTitle="Just $20/month rescues enough food to feed an entire family for an entire year."
              hideMealsImpact
              submitLabel={submitLabel}
              className="shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
            />
          </div>
        </div>
      </div>
      <div aria-hidden className={SUBPAGE_HERO_DONATE_BLEED_CLASS} />
    </div>
  );
}

const heroCoverClass = "absolute inset-0 size-full object-cover";
/** Slight lift so hero footage reads brighter and more vivid under the gradient overlay */
const heroVideoFilterClass = "brightness-[1.1] saturate-[1.3]";

function HomeHeroBackground({
  imageSrc,
  imageAlt,
  videoSrc,
  scrollRef,
  playVideo = true,
}: {
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  /** When set, video/image scroll with parallax inside the hero pin */
  scrollRef?: RefObject<Element | null>;
  /** When false, the cover video stays paused (poster shows). */
  playVideo?: boolean;
}) {
  const videoRef = useVideoPlayback(playVideo);

  if (scrollRef) {
    return (
      <ParallaxBackground
        scrollRef={scrollRef}
        src={imageSrc}
        alt={imageAlt}
        videoSrc={videoSrc}
        playVideo={playVideo}
        travel={16}
        offset={["start start", "end end"]}
        smooth
        className={videoSrc ? heroVideoFilterClass : undefined}
      />
    );
  }

  return videoSrc ? (
    <div className="absolute inset-0 z-0">
      <img
        src={imageSrc}
        alt=""
        aria-hidden
        className={cn(heroCoverClass, heroVideoFilterClass)}
      />
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        aria-hidden
        className={cn(heroCoverClass, heroVideoFilterClass)}
      >
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
function measureHomeHeroScrollProgress(
  el: HTMLElement,
  viewport: number,
  scrollY: number,
): number {
  const isStacked = el.classList.contains("home-hero-donate--stacked");

  if (isStacked) {
    const scrollDepth = Math.max(0, -el.getBoundingClientRect().top);
    const range = Math.max(1, el.offsetHeight - viewport);
    return Math.max(0, Math.min(1, scrollDepth / range));
  }

  return Math.max(0, Math.min(1, scrollY / viewport));
}

/** Positions the video frame directly below the intro band (video fills remaining viewport height). */
function useHomeHeroFrameStart(
  sectionRef: RefObject<HTMLElement | null>,
  introRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    const intro = introRef.current;
    if (!section || !intro) return;

    let raf = 0;

    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const pin = section.querySelector<HTMLElement>(".home-hero-donate__pin");
        if (!pin) return;

        const frameStart = Math.max(
          0,
          intro.getBoundingClientRect().bottom - pin.getBoundingClientRect().top + 12,
        );
        section.style.setProperty("--hero-frame-start", `${frameStart}px`);
      });
    };

    const ro = new ResizeObserver(update);
    ro.observe(intro);
    ro.observe(section);
    window.addEventListener("resize", update);
    document.addEventListener("astro:after-swap", update);
    void document.fonts?.ready.then(update);
    update();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      document.removeEventListener("astro:after-swap", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, introRef, sectionRef]);
}

function useHomeHeroDonateScrollCssVar(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onScrollProgress?: (progress: number) => void,
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

        const viewport = window.innerHeight || 1;
        const scrollY = lenis?.scroll ?? window.scrollY;
        const progress = measureHomeHeroScrollProgress(el, viewport, scrollY);
        el.style.setProperty("--hero-scroll", String(progress));
        onScrollProgress?.(progress);
      });
    };

    update();

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }

    window.addEventListener("resize", update);
    document.addEventListener("astro:after-swap", update);

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      document.removeEventListener("astro:after-swap", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, lenis, onScrollProgress, reduceMotion, sectionRef]);
}

const HOME_HERO_VIDEO_ENTER = {
  initial: { opacity: 0, y: "10vh" as const },
  animate: { opacity: 1, y: 0 },
  transition: {
    ...homeHeroVideoEnterSpring,
    delay: homeHeroVideoEnterDelay,
  },
};

const HOME_STACKED_SCROLL_HEIGHT = "min-h-[240vh]";
const HOME_STACKED_INTRO_HEADING_CLASS = cn(
  "m-0 w-full min-w-0 text-left text-kale [text-box-trim:trim-both] [text-box-edge:cap_alphabetic] lg:text-center",
  // Mobile: scale down so "Feeding Communities" fits at 320px (nowrap orphan guard)
  "text-[clamp(1.625rem,8.5vw,3.5rem)] font-medium leading-none tracking-[-0.04em] lg:text-[clamp(58.212px,7.701cqw,116.424px)]",
  "font-semibold tracking-[-0.05em]",
  "[--section-emphasis:var(--color-se-green-base)]",
  "[&>span]:gap-y-[0.04em] lg:[&>span]:gap-y-[0.06em]",
);

function HomeHeroIntroBand({ children }: { children: ReactNode }) {
  return (
    <div className={HOME_HERO_INTRO_BAND_CLASS}>
      <div className={STANDARD_CONTENT_CLASS}>{children}</div>
    </div>
  );
}

const HOME_STACKED_INTRO_CAPTION_CLASS = cn(
  "flex flex-col gap-1 text-lg leading-[1.6] lg:gap-1.5 lg:text-[22px]",
  "text-kale lg:text-center",
);
/** Mobile-only: scale intro heading so nowrap lines fit down to 320px */
function useMobileHeroFitText() {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return enabled;
}
/** Heading + caption read as one block — tighter internal rhythm (matches TextSection) */
const HOME_HERO_INTRO_TEXT_GAP = "gap-5 lg:gap-6";
/** Headline separated from supporting copy + actions */
const HOME_HERO_INTRO_HEADLINE_GAP = "gap-6 lg:gap-8";
const HOME_HERO_INTRO_CTA_CLASS = cn(
  "pointer-events-auto mb-8 flex w-full flex-col gap-3 sm:mb-10 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-5 lg:justify-center",
);
const HOME_HERO_INTRO_FORM_CLASS = cn(
  "pointer-events-auto mb-5 w-full sm:mb-6",
  HOME_HERO_INTRO_FORM_MAX_WIDTH,
  "lg:mx-auto",
);

const HOME_HERO_INTRO_CAPTION_EMPHASIS_STYLE = {
  "--section-emphasis": "var(--color-se-green-base)",
} as CSSProperties;

function HomeHeroIntroContent({
  title,
  caption,
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  introDonationForm = false,
  textMaskRef,
  donateModuleRef,
  waitForIntroReveal,
  onRevealComplete,
  onIntroSettled,
}: {
  title: string;
  caption?: string;
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  introDonationForm?: boolean;
  textMaskRef?: RefObject<HTMLDivElement | null>;
  donateModuleRef?: RefObject<HTMLDivElement | null>;
  waitForIntroReveal?: boolean;
  onRevealComplete?: () => void;
  /** Fires after heading, caption, and CTAs have finished their enter animations */
  onIntroSettled?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const fitHeadingText = useMobileHeroFitText();
  const [captionVisible, setCaptionVisible] = useState(reduceMotion);
  const hasCtas = Boolean(primaryCta || secondaryCta);
  const hasActions = hasCtas || introDonationForm;

  useEffect(() => {
    if (reduceMotion) onIntroSettled?.();
  }, [onIntroSettled, reduceMotion]);

  const handleRevealComplete = () => {
    setCaptionVisible(true);
    onRevealComplete?.();
    if (!caption && !hasActions) {
      onIntroSettled?.();
    }
  };

  const handleCaptionSettled = (definition: string) => {
    if (definition === "visible" && !hasActions) {
      onIntroSettled?.();
    }
  };

  const handleActionSettled = () => {
    if (captionVisible) {
      onIntroSettled?.();
    }
  };

  const ctaButtons = hasCtas && (
    <>
      {primaryCta && (
        <Button
          variant="primary"
          colorScheme="light"
          href={primaryCtaHref}
          className="w-full sm:w-auto"
        >
          {primaryCta}
        </Button>
      )}
      {secondaryCta && (
        <Button
          variant="secondary"
          colorScheme="light"
          href={secondaryCtaHref}
          className="w-full sm:w-auto"
        >
          {secondaryCta}
        </Button>
      )}
    </>
  );

  const ctaEl = ctaButtons &&
    (reduceMotion ? (
      <div className={HOME_HERO_INTRO_CTA_CLASS}>{ctaButtons}</div>
    ) : (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={captionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ ...heroWordSpring, delay: caption ? 0.24 : 0 }}
        onAnimationComplete={handleActionSettled}
        className={HOME_HERO_INTRO_CTA_CLASS}
      >
        {ctaButtons}
      </motion.div>
    ));

  const donateFormEl = introDonationForm &&
    (reduceMotion ? (
      <div
        ref={donateModuleRef}
        data-hero-donate-module=""
        className={HOME_HERO_INTRO_FORM_CLASS}
      >
        <DonationForm
          variant="hero"
          formCard="white"
          sectionTheme="light"
          hideHeader
          compact
          className="shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
        />
      </div>
    ) : (
      <motion.div
        ref={donateModuleRef}
        data-hero-donate-module=""
        initial={{ opacity: 0, y: 24 }}
        animate={captionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ ...heroWordSpring, delay: caption ? 0.24 : 0 }}
        onAnimationComplete={handleActionSettled}
        className={HOME_HERO_INTRO_FORM_CLASS}
      >
        <DonationForm
          variant="hero"
          formCard="white"
          sectionTheme="light"
          hideHeader
          compact
          className="shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
        />
      </motion.div>
    ));

  const actionEl = introDonationForm ? donateFormEl : ctaEl;

  const captionEl = caption &&
    (reduceMotion ? (
      <p className={HOME_STACKED_INTRO_CAPTION_CLASS} style={HOME_HERO_INTRO_CAPTION_EMPHASIS_STYLE}>
        {parseEmphasis(caption, true, "paragraph")}
      </p>
    ) : (
      <motion.p
        initial="hidden"
        animate={captionVisible ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        onAnimationComplete={handleCaptionSettled}
        className={HOME_STACKED_INTRO_CAPTION_CLASS}
        style={HOME_HERO_INTRO_CAPTION_EMPHASIS_STYLE}
      >
        {caption.split("\n").map((line, lineIndex) => (
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
            {parseEmphasis(line, true, "paragraph")}
          </motion.span>
        ))}
      </motion.p>
    ));

  return (
    <div className={cn("flex w-full flex-col", HOME_HERO_INTRO_HEADLINE_GAP)} data-theme="light">
      <div
        ref={textMaskRef}
        data-hero-text-mask=""
        className={cn("flex w-full flex-col", HOME_HERO_INTRO_HEADLINE_GAP)}
      >
        <AnimatedHeroHeading
          title={title}
          as="h1"
          multiline
          fitText={fitHeadingText}
          fitTextMaxSizePx={56}
          revealDelay={homeHeroRevealDelay}
          revealStagger={homeHeroRevealStagger}
          waitForIntroReveal={waitForIntroReveal}
          onRevealComplete={handleRevealComplete}
          className={HOME_STACKED_INTRO_HEADING_CLASS}
        />
        {captionEl && (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col lg:mx-auto lg:items-center",
              HOME_HERO_INTRO_TEXT_GAP,
            )}
          >
            {captionEl}
          </div>
        )}
      </div>
      {actionEl && (
        <div
          className={cn(
            "flex w-full max-w-2xl flex-col lg:mx-auto lg:items-center",
            HOME_HERO_INTRO_TEXT_GAP,
            captionEl && "-mt-1 lg:-mt-1",
          )}
        >
          {actionEl}
        </div>
      )}
    </div>
  );
}

function HomeHeroDonateContent({
  title,
  body,
  bodySize,
}: {
  title: string;
  body?: string;
  bodySize?: HeroSectionProps["bodySize"];
}) {
  return (
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
    <HomeHeroDonateContent title={title} body={body} bodySize={bodySize} />
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
      <HomeHeroGradients showTopGradient showBottomGradient={false} />
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
    <section id={id} className={cn(HOME_ROUNDED_SHELL_CLASS, className)}>
      <div className={HOME_ROUNDED_INNER_CLASS}>
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

function useMobileHeroViewport() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function HomeRoundedHeroWithDonate({
  id,
  imageSrc,
  imageAlt,
  videoSrc,
  title,
  body,
  cardTitle,
  cardBody,
  cardBodySize,
  cardPrimaryCta,
  cardPrimaryCtaHref,
  cardSecondaryCta,
  cardSecondaryCtaHref,
  introCaption,
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  introDonationForm = false,
  pinOnScroll = true,
  className,
}: {
  id?: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  title: string;
  body?: string;
  introCaption?: string;
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  introDonationForm?: boolean;
  cardTitle?: string;
  cardBody?: string;
  cardBodySize?: "xl" | "lg" | "md";
  cardPrimaryCta?: string;
  cardPrimaryCtaHref?: string;
  cardSecondaryCta?: string;
  cardSecondaryCtaHref?: string;
  bodySize?: HeroSectionProps["bodySize"];
  pinOnScroll?: boolean;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introContentRef = useRef<HTMLDivElement>(null);
  const introTextMaskRef = useRef<HTMLDivElement>(null);
  const introDonateModuleRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scrollFx = pinOnScroll && !reduceMotion;
  const pageRevealed = useIntroRevealed();
  const isMobileViewport = useMobileHeroViewport();
  const [introRevealed, setIntroRevealed] = useState(reduceMotion);
  const [ripplesActive, setRipplesActive] = useState(reduceMotion);
  const [mobileDotsEntered, setMobileDotsEntered] = useState(reduceMotion);
  const playHeroVideo = reduceMotion || pageRevealed;

  const handleIntroSettled = useCallback(() => {
    if (isMobileViewport) {
      setMobileDotsEntered(true);
    }
  }, [isMobileViewport]);

  useEffect(() => {
    if (reduceMotion || isMobileViewport) {
      return;
    }
    if (!pageRevealed) {
      setRipplesActive(false);
      return;
    }

    const delayMs = homeNavEnterCompleteDelay * 1000;
    const timer = window.setTimeout(() => setRipplesActive(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [isMobileViewport, pageRevealed, reduceMotion]);
  useHomeHeroFrameStart(sectionRef, introRef, scrollFx);
  useHomeHeroDonateScrollCssVar(sectionRef, scrollFx, (progress) => {
    if (progress > 0.02) setIntroRevealed(true);
  });

  useEffect(() => {
    if (reduceMotion) {
      setIntroRevealed(true);
    }
  }, [reduceMotion]);

  const heroIntro = (
    <HomeHeroIntroContent
      title={title}
      caption={introCaption}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      secondaryCta={secondaryCta}
      secondaryCtaHref={secondaryCtaHref}
      introDonationForm={introDonationForm}
      textMaskRef={introTextMaskRef}
      donateModuleRef={introDonateModuleRef}
      waitForIntroReveal
      onRevealComplete={() => setIntroRevealed(true)}
      onIntroSettled={handleIntroSettled}
    />
  );

  const pulseActive = isMobileViewport ? mobileDotsEntered : ripplesActive;
  const pulseEntered = isMobileViewport ? mobileDotsEntered : true;

  const overlayCard = cardTitle ? (
    <div className={HOME_HERO_DONATE_FORM_MAX_WIDTH}>
      <HeroContentCard
        title={cardTitle}
        body={cardBody}
        bodySize={cardBodySize}
        primaryCta={cardPrimaryCta}
        primaryCtaHref={cardPrimaryCtaHref}
        secondaryCta={cardSecondaryCta}
        secondaryCtaHref={cardSecondaryCtaHref}
        className="shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
      />
    </div>
  ) : (
    <div className={HOME_HERO_DONATE_FORM_MAX_WIDTH}>
      <DonationForm
        variant="hero"
        sectionTheme="dark"
        eyebrow={body?.split("\n")[0]}
        className="shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
      />
    </div>
  );

  if (!scrollFx) {
    return (
      <section
        id={id}
        data-home-hero
        data-theme="light"
        className={cn("w-full bg-white home-hero-donate--stacked", className)}
      >
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pt-[var(--site-header-height)]">
          <HeroBackgroundPulses
            active={pulseActive}
            entered={pulseEntered}
            contentMaskRef={introTextMaskRef}
            rippleOriginRef={introDonationForm ? introDonateModuleRef : undefined}
          />
          <div className="relative z-10">
            <HomeHeroIntroBand>
              <div ref={introContentRef}>{heroIntro}</div>
            </HomeHeroIntroBand>
          </div>
          <motion.div
            data-theme="dark"
            className="relative z-20 min-h-0 flex-1 rounded-[var(--radius-xl)] -mb-[8vh]"
            initial={reduceMotion ? false : HOME_HERO_VIDEO_ENTER.initial}
            animate={pageRevealed ? HOME_HERO_VIDEO_ENTER.animate : HOME_HERO_VIDEO_ENTER.initial}
            transition={{ ...homeHeroVideoEnterSpring, delay: homeHeroVideoEnterDelay }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)]">
              <HomeHeroBackground
                imageSrc={imageSrc}
                imageAlt={imageAlt}
                videoSrc={videoSrc}
                playVideo={playHeroVideo}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-[2] pb-4 lg:pb-[clamp(24px,4vh,48px)]">
              <div className={STANDARD_CONTENT_CLASS}>{overlayCard}</div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      data-home-hero
      data-theme="light"
      data-hero-intro-revealed={introRevealed || undefined}
      className={cn(
        "home-hero-donate home-hero-donate--stacked relative z-0 bg-white",
        HOME_STACKED_SCROLL_HEIGHT,
        "home-hero-donate--scroll-fx",
        className,
      )}
    >
      <div className="home-hero-donate__pin sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-white" aria-hidden />
        <HeroBackgroundPulses
          active={pulseActive}
          entered={pulseEntered}
          contentMaskRef={introTextMaskRef}
          rippleOriginRef={introDonationForm ? introDonateModuleRef : undefined}
        />

        {/* Heading — in green space above video, video scrolls over it */}
        <div
          ref={introRef}
          className={cn(
            "home-hero-donate__intro home-hero-donate__intro--scroll-fx",
            HOME_HERO_INTRO_BAND_CLASS,
            "pointer-events-none absolute inset-x-0 z-10",
          )}
        >
          <div className={STANDARD_CONTENT_CLASS}>
            <div ref={introContentRef} className="home-hero-donate__intro-scale">
              {heroIntro}
            </div>
          </div>
        </div>

        {/* Video frame — expands from below heading to fullscreen */}
        <motion.div
          data-theme="dark"
          className="home-hero-donate__frame home-hero-donate__frame--scroll-fx absolute z-20 overflow-hidden"
          initial={reduceMotion ? false : HOME_HERO_VIDEO_ENTER.initial}
          animate={pageRevealed ? HOME_HERO_VIDEO_ENTER.animate : HOME_HERO_VIDEO_ENTER.initial}
          transition={{ ...homeHeroVideoEnterSpring, delay: homeHeroVideoEnterDelay }}
        >
          <div className="home-hero-donate__bg-wrap absolute inset-0">
            <HomeHeroBackground
              scrollRef={sectionRef}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              videoSrc={videoSrc}
              playVideo={playHeroVideo}
            />
          </div>
        </motion.div>

        {/* Body + Donate — appears over fullscreen video, slides up from bottom */}
        <div
          data-theme="dark"
          className={cn(
            "home-hero-donate__content home-hero-donate__content--scroll-fx",
            "absolute inset-x-0 bottom-0 z-30",
            "pb-4 lg:pb-[clamp(32px,5vh,72px)]",
          )}
        >
          <div className={STANDARD_CONTENT_CLASS}>{overlayCard}</div>
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
  bodyEmphasis,
  imageSrc,
  imageAlt = "",
  videoSrc,
  imageCaption,
  sticker = false,
  stickerName = "free-food",
  imageObjectPosition = "center",
  imageAspect,
  primaryCta,
  primaryCtaHref = "#",
  secondaryCta,
  secondaryCtaHref = "#",
  cardTitle,
  cardBody,
  cardBodySize,
  cardPrimaryCta,
  cardPrimaryCtaHref,
  cardSecondaryCta,
  cardSecondaryCtaHref,
  introCaption,
  introDonationForm = false,
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
  const subpageDonateShellClass =
    "pb-[72px] pt-[100px] lg:pb-[160px] lg:pt-[140px]";
  const stackContentGapClass = sticker
    ? "gap-12 lg:gap-24"
    : "gap-8 lg:gap-16";
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
          {eyebrow ? (
            <p className={cn(eyebrowClassName, "text-[var(--section-text,#003619)]")}>{eyebrow}</p>
          ) : (
            <div aria-hidden className="min-h-[calc(1.125rem*1.1)] lg:min-h-[calc(24px*1.1)]" />
          )}
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
        <div className={cn("flex flex-col", stackContentGapClass)}>
          <TextSection
            eyebrow={eyebrow}
            reserveEyebrowSpace
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
            objectPosition={imageObjectPosition}
            imageAspect={imageAspect}
            isCard={isCard}
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
        <div className={cn("flex flex-col", stackContentGapClass)}>
          <TextSection
            eyebrow={eyebrow}
            reserveEyebrowSpace
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
            className="w-full"
          />
          <SubpageHeroImage
            src={imageSrc}
            alt={imageAlt}
            caption={imageCaption}
            sticker={sticker}
            stickerName={stickerName}
            stickerAlign="center"
            objectPosition={imageObjectPosition}
            imageAspect={imageAspect}
            isCard={isCard}
          />
        </div>
      </SectionShell>
    );
  }

  if (resolvedLayout === "stack-centered-donate") {
    return (
      <SectionShell
        theme={theme}
        className={cn(
          "px-0 py-0",
          subpageDonateShellClass,
          flushBottom && "pb-0 lg:pb-0",
          sticker && "overflow-visible",
          className,
        )}
        contentClassName={cn(FIGMA_CONTENT_CLASS, FIGMA_INNER_PADDING)}
        id={id}
        flushTop={flushTop}
        flushBottom={flushBottom}
        transparentBg={transparentBg}
      >
        <div className={cn("flex flex-col", stackContentGapClass)}>
          <TextSection
            eyebrow={eyebrow}
            reserveEyebrowSpace
            heading={title}
            headingSize={headingSize}
            animateHeading
            emphasis={!isCard}
            isCard={isCard}
            body={body}
            bodyEmphasis={bodyEmphasis}
            bodySize={bodySize}
            primaryCta={primaryCta}
            primaryCtaHref={primaryCtaHref}
            secondaryCta={secondaryCta}
            secondaryCtaHref={secondaryCtaHref}
            buttonScheme={sectionCardContentIsDark(isCard, cardColor, theme) ? "dark" : "light"}
            align="center"
            className="w-full"
          />
          <SubpageHeroWithDonate
            src={imageSrc}
            alt={imageAlt}
            sticker={sticker}
            stickerName={stickerName}
            submitLabel={submitLabel}
            isCard={isCard}
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

  if (resolvedLayout === "rounded-donate") {
    return (
      <HomeRoundedHeroWithDonate
        id={id}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        videoSrc={videoSrc}
        title={title}
        body={body}
        bodySize={bodySize}
        cardTitle={cardTitle}
        cardBody={cardBody}
        cardBodySize={cardBodySize}
        cardPrimaryCta={cardPrimaryCta}
        cardPrimaryCtaHref={cardPrimaryCtaHref}
        cardSecondaryCta={cardSecondaryCta}
        cardSecondaryCtaHref={cardSecondaryCtaHref}
        introCaption={introCaption}
        introDonationForm={introDonationForm}
        primaryCta={primaryCta}
        primaryCtaHref={primaryCtaHref}
        secondaryCta={secondaryCta}
        secondaryCtaHref={secondaryCtaHref}
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
