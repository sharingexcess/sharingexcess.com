import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { TextSection } from "@/components/ui/TextSection";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { parseBodyLinks } from "@/lib/parseBodyLinks";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  appleEase,
  figmaQuickSpring,
} from "@/lib/motion";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useScrollDrivenIndex } from "@/lib/useScrollDrivenIndex";
import type { SectionProps, SectionTheme } from "@/lib/types";
import { bodyXlClassName } from "@/lib/typography";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/**
 * Per-slide theme — base-color card surfaces with AA-compliant text.
 * Index order: Free, Fast, Tracked, Everywhere.
 * Titles use the darkest passing shade (-900, or -800 when no -900 exists);
 * body copy uses -800 from the same family (white on se-green).
 */
const SLIDE_THEMES = [
  {
    cardBg: "var(--color-se-green-base)",
    accentColor: "var(--color-neutral-000)",
    bodyColor: "var(--color-neutral-000)",
    buttonBg: "var(--color-neutral-000)",
    buttonHoverBg: "var(--color-neutral-050)",
    buttonLabel: "var(--color-kale)",
    buttonHoverLabel: "var(--color-kale)",
  },
  {
    cardBg: "var(--color-banana-base)",
    accentColor: "var(--color-banana-900)",
    bodyColor: "var(--color-banana-800)",
    buttonBg: "var(--color-banana-800)",
    buttonHoverBg: "var(--color-banana-900)",
    buttonLabel: "var(--color-neutral-000)",
    buttonHoverLabel: "var(--color-neutral-000)",
  },
  {
    cardBg: "var(--color-tangerine-base)",
    accentColor: "var(--color-tangerine-900)",
    bodyColor: "var(--color-tangerine-800)",
    buttonBg: "var(--color-tangerine-800)",
    buttonHoverBg: "var(--color-tangerine-900)",
    buttonLabel: "var(--color-neutral-000)",
    buttonHoverLabel: "var(--color-neutral-000)",
  },
  {
    cardBg: "var(--color-blueberry-base)",
    accentColor: "var(--color-blueberry-800)",
    bodyColor: "var(--color-blueberry-800)",
    buttonBg: "var(--color-blueberry-700)",
    buttonHoverBg: "var(--color-blueberry-800)",
    buttonLabel: "var(--color-neutral-000)",
    buttonHoverLabel: "var(--color-neutral-000)",
  },
] as const;

/** Scroll distance per card in viewport heights */
const DEFAULT_SCROLL_STEP_VH = 100;
/** Fraction to scale down each buried depth level */
const SCALE_PER_DEPTH = 0.065;
const MIN_BURIED_SCALE = 0.82;
/** How many px of the NEXT card peek above the bottom of the card stack */
const PEEK_PX = 52;
/** Per-card peek tilt (deg); eases to 0 when each card becomes active */
const PEEK_ROTATE_DEGS = [2.5, -3.25, 1.75, -2] as const;

function peekRotateDeg(index: number): number {
  return PEEK_ROTATE_DEGS[index % PEEK_ROTATE_DEGS.length];
}
/** Image rests at 1 so the rounded clip stays covered; zooms in on enter */
const IMAGE_SCALE_REST = 1;
const IMAGE_SCALE_ENTER = 1.1;
/** Wait until the stack is further into view before the first card enters */
const STACK_ENTRY_IN_VIEW_OPTIONS = {
  once: true,
  margin: "-50% 0px -40% 0px",
  amount: 0.6,
} as const;
/** Top padding once the sticky viewport is locked (desktop scroll animation) */
const LOCKED_PADDING_PX = 40;
/** Top padding when the section is still scrolling into place (desktop) */
const ENTRY_PADDING_PX = 120;
/** Scroll span before/after the lock point used to ease padding */
const PADDING_FADE_BEFORE_PX = 100;
const PADDING_FADE_AFTER_PX = 100;
/** Extra px subtracted from available width to account for negative tracking */
const TITLE_WIDTH_BUFFER_PX = 16;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function useStackingStickyPadding(
  trackRef: RefObject<HTMLElement | null>,
  reduceMotion: boolean,
) {
  const lenis = useLenis();
  const target = useMotionValue(ENTRY_PADDING_PX);
  const paddingTop = useSpring(target, {
    stiffness: 90,
    damping: 24,
    mass: 0.85,
  });

  useEffect(() => {
    if (reduceMotion) {
      target.set(LOCKED_PADDING_PX);
      return;
    }

    const update = () => {
      const track = trackRef.current;
      if (!track) return;

      const sectionTop = track.getBoundingClientRect().top;
      const span = PADDING_FADE_BEFORE_PX + PADDING_FADE_AFTER_PX;
      const progress = Math.max(
        0,
        Math.min(1, (PADDING_FADE_BEFORE_PX - sectionTop) / span),
      );
      const eased = smoothstep(progress);
      const next =
        ENTRY_PADDING_PX + (LOCKED_PADDING_PX - ENTRY_PADDING_PX) * eased;
      target.set(next);
    };

    if (lenis) {
      lenis.on("scroll", update);
      window.addEventListener("resize", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
        window.removeEventListener("resize", update);
      } else {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      }
    };
  }, [lenis, reduceMotion, target, trackRef]);

  return paddingTop;
}

