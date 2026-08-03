import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { parseBodyLinks } from "@/lib/parseBodyLinks";
import { parseEmphasis } from "@/lib/parseEmphasis";
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
import { bodyLgClassName, sectionH2ClassName } from "@/lib/typography";
import { useEffect, useRef, type CSSProperties, type RefObject } from "react";

/**
 * Per-slide theme — card surface, title accent, and button fill.
 * Same palette as TextImage carousel (index order: Free, Fast, Tracked, Everywhere).
 */
const SLIDE_THEMES = [
  {
    cardBg: "var(--color-se-green-100)",
    accentColor: "var(--color-se-green-500)",
    bodyColor: "var(--color-se-green-800)",
    buttonBg: "var(--color-se-green-500)",
    buttonHoverBg: "var(--color-se-green-600)",
  },
  {
    cardBg: "var(--color-guava-100)",
    accentColor: "var(--color-guava-700)",
    bodyColor: "var(--color-se-green-800)",
    buttonBg: "var(--color-guava-700)",
    buttonHoverBg: "var(--color-guava-800)",
  },
  {
    cardBg: "var(--color-tangerine-100)",
    accentColor: "var(--color-tangerine-700)",
    bodyColor: "var(--color-se-green-800)",
    buttonBg: "var(--color-tangerine-700)",
    buttonHoverBg: "var(--color-tangerine-800)",
  },
  {
    cardBg: "var(--color-blueberry-100)",
    accentColor: "var(--color-blueberry-700)",
    bodyColor: "var(--color-se-green-800)",
    buttonBg: "var(--color-blueberry-700)",
    buttonHoverBg: "var(--color-blueberry-800)",
  },
] as const;

/** Scroll distance per card in viewport heights */
const DEFAULT_SCROLL_STEP_VH = 100;
/** Fraction to scale down each buried depth level */
const SCALE_PER_DEPTH = 0.065;
const MIN_BURIED_SCALE = 0.82;
/** How many px of the NEXT card peek above the bottom of the card stack */
const PEEK_PX = 52;
/** Image starts slightly underscaled and eases to 1 when its card scrolls in */
const IMAGE_ENTER_SCALE = 0.94;
/** Wait until the stack is further into view before the first card enters */
const STACK_ENTRY_IN_VIEW_OPTIONS = {
  once: true,
  margin: "-50% 0px -40% 0px",
  amount: 0.6,
} as const;
/** Top padding once the sticky viewport is locked (pt-10) */
const LOCKED_PADDING_PX = 40;
/** Top padding when the section is still scrolling into place */
const ENTRY_PADDING_PX = 120;
/** Scroll span before/after the lock point used to ease padding */
const PADDING_FADE_BEFORE_PX = 100;
const PADDING_FADE_AFTER_PX = 100;

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
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      }
    };
  }, [lenis, reduceMotion, target, trackRef]);

  return paddingTop;
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
  eyebrow?: string;
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
  const { buttonBg, buttonHoverBg } = slideTheme(index);
  return {
    "--section-btn-primary-bg": buttonBg,
    "--section-btn-primary-hover-bg": buttonHoverBg,
    "--section-btn-primary-label": "#ffffff",
    "--section-btn-primary-hover-label": "#ffffff",
  } as CSSProperties;
}

function StackingCard({
  item,
  index,
  activeIndex,
  reduceMotion,
  entryRevealed,
}: {
  item: StackingCardItem;
  index: number;
  activeIndex: number;
  reduceMotion: boolean;
  entryRevealed: boolean;
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
    ? { opacity: isVisible ? 1 : 0, y: 0, scale: 1 }
    : isEntering
      ? { y: "100%", scale: 1, opacity: 0 }
      : isFarFuture
        ? { y: "100%", scale: 1, opacity: 0 }
        : isNext
          ? { y: `calc(100% - ${PEEK_PX}px)`, scale: 1, opacity: 1 }
          : isBuried
            ? { y: 0, scale, opacity: 1 }
            : { y: 0, scale: 1, opacity: 1 };

  const transition = isEntering
    ? figmaQuickSpring
    : isActive || isNext
      ? figmaQuickSpring
      : { duration: 0.45, ease: appleEase };

  const imageEntered = isBuried || (isActive && (index > 0 || entryRevealed));
  const imageScale = reduceMotion || imageEntered ? 1 : IMAGE_ENTER_SCALE;
  const imageTransition =
    isActive && (index > 0 || entryRevealed) && !reduceMotion
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
            ? { y: "100%", opacity: 0 }
            : index === 1
              ? { y: `calc(100% - ${PEEK_PX}px)`, opacity: 1 }
              : { y: "100%", opacity: 0 }
      }
      animate={animate}
      transition={transition}
    >
      {/* Card surface */}
      <div
        className="h-full min-h-full rounded-[var(--radius-xl)]"
        style={{ backgroundColor: cardBg }}
      >
        <div className="grid h-full min-h-full grid-cols-1 lg:grid-cols-[1fr_2fr]">
          {/* Text column */}
          <div className="flex flex-col justify-center gap-4 p-8 lg:gap-5 lg:p-14 xl:p-16">
            <h2
              className="text-[clamp(52px,7.5vw,112px)] font-medium leading-[1.0] tracking-[-0.04em]"
              style={{ color: accentColor }}
            >
              {item.title}
            </h2>
            {item.body && (
              <p className={cn(bodyLgClassName, "max-w-[340px]")} style={{ color: bodyColor }}>
                {parseBodyLinks(item.body)}
              </p>
            )}
            {item.primaryCta && (
              <div style={cardButtonStyle(index)} className="mt-1">
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

          {/* Image column — inset container clips; image scales independently inside */}
          <div className="relative flex min-h-[48vw] items-stretch p-4 lg:min-h-0 lg:p-6 xl:p-8">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--radius-md)]">
              <motion.img
                src={item.imageSrc}
                alt={item.imageAlt ?? ""}
                className="absolute inset-0 h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                initial={reduceMotion ? { scale: 1 } : { scale: IMAGE_ENTER_SCALE }}
                animate={{ scale: imageScale }}
                transition={imageTransition}
                style={{ transformOrigin: "50% 50%" }}
              />
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
  eyebrow,
  items,
  scrollStepVh = DEFAULT_SCROLL_STEP_VH,
  exitScrollVh = 0,
  transparentBg = false,
  className,
  id,
}: StackingCardsSectionProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const entryRevealed = useInViewOnce(stackRef, STACK_ENTRY_IN_VIEW_OPTIONS) || reduceMotion;
  const useScroll = items.length > 1 && !reduceMotion;
  const activeIndex = useScrollDrivenIndex(trackRef, items.length, useScroll);
  const stickyPaddingTop = useStackingStickyPadding(trackRef, reduceMotion);
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
        className="sticky z-[1] flex flex-col px-6 lg:px-24"
        style={{
          top: 0,
          height: "100svh",
          paddingTop: stickyPaddingTop,
        }}
      >
        {eyebrow && (
          <h2 className={cn(sectionH2ClassName, "mb-10 shrink-0 text-[var(--section-text)] lg:mb-14")}>
            {parseEmphasis(eyebrow)}
          </h2>
        )}

        {/* Card stack — no overflow or border-radius container; cards are plain absolute children */}
        <div ref={stackRef} className="relative min-h-0 flex-1">
          {items.map((item, index) => (
            <StackingCard
              key={`${item.title}-${index}`}
              item={item}
              index={index}
              activeIndex={activeIndex}
              reduceMotion={reduceMotion}
              entryRevealed={entryRevealed}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default StackingCardsSection;
