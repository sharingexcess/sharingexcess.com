import { Button } from "@/components/ui/Button";
import { useScrollInteractionsEnabled } from "@/components/providers/AppProviders";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { parseBodyLinks } from "@/lib/parseBodyLinks";
import {
  AnimatePresence,
  figmaQuickSpring,
  motion,
  motionEase,
  roundImageBleedGlideVariants,
  textImageStackEnterSpring,
  textImageStackSettleSpring,
  textImageTitleSpring,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "@/lib/motion";
import { getSiteHeaderHeight } from "@/lib/roundSectionScroll";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { sectionMediaRadiusClass } from "@/sections/sectionCardConfig";
import type { ImagePosition } from "@/lib/types";
import { bodyLgClassName, sectionH1ClassName, sectionH2ClassName } from "@/lib/typography";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";

/** Figma 637:423 — incoming photo tilts from below and glides up */
const STACK_ENTER_ROTATION = -9.48;
const STACK_ENTER_SCALE = 0.86;
const STACK_ENTER_Y = 96;

/** Figma 596:740 — back layer sits ~22px higher; scales to ~80.7% */
const STACK_BEHIND_Y_STEP = 22;
const STACK_SHRINK_PER_DEPTH = 0.807;

/** Hold enter direction through the full spring so scroll progress re-renders don't cut it short */
const STACK_ENTER_HOLD_MS = 560;

/** Scroll distance over which the image container morphs from max-width slot to viewport bleed */
const BLEED_MORPH_DISTANCE_PX = 360;
const BLEED_MORPH_DELAY_PX = 120;

const DEFAULT_AUTO_ADVANCE_MS = 4000;

function CarouselPauseButton({
  isPaused,
  onToggle,
}: {
  isPaused: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        isPaused ? "Resume automatic slide show" : "Pause automatic slide show"
      }
      aria-pressed={!isPaused}
      className="shrink-0 text-sm font-medium text-[var(--section-text)] opacity-60 transition-opacity hover:opacity-100"
    >
      {isPaused ? "Resume" : "Pause"}
    </button>
  );
}

/** Matches TextImageSection horizontal image corners */
function imageRadiusClass(isCard: boolean) {
  return sectionMediaRadiusClass(isCard);
}

/**
 * Per-slide accent — title + matching primary button fill (index order: Free, Fast, Tracked, Everywhere).
 * Tangerine and blueberry are ~20% more saturated than their -600/-500 tokens;
 * guava is ~8% more saturated than guava-500 — all keep large-heading contrast on white.
 */
const SLIDE_ACCENTS = [
  {
    accentColor: "var(--color-se-green)",
    buttonVars: {
      "--section-btn-primary-bg": "var(--color-se-green)",
      "--section-btn-primary-hover-bg": "var(--color-se-green-500)",
    },
  },
  {
    accentColor: "#d4513a",
    buttonVars: {
      "--section-btn-primary-bg": "#d4513a",
      "--section-btn-primary-hover-bg": "#ac4435",
    },
  },
  {
    accentColor: "#cd7700",
    buttonVars: {
      "--section-btn-primary-bg": "#cd7700",
      "--section-btn-primary-hover-bg": "#8c5304",
    },
  },
  {
    accentColor: "#2c99c1",
    buttonVars: {
      "--section-btn-primary-bg": "#2c99c1",
      "--section-btn-primary-hover-bg": "#1e6682",
    },
  },
] as const;

function slideAccent(index: number) {
  return SLIDE_ACCENTS[index % SLIDE_ACCENTS.length];
}

function slideButtonStyle(index: number): CSSProperties {
  const { buttonVars } = slideAccent(index);
  return {
    ...buttonVars,
    "--section-btn-primary-label": "#ffffff",
    "--section-btn-primary-hover-label": "#ffffff",
  } as CSSProperties;
}

export interface TextImageItem {
  title: string;
  body?: string;
  imageSrc: string;
  imageAlt?: string;
  primaryCta?: string;
  primaryCtaHref?: string;
}