/**
 * Measure every card title at the base font size and return one pixel size
 * shared by all cards so long titles like "It's everywhere." fit without clipping.
 */
function useUnifiedCardTitleSize(
  titles: string[],
  containerRef: RefObject<HTMLElement | null>,
  measurerRef: RefObject<HTMLElement | null>,
) {
  const [titlePx, setTitlePx] = useState<number | undefined>();
  const titlesKey = useMemo(() => titles.join("\0"), [titles]);

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const measurer = measurerRef.current;
      if (!container || !measurer) return;

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) {
        setTitlePx(undefined);
        return;
      }

      const textCol = container.querySelector<HTMLElement>("[data-card-text-col]");
      if (!textCol) return;

      const colStyle = getComputedStyle(textCol);
      const horizontalPadding =
        parseFloat(colStyle.paddingLeft) + parseFloat(colStyle.paddingRight);
      const availableWidth =
        textCol.clientWidth - horizontalPadding - TITLE_WIDTH_BUFFER_PX;
      if (availableWidth <= 0) return;

      const baseTitlePx = parseFloat(getComputedStyle(measurer).fontSize);
      if (!baseTitlePx) return;

      let minScale = 1;
      for (const title of titles) {
        measurer.textContent = title;
        const titleWidth = measurer.scrollWidth;
        if (titleWidth > availableWidth) {
          minScale = Math.min(minScale, availableWidth / titleWidth);
        }
      }

      const nextTitlePx = baseTitlePx * Math.min(1, minScale);

      setTitlePx((prev) =>
        prev !== undefined && Math.abs(prev - nextTitlePx) < 0.5 ? prev : nextTitlePx,
      );
    };

    const scheduleMeasure = () => {
      requestAnimationFrame(() => requestAnimationFrame(measure));
    };

    scheduleMeasure();

    const container = containerRef.current;
    if (!container) return;

    const textCol = container.querySelector<HTMLElement>("[data-card-text-col]");
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(container);
    if (textCol) ro.observe(textCol);

    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", scheduleMeasure);
    document.fonts?.ready.then(scheduleMeasure);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", scheduleMeasure);
    };
  }, [containerRef, measurerRef, titles, titlesKey]);

  return titlePx;
}

export interface StackingCardItem {
  title: string;
  body?: string;
  imageSrc: string;
  imageAlt?: string;
  primaryCta?: string;
  primaryCtaHref?: string;
}

export interface StackingCardsSectionProps extends SectionProps {
  theme?: SectionTheme;
  heading?: string;
  intro?: string;
  items: StackingCardItem[];
  scrollStepVh?: number;
  /** Extra scroll depth after the last card before the next section (vh) */
  exitScrollVh?: number;
  transparentBg?: boolean;
}

function slideTheme(index: number) {
  return SLIDE_THEMES[index % SLIDE_THEMES.length];
}

