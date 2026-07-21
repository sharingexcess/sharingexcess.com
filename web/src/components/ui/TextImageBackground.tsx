import { Button } from "@/components/ui/Button";
import { useParallaxScrollStyle } from "@/components/ui/ParallaxBackground";
import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  figmaQuickSpring,
  motion,
  textImageBackgroundFade,
  textImageTitleSpring,
  useReducedMotion,
} from "@/lib/motion";
import { bodyLgClassName, eyebrowClassName, sectionH1ClassName, sectionH2ClassName } from "@/lib/typography";
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type RefObject } from "react";
import type { TextImageItem } from "./TextImage";

export type { TextImageItem };

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
      className="shrink-0 text-sm font-medium text-kale opacity-60 transition-opacity hover:opacity-100"
    >
      {isPaused ? "Resume" : "Pause"}
    </button>
  );
}

function inactiveOpacity(distance: number): number {
  if (distance <= 0) return 1;
  if (distance === 1) return 0.3;
  if (distance === 2) return 0.2;
  return 0.1;
}

function BackgroundCrossfade({
  items,
  activeIndex,
  scrollRef,
}: {
  items: TextImageItem[];
  activeIndex: number;
  scrollRef: RefObject<HTMLElement | null>;
}) {
  const reduceMotion = useReducedMotion();
  const { style, reduceMotion: parallaxReduced } = useParallaxScrollStyle(scrollRef);
  const item = items[activeIndex];

  return (
    <motion.div
      aria-hidden
      style={style}
      className={cn(
        "absolute left-0 w-full",
        parallaxReduced && "inset-0 size-full",
      )}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={`${item.imageSrc}-${activeIndex}`}
          src={item.imageSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={textImageBackgroundFade}
        />
      </AnimatePresence>
    </motion.div>
  );
}

export interface TextImageBackgroundProps {
  eyebrow?: string;
  items: TextImageItem[];
  /** Card alignment — matches Form vertical card on photo background */
  align?: "left" | "center";
  defaultIndex?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
  className?: string;
  id?: string;
}

export function TextImageBackground({
  eyebrow,
  items,
  align = "left",
  defaultIndex = 0,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  autoAdvance = true,
  autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS,
  className,
  id,
}: TextImageBackgroundProps) {
  const listId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;
  const isCentered = align === "center";

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

    const intervalId = window.setInterval(() => {
      setActiveIndex((activeIndex + 1) % items.length);
    }, autoAdvanceMs);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, autoAdvanceMs, canAutoAdvance, items.length, setActiveIndex]);

  const handleCardBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setIsInteracting(false);
  }, []);

  const carouselLabel = eyebrow ?? "Featured stories";
  const showPauseControl = autoAdvance && !reduceMotion && items.length > 1;

  return (
    <section
      ref={rootRef}
      id={id}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
      className={cn(
        "relative overflow-hidden px-6 py-12 lg:px-24 lg:py-[120px]",
        isCentered && "flex flex-col items-center",
        className,
      )}
    >
      <BackgroundCrossfade
        items={items}
        activeIndex={activeIndex}
        scrollRef={rootRef}
      />

      <div className={cn("relative mx-auto max-w-6xl", isCentered && "flex justify-center")}>
        <div className={cn("w-full max-w-[776px]", isCentered && "mx-auto")}>
          <div
            data-theme="light"
            data-form-card="white"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onFocusCapture={() => setIsInteracting(true)}
            onBlurCapture={handleCardBlur}
            className="rounded-[var(--radius-lg)] bg-white p-16 text-kale"
          >
            {(eyebrow || showPauseControl) && (
              <div className="mb-6 flex items-end justify-between gap-4 lg:mb-8">
                {eyebrow ? (
                  <p className={cn(eyebrowClassName, "text-kale")}>{eyebrow}</p>
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
                                : {
                                    opacity: 0,
                                    y: -8,
                                    transition: textImageTitleSpring,
                                  }
                            }
                            transition={figmaQuickSpring}
                            className="flex flex-col gap-6 pb-6"
                          >
                            <div className="flex flex-col gap-3">
                              <p className={cn(sectionH1ClassName, "text-kale")}>
                                {item.title}
                              </p>
                              {item.body && (
                                <p className={cn(bodyLgClassName, "text-kale")}>
                                  {item.body}
                                </p>
                              )}
                            </div>
                            {item.primaryCta && (
                              <div>
                                <Button
                                  variant="primary"
                                  colorScheme="light"
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
                            className={cn(sectionH2ClassName, "origin-left text-kale")}
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default TextImageBackground;