export interface TextImageProps {
  eyebrow?: string;
  items: TextImageItem[];
  imagePosition?: ImagePosition;
  isCard?: boolean;
  /** Uncontrolled initial slide */
  defaultIndex?: number;
  /** Controlled active slide */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Auto-advance slides on an interval (disabled when prefers-reduced-motion) */
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
  /** Scroll-pinned layout — centers content and enlarges the image column */
  pinnedLayout?: boolean;
  /** 50/50 split with the image panel full-bleed to the viewport edge and rounded inner corners */
  imageBleed?: boolean;
  /** Scroll track for bleed morph — pass the pinned section element */
  sectionRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/** Full-bleed image clip — flush on the outer edge, rounded on the inner seam */
function imageBleedClipClass(bleedLeft: boolean) {
  return cn(
    "relative h-full w-full overflow-hidden",
    bleedLeft
      ? "min-h-[min(52vw,420px)] rounded-[var(--radius-2xl)] lg:min-h-0 lg:rounded-none lg:rounded-tr-[var(--radius-3xl)] lg:rounded-br-[var(--radius-3xl)]"
      : "min-h-[min(52vw,420px)] rounded-[var(--radius-2xl)] lg:min-h-0 lg:rounded-none lg:rounded-tl-[var(--radius-3xl)] lg:rounded-bl-[var(--radius-3xl)]",
  );
}

function TextImageBleedMorphLayout({
  bleedLeft,
  textColumn,
  imageSlot,
  sectionRef,
  imageRevealRef,
  imageRevealed,
  reduceMotion,
}: {
  bleedLeft: boolean;
  textColumn: ReactNode;
  imageSlot: ReactNode;
  sectionRef?: RefObject<HTMLElement | null>;
  imageRevealRef: RefObject<HTMLDivElement | null>;
  imageRevealed: boolean;
  reduceMotion: boolean;
}) {
  const mobileRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const scrollInteractions = useScrollInteractionsEnabled();
  const morphProgress = useMotionValue(reduceMotion ? 1 : 0);

  // Morph the clip container only — image stays object-cover inside, no scale transform.
  const wrapperWidth = useTransform(morphProgress, [0, 1], ["47.2%", "107.8%"]);
  const wrapperEdge = useTransform(morphProgress, [0, 1], ["0%", "-58.6%"]);
  const wrapperTop = useTransform(morphProgress, [0, 1], ["50%", "0%"]);
  const wrapperY = useTransform(morphProgress, [0, 1], ["-50%", "0%"]);
  const wrapperHeight = useTransform(morphProgress, [0, 1], ["47.2%", "100%"]);
  const borderTopLeftRadius = useTransform(
    morphProgress,
    [0, 1],
    bleedLeft ? ["var(--radius-xl)", "0px"] : ["var(--radius-xl)", "var(--radius-3xl)"],
  );
  const borderBottomLeftRadius = useTransform(
    morphProgress,
    [0, 1],
    bleedLeft ? ["var(--radius-xl)", "0px"] : ["var(--radius-xl)", "var(--radius-3xl)"],
  );
  const borderTopRightRadius = useTransform(
    morphProgress,
    [0, 1],
    bleedLeft ? ["var(--radius-xl)", "var(--radius-3xl)"] : ["var(--radius-xl)", "0px"],
  );
  const borderBottomRightRadius = useTransform(
    morphProgress,
    [0, 1],
    bleedLeft ? ["var(--radius-xl)", "var(--radius-3xl)"] : ["var(--radius-xl)", "0px"],
  );

  useEffect(() => {
    if (reduceMotion) {
      morphProgress.set(1);
      return;
    }

    const section = sectionRef?.current;
    if (!section || !lenis || !scrollInteractions) return;

    const update = () => {
      const scrolledPast = getSiteHeaderHeight() - section.getBoundingClientRect().top;
      morphProgress.set(
        Math.max(0, Math.min(1, (scrolledPast - BLEED_MORPH_DELAY_PX) / BLEED_MORPH_DISTANCE_PX)),
      );
    };

    lenis.on("scroll", update);
    update();
    return () => lenis.off("scroll", update);
  }, [lenis, morphProgress, reduceMotion, scrollInteractions, sectionRef]);

  const mobileInView = useInViewOnce(mobileRef, { once: true, amount: 0.2 });

  const bleedEdgeStyle = bleedLeft
    ? { left: wrapperEdge }
    : { right: wrapperEdge };

  return (
    <>
      <div ref={mobileRef} className="flex flex-col gap-10 px-6 lg:hidden">
        <motion.div
          className={imageBleedClipClass(bleedLeft)}
          variants={roundImageBleedGlideVariants(bleedLeft)}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion || mobileInView ? "visible" : "hidden"}
        >
          {imageSlot}
        </motion.div>
        {textColumn}
      </div>

      <div className="relative hidden h-full w-full lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-24">
        {/* Column 1 — reserves space; image is absolutely positioned over this half */}
        <div className="relative min-h-0" aria-hidden="true" />

        {/* Column 2 — text always in document flow on the right */}
        <div className="relative z-10 flex min-w-0 flex-col justify-center">
          {textColumn}
        </div>

        <motion.div
          ref={imageRevealRef}
          className="absolute overflow-hidden"
          style={{
            width: wrapperWidth,
            ...bleedEdgeStyle,
            top: wrapperTop,
            y: wrapperY,
            height: wrapperHeight,
            borderTopLeftRadius,
            borderBottomLeftRadius,
            borderTopRightRadius,
            borderBottomRightRadius,
          }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: reduceMotion || imageRevealed ? 1 : 0 }}
          transition={{ duration: 0.45, ease: motionEase }}
        >
          <div className="size-full [&>*]:h-full">{imageSlot}</div>
        </motion.div>
      </div>
    </>
  );
}