function cardButtonStyle(index: number): CSSProperties {
  const { buttonBg, buttonHoverBg, buttonLabel, buttonHoverLabel } = slideTheme(index);
  return {
    "--section-btn-primary-bg": buttonBg,
    "--section-btn-primary-hover-bg": buttonHoverBg,
    "--section-btn-primary-label": buttonLabel,
    "--section-btn-primary-hover-label": buttonHoverLabel,
  } as CSSProperties;
}

function StackingCard({
  item,
  index,
  activeIndex,
  reduceMotion,
  entryRevealed,
  titleSizePx,
}: {
  item: StackingCardItem;
  index: number;
  activeIndex: number;
  reduceMotion: boolean;
  entryRevealed: boolean;
  titleSizePx?: number;
}) {
  const depth = Math.max(0, activeIndex - index);
  const isBuried = depth > 0;
  const isVisible = index <= activeIndex;
  const isActive = index === activeIndex;
  const isNext = index === activeIndex + 1;
  const isFarFuture = index > activeIndex + 1;
  const scale = reduceMotion ? 1 : Math.max(MIN_BURIED_SCALE, 1 - depth * SCALE_PER_DEPTH);
  const { accentColor, bodyColor, cardBg } = slideTheme(index);

  const isEntering = index === 0 && !entryRevealed;

  const animate = reduceMotion
    ? { opacity: isVisible ? 1 : 0, y: 0, scale: 1, rotate: 0 }
    : isEntering
      ? { y: "100%", scale: 1, opacity: 0, rotate: 0 }
      : isFarFuture
        ? { y: "100%", scale: 1, opacity: 0, rotate: 0 }
        : isNext
          ? {
              y: `calc(100% - ${PEEK_PX}px)`,
              scale: 1,
              opacity: 1,
              rotate: peekRotateDeg(index),
            }
          : isBuried
            ? { y: 0, scale, opacity: 1, rotate: 0 }
            : { y: 0, scale: 1, opacity: 1, rotate: 0 };

  const transition = isEntering
    ? figmaQuickSpring
    : isActive || isNext
      ? figmaQuickSpring
      : { duration: 0.45, ease: appleEase };

  const imageZoomed =
    !reduceMotion && isActive && (index > 0 || entryRevealed);
  const imageScale = imageZoomed ? IMAGE_SCALE_ENTER : IMAGE_SCALE_REST;
  const imageTransition =
    imageZoomed && !reduceMotion
      ? { ...figmaQuickSpring, delay: 0.08 }
      : figmaQuickSpring;

  return (
    <motion.div
      aria-hidden={!isVisible}
      className="absolute inset-0"
      style={{
        zIndex: index + 1,
        transformOrigin: "50% 0%",
        visibility: isFarFuture ? "hidden" : "visible",
      }}
      initial={
        reduceMotion
          ? { opacity: index === 0 ? 1 : 0 }
          : index === 0
            ? { y: "100%", opacity: 0, rotate: 0 }
            : index === 1
              ? {
                  y: `calc(100% - ${PEEK_PX}px)`,
                  opacity: 1,
                  rotate: peekRotateDeg(1),
                }
              : { y: "100%", opacity: 0, rotate: 0 }
      }
      animate={animate}
      transition={transition}
    >
      {/* Card surface */}
      <div
        className="h-full min-h-full rounded-[var(--radius-xl)]"
        style={{ backgroundColor: cardBg }}
      >
        <div
          data-card-grid
          className="grid h-full min-h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(50%,1fr)] lg:grid-rows-none lg:gap-x-10 lg:gap-y-6 xl:gap-x-12"
        >
          {/* Text column — min-w-0 so long titles cannot squeeze the image below 50% */}
          <div
            data-card-text-col
            className="flex min-w-0 flex-col justify-start gap-3 p-4 sm:p-6 lg:justify-center lg:gap-5 lg:p-14 xl:p-16"
          >
            <h2
              className={cn(
                "w-full font-display font-bold leading-[1.0] tracking-[-0.05em] lg:whitespace-nowrap",
                titleSizePx === undefined && "text-[clamp(36px,12vw,112px)]",
              )}
              style={{
                color: accentColor,
                ...(titleSizePx !== undefined ? { fontSize: titleSizePx } : {}),
              }}
            >
              {item.title}
            </h2>
            {item.body && (
              <p
                className={cn(bodyXlClassName, "w-full lg:max-w-none")}
                style={{ color: bodyColor }}
              >
                {parseBodyLinks(item.body)}
              </p>
            )}
            {item.primaryCta && (
              <div style={cardButtonStyle(index)} className="mt-10 lg:mt-12">
                <Button
                  variant="primary"
                  colorScheme="light"
                  size="md"
                  href={item.primaryCtaHref}
                >
                  {item.primaryCta}
                </Button>
              </div>
            )}
          </div>

          {/* Image column — static rounded clip; only the inner layer scales */}
          <div className="relative flex min-h-0 items-stretch p-4 pt-0 sm:p-6 sm:pt-0 lg:min-h-0 lg:p-6 xl:p-8">
            <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded-[var(--radius-md)]">
              <motion.div
                className="absolute inset-0"
                initial={{ scale: IMAGE_SCALE_REST }}
                animate={{ scale: imageScale }}
                transition={imageTransition}
                style={{ transformOrigin: "50% 50%" }}
              >
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt ?? ""}
                  className="block h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </motion.div>
              {isBuried && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-black/10"
                  style={{ opacity: Math.min(0.6, depth * 0.18) }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function StackingCardsSection({
  theme = "light",
  heading,
  intro,
  items,
  scrollStepVh = DEFAULT_SCROLL_STEP_VH,
  exitScrollVh = 0,
  transparentBg = false,
  className,
  id,
}: StackingCardsSectionProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const titleMeasurerRef = useRef<HTMLSpanElement>(null);
  const cardTitles = useMemo(() => items.map((item) => item.title), [items]);
  const titleSizePx = useUnifiedCardTitleSize(
    cardTitles,
    stackRef,
    titleMeasurerRef,
  );
  const reduceMotion = useReducedMotion();
  const entryRevealed = useInViewOnce(stackRef, STACK_ENTRY_IN_VIEW_OPTIONS) || reduceMotion;
  const useScroll = items.length > 1 && !reduceMotion;
  const activeIndex = useScrollDrivenIndex(trackRef, items.length, useScroll);
  const stickyPaddingTop = useStackingStickyPadding(trackRef, reduceMotion);
  const [useAnimatedTopPadding, setUseAnimatedTopPadding] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setUseAnimatedTopPadding(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const trackHeightVh = items.length * scrollStepVh + exitScrollVh;

  return (
    <section
      ref={trackRef}
      id={id}
      data-section=""
      data-theme={theme}
      className={cn(
        "relative overflow-visible text-[var(--section-text)]",
        transparentBg ? "bg-transparent" : "bg-[var(--section-bg)]",
        className,
      )}
      style={{ height: `${trackHeightVh}vh` }}
    >
      {/* Sticky viewport — entry padding eases from 120px down to pt-10 across the lock point */}
      <motion.div
        className="sticky z-[1] flex flex-col px-4 pt-12 sm:px-6 lg:px-24 lg:pt-0"
        style={{
          top: 0,
          height: "100svh",
          ...(useAnimatedTopPadding ? { paddingTop: stickyPaddingTop } : {}),
        }}
      >
        {(heading || intro) && (
          <TextSection
            heading={heading}
            body={intro}
            headingSize="h2"
            bodySize="xl"
            layout="horizontal"
            className="mb-6 shrink-0 sm:mb-8 lg:mb-14"
          />
        )}

        {/* Card stack — no overflow or border-radius container; cards are plain absolute children */}
        <div ref={stackRef} className="relative min-h-0 flex-1">
          <span
            ref={titleMeasurerRef}
            aria-hidden
            className="pointer-events-none invisible absolute whitespace-nowrap font-display text-[clamp(36px,12vw,112px)] font-bold leading-[1.0] tracking-[-0.05em]"
          />
          {items.map((item, index) => (
            <StackingCard
              key={`${item.title}-${index}`}
              item={item}
              index={index}
              activeIndex={activeIndex}
              reduceMotion={reduceMotion}
              entryRevealed={entryRevealed}
              titleSizePx={titleSizePx}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default StackingCardsSection;