function inactiveOpacity(distance: number): number {
  if (distance <= 0) return 1;
  if (distance === 1) return 0.3;
  if (distance === 2) return 0.2;
  return 0.1;
}

function stackScale(depth: number): number {
  if (depth <= 0) return 1;
  return STACK_SHRINK_PER_DEPTH ** depth;
}

function ImageStack({
  items,
  activeIndex,
  direction,
  isCard,
  pinnedLayout = false,
  imageBleed = false,
}: {
  items: TextImageItem[];
  activeIndex: number;
  direction: number;
  isCard: boolean;
  pinnedLayout?: boolean;
  imageBleed?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const visibleItems = items.slice(0, activeIndex + 1);
  const radiusClass = imageBleed ? "" : imageRadiusClass(isCard);
  const maxStackPeek = (items.length - 1) * STACK_BEHIND_Y_STEP;
  const stackBleed = pinnedLayout
    ? Math.max(maxStackPeek, STACK_ENTER_Y)
    : maxStackPeek;
  const useStackPadding = !imageBleed;

  return (
    <div
      className={cn(
        "relative w-full",
        imageBleed && "h-full min-h-[inherit]",
        !imageBleed && pinnedLayout && "flex items-center justify-center overflow-visible",
        !imageBleed && !pinnedLayout && "overflow-visible",
      )}
      style={
        useStackPadding
          ? pinnedLayout
            ? {
                paddingTop: stackBleed,
                paddingBottom: stackBleed,
              }
            : {
                paddingTop: maxStackPeek > 0 ? maxStackPeek : undefined,
                paddingBottom: STACK_ENTER_Y,
              }
          : undefined
      }
    >
      <div
        className={cn(
          "relative w-full overflow-visible",
          imageBleed ? "h-full" : pinnedLayout ? "max-w-none lg:max-w-none" : "max-w-full",
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-visible",
            imageBleed ? "h-full min-h-[inherit]" : "aspect-[692/699]",
          )}
        >
        <AnimatePresence initial={false}>
        {visibleItems.map((item, index) => {
          const isTop = index === activeIndex;
          const depth = activeIndex - index;
          const isEntering = isTop && direction > 0;

          return (
            <motion.div
              key={`${item.imageSrc}-${index}`}
              className={cn(
                "absolute inset-0 overflow-hidden",
                radiusClass,
              )}
              style={{
                zIndex: index + 1,
                transformOrigin: isEntering ? "50% 100%" : "50% 0%",
              }}
              initial={
                reduceMotion || !isEntering
                  ? false
                  : {
                      rotate: STACK_ENTER_ROTATION,
                      y: STACK_ENTER_Y,
                      scale: STACK_ENTER_SCALE,
                      opacity: 0,
                    }
              }
              animate={{
                rotate: 0,
                y: depth * -STACK_BEHIND_Y_STEP,
                scale: stackScale(depth),
                opacity: 1,
              }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      rotate: STACK_ENTER_ROTATION * 0.5,
                      y: STACK_ENTER_Y * 0.5,
                      scale: STACK_ENTER_SCALE,
                      opacity: 0,
                      transition: textImageStackEnterSpring,
                    }
              }
              transition={
                isEntering ? textImageStackEnterSpring : textImageStackSettleSpring
              }
            >
              <img
                src={item.imageSrc}
                alt={item.imageAlt ?? ""}
                className="size-full object-cover"
              />
              {!isTop && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-white/40"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

export function TextImage({
  eyebrow,
  items,
  imagePosition = "left",
  isCard = false,
  defaultIndex = 0,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  autoAdvance = false,
  autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS,
  pinnedLayout = false,
  imageBleed = false,
  sectionRef,
  className,
}: TextImageProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRevealRef = useRef<HTMLDivElement>(null);
  const imageRevealed = useInViewOnce(imageRevealRef, { once: true, amount: 0.15 });
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;
  const prevIndexRef = useRef(activeIndex);
  const [stackDirection, setStackDirection] = useState(0);

  const pendingDelta =
    activeIndex !== prevIndexRef.current ? activeIndex - prevIndexRef.current : 0;
  const direction = pendingDelta !== 0 ? pendingDelta : stackDirection;

  useLayoutEffect(() => {
    if (activeIndex !== prevIndexRef.current) {
      const delta = activeIndex - prevIndexRef.current;
      if (delta !== 0) setStackDirection(delta);
      prevIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  useEffect(() => {
    if (stackDirection === 0) return;
    const id = window.setTimeout(() => setStackDirection(0), STACK_ENTER_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [activeIndex, stackDirection]);

  const setActiveIndex = useCallback(
    (index: number) => {
      if (!isControlled) setUncontrolledIndex(index);
      onActiveIndexChange?.(index);
    },
    [isControlled, onActiveIndexChange],
  );

  const reduceMotion = useReducedMotion();
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => typeof document !== "undefined" && !document.hidden,
  );

  useEffect(() => {
    const onVisibilityChange = () => setIsDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const canAutoAdvance =
    autoAdvance &&
    !reduceMotion &&
    items.length > 1 &&
    !isPaused &&
    !isInteracting &&
    isDocumentVisible;

  useEffect(() => {
    if (!canAutoAdvance) return;

    const id = window.setInterval(() => {
      setActiveIndex((activeIndex + 1) % items.length);
    }, autoAdvanceMs);

    return () => window.clearInterval(id);
  }, [activeIndex, autoAdvanceMs, canAutoAdvance, items.length, setActiveIndex]);

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    setIsInteracting(false);
  }, []);

  const carouselLabel = eyebrow ?? "Featured stories";
  const showPauseControl = autoAdvance && !reduceMotion && items.length > 1;

  const bleedLeft = imageBleed && imagePosition === "left";
  const bleedRight = imageBleed && imagePosition === "right";

  const imageSlot = (
    <ImageStack
      items={items}
      activeIndex={activeIndex}
      direction={direction}
      isCard={isCard}
      pinnedLayout={pinnedLayout}
      imageBleed={imageBleed}
    />
  );

  const textSlot = (
    <div
      role="tablist"
      aria-label={carouselLabel}
      className="flex w-full flex-col gap-6"
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const position = index - activeIndex;
        const panelId = `${listId}-panel-${index}`;
        const tabId = `${listId}-tab-${index}`;

        return (
          <div key={`${item.title}-${index}`} className="w-full">
            <button
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              className="w-full cursor-pointer text-left"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isActive ? (
                  <motion.div
                    key="active"
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={tabId}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -8, transition: textImageTitleSpring }
                    }
                    transition={figmaQuickSpring}
                    className="flex flex-col gap-6 pb-6"
                  >
                    <div className="flex flex-col gap-3">
                      <p
                        className={sectionH1ClassName}
                        style={{ color: slideAccent(index).accentColor }}
                      >
                        {item.title}
                      </p>
                      {item.body && (
                        <p
                          className={cn(
                            bodyLgClassName,
                            "text-[var(--section-text)]",
                          )}
                        >
                          {parseBodyLinks(item.body)}
                        </p>
                      )}
                    </div>
                    {item.primaryCta && (
                      <div style={slideButtonStyle(index)}>
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
                  </motion.div>
                ) : (
                  <motion.p
                    key="inactive"
                    initial={reduceMotion ? false : { opacity: 0, scale: 1 }}
                    animate={{
                      opacity: inactiveOpacity(Math.abs(position)),
                      scale: 1,
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: Math.min(
                              inactiveOpacity(Math.abs(position)) + 0.45,
                              1,
                            ),
                            scale: 1.03,
                          }
                    }
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={textImageTitleSpring}
                    className={cn(
                      sectionH2ClassName,
                      "origin-left text-[var(--section-text)]",
                    )}
                  >
                    {item.title}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          </div>
        );
      })}
    </div>
  );

  const textColumnInner = (
    <>
      {(eyebrow || showPauseControl) && (
        <div className="flex items-end justify-between gap-4">
          {eyebrow ? (
            <p className="font-sans text-[24px] font-medium leading-[1.06] tracking-[-0.04em] text-[var(--section-text)]">
              {eyebrow}
            </p>
          ) : (
            <span className="sr-only">{carouselLabel}</span>
          )}
          {showPauseControl && (
            <CarouselPauseButton
              isPaused={isPaused}
              onToggle={() => setIsPaused((paused) => !paused)}
            />
          )}
        </div>
      )}
      {textSlot}
    </>
  );

  const textColumn = (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-6 lg:gap-8",
        pinnedLayout || imageBleed ? "justify-center" : "justify-start",
        imageBleed && !pinnedLayout && "px-6 lg:px-0",
        imageBleed && !pinnedLayout && bleedLeft && "lg:order-2 lg:pl-20 lg:pr-6 xl:pr-24",
        imageBleed && !pinnedLayout && bleedRight && "lg:pl-6 lg:pr-20 xl:pl-24",
      )}
    >
      {textColumnInner}
    </div>
  );

  const imageOnRight = imagePosition === "right";

  if (imageBleed && pinnedLayout) {
    return (
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={carouselLabel}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onFocusCapture={() => setIsInteracting(true)}
        onBlurCapture={handleBlur}
        className={cn("h-full min-h-0 w-full", className)}
      >
        <TextImageBleedMorphLayout
          bleedLeft={bleedLeft}
          textColumn={textColumn}
          imageSlot={imageSlot}
          sectionRef={sectionRef}
          imageRevealRef={imageRevealRef}
          imageRevealed={imageRevealed}
          reduceMotion={reduceMotion}
        />
      </div>
    );
  }

  const imageColumn = (
    <div
      className={cn(
        "w-full shrink-0",
        imageBleed ? "relative min-h-0 lg:h-full lg:self-stretch" : "overflow-visible",
        !imageBleed && (pinnedLayout ? "self-center" : "self-start"),
        bleedLeft && !pinnedLayout && "lg:order-1",
        bleedRight && !pinnedLayout && "lg:order-2",
      )}
    >
      {imageBleed ? (
        <motion.div
          ref={imageRevealRef}
          className={imageBleedClipClass(bleedLeft)}
          variants={roundImageBleedGlideVariants(bleedLeft)}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion || imageRevealed ? "visible" : "hidden"}
        >
          {imageSlot}
        </motion.div>
      ) : (
        imageSlot
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={handleBlur}
      className={cn(
        imageBleed && "h-full min-h-0",
        imageBleed
          ? "grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-0"
          : cn(
              "grid grid-cols-1 gap-8 lg:gap-16",
              pinnedLayout
                ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center"
                : "items-start lg:grid-cols-2 lg:items-start",
              imageOnRight && "lg:[&>*:last-child]:order-first",
            ),
        className,
      )}
    >
      {imageBleed ? (
        <>
          {imageColumn}
          {textColumn}
        </>
      ) : (
        <>
          {imageColumn}
          {textColumn}
        </>
      )}
    </div>
  );
}

export default TextImage;
