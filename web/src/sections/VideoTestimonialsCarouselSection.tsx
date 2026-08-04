import { ArrowButton } from "@/components/ui/ArrowButton";
import { Sticker } from "@/components/ui/Sticker";
import { TextSection } from "@/components/ui/TextSection";
import { YoutubeChromelessEmbed } from "@/components/ui/YoutubeChromelessEmbed";
import { cn } from "@/lib/cn";
import {
  carouselSlideSpring,
  motion,
  statCardTiltSpring,
  useInView,
  useReducedMotion,
} from "@/lib/motion";
import { isEmbeddableVideo } from "@/lib/toVideoEmbedSrc";
import type { SectionProps, SectionTheme } from "@/lib/types";
import { captionClassName } from "@/lib/typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionLayout } from "./SectionLayout";
import { SectionShell } from "./SectionShell";

export interface VideoTestimonialItem {
  id?: string;
  posterSrc: string;
  posterAlt?: string;
  /** YouTube URL or direct mp4 path */
  videoSrc: string;
  caption: string;
}

export interface VideoTestimonialsCarouselSectionProps extends SectionProps {
  theme?: SectionTheme;
  eyebrow?: string;
  title?: string;
  headingSize?: "h1" | "h2";
  body?: string;
  bodySize?: "xl" | "lg" | "md";
  items: VideoTestimonialItem[];
  defaultIndex?: number;
  /** Arch-shaped dark-to-light transition at the top of this section */
  archTop?: boolean;
}

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;
/** Peek offset as a fraction of card width — was 156px at 360px */
const CARD_PEEK_FRACTION = 156 / CARD_WIDTH;
const LEFT_PEEK_X = `calc(-50% - ${CARD_PEEK_FRACTION * 100}%)`;
const LEFT_PEEK_SCALE = 0.76;
const DESKTOP_SLIDE_CLASS = "w-[360px]";

/** Straddles the left edge of the left peek slot, halfway between top and center */
const leftPeekStickerClassName =
  "pointer-events-auto absolute z-30 aspect-[250/159] left-0 top-1/4 w-[clamp(80px,12vw,168px)] -translate-x-1/2 -translate-y-1/2 cursor-default";

function LeftPeekSticker({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className={leftPeekStickerClassName}
      initial={false}
      animate={{ rotate: -6 }}
      whileHover={reduceMotion ? undefined : { rotate: 6 }}
      transition={statCardTiltSpring}
      aria-hidden
    >
      <Sticker name="lemon" fillContainer alt="" />
    </motion.div>
  );
}

function LeftPeekStickerSlot({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-0 z-20 origin-center"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      initial={false}
      animate={{ x: LEFT_PEEK_X, scale: LEFT_PEEK_SCALE }}
      transition={{ duration: 0 }}
      aria-hidden
    >
      <LeftPeekSticker reduceMotion={reduceMotion} />
    </motion.div>
  );
}

const MOBILE_CARD_CLASS =
  "group relative aspect-[9/16] w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)]";

const DESKTOP_CARD_CLASS =
  "group relative h-[640px] w-[360px] shrink-0 overflow-hidden rounded-[var(--radius-lg)]";

const POSTER_CLASS = "absolute inset-0 size-full object-cover";

function VideoTestimonialCard({
  item,
  isActive,
  canAutoplay,
  desktop = false,
}: {
  item: VideoTestimonialItem;
  isActive: boolean;
  canAutoplay: boolean;
  desktop?: boolean;
}) {
  const isYoutube = isEmbeddableVideo(item.videoSrc);
  const isMp4 = !isYoutube;
  const shouldPlay = isActive && canAutoplay;
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    setIsVideoReady(false);
    setIsHovered(false);
  }, [item.videoSrc, shouldPlay]);

  const showPoster =
    !isActive || !shouldPlay || ((isYoutube || isMp4) && !isVideoReady);

  return (
    <div
      className={desktop ? DESKTOP_CARD_CLASS : MOBILE_CARD_CLASS}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={item.posterSrc}
        alt={item.posterAlt ?? ""}
        className={cn(
          isActive ? POSTER_CLASS : "size-full object-cover",
          !showPoster && "hidden",
        )}
        loading={isActive ? "eager" : "lazy"}
      />

      {shouldPlay && isYoutube ? (
        <>
          <YoutubeChromelessEmbed
            key={item.videoSrc}
            videoSrc={item.videoSrc}
            title={item.caption}
            autoplay
            interactive={isHovered}
            onReady={() => setIsVideoReady(true)}
          />
          {!isHovered ? (
            <div
              aria-hidden
              className="absolute inset-0 z-[2] cursor-default"
            />
          ) : null}
        </>
      ) : null}

      {shouldPlay && isMp4 ? (
        <>
          <video
            key={item.videoSrc}
            src={item.videoSrc}
            autoPlay
            muted
            playsInline
            controls={isHovered}
            onLoadedData={() => setIsVideoReady(true)}
            className={cn(POSTER_CLASS, "z-[1]")}
          />
          {!isHovered ? (
            <div
              aria-hidden
              className="absolute inset-0 z-[2] cursor-default"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

type CarouselOffset = -1 | 0 | 1;

function getCarouselOffset(
  itemIndex: number,
  activeIndex: number,
  count: number,
): CarouselOffset {
  let diff = itemIndex - activeIndex;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff as CarouselOffset;
}

/** Incoming slide stacks above the outgoing active card during transitions. */
function getSlideZIndex(
  itemIndex: number,
  activeIndex: number,
  previousActiveIndex: number,
  count: number,
): number {
  const currentOffset = getCarouselOffset(itemIndex, activeIndex, count);
  const previousOffset = getCarouselOffset(itemIndex, previousActiveIndex, count);

  if (currentOffset === 0) return 30;
  if (Math.abs(currentOffset) < Math.abs(previousOffset)) return 25;
  if (previousOffset === 0) return 5;
  return 10;
}

function offsetTransform(
  offset: CarouselOffset,
  reduceMotion: boolean,
) {
  const x =
    offset === -1
      ? LEFT_PEEK_X
      : offset === 1
        ? `calc(-50% + ${CARD_PEEK_FRACTION * 100}%)`
        : "-50%";

  return {
    x,
    scale: offset === 0 ? 1 : 0.76,
    transition: reduceMotion ? { duration: 0 } : carouselSlideSpring,
  };
}

function offsetOpacity(offset: CarouselOffset, reduceMotion: boolean) {
  return {
    opacity: offset === 0 ? 1 : 0.65,
    transition: reduceMotion ? { duration: 0 } : carouselSlideSpring,
  };
}

function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLgUp(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isLgUp;
}

export function VideoTestimonialsCarouselSection({
  theme = "light",
  eyebrow,
  title,
  headingSize = "h2",
  body,
  bodySize = "lg",
  items,
  defaultIndex = 0,
  className,
  id,
  flushTop,
  flushBottom,
  transparentBg,
  archTop,
}: VideoTestimonialsCarouselSectionProps) {
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();
  const isLgUp = useIsLgUp();
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(carouselRef, { once: true, amount: 0.45 });
  const canAutoplay = isInView && !reduceMotion;
  const initialIndex = Math.min(
    Math.max(defaultIndex, 0),
    Math.max(items.length - 1, 0),
  );
  const [slideState, setSlideState] = useState({
    active: initialIndex,
    previous: initialIndex,
  });

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      const next =
        ((index % items.length) + items.length) % items.length;
      setSlideState((prev) => ({
        active: next,
        previous: prev.active,
      }));
    },
    [items.length],
  );

  const { active: activeIndex, previous: previousActiveIndex } = slideState;

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const activeItem = items[activeIndex];
  const buttonScheme = isDark ? "dark" : "light";

  const carousel = (
    <div
      className="relative mx-auto w-full max-w-[920px]"
      role="region"
      aria-roledescription="carousel"
      aria-label={title ?? "Video testimonials"}
    >
      <div
        ref={carouselRef}
        className={cn(
          "relative mx-auto overflow-visible",
          isLgUp
            ? "h-[640px] w-[360px]"
            : "aspect-[9/16] w-full max-w-[360px] overflow-hidden",
        )}
      >
        {isLgUp ? (
          <>
            <LeftPeekStickerSlot reduceMotion={reduceMotion} />

            {items.map((item, index) => {
              const offset = getCarouselOffset(index, activeIndex, items.length);
              const isActive = offset === 0;
              const slideKey = item.id ?? item.videoSrc;
              const zIndex = getSlideZIndex(
                index,
                activeIndex,
                previousActiveIndex,
                items.length,
              );

              return (
                <motion.div
                  key={slideKey}
                  initial={false}
                  className={cn(
                    "absolute left-1/2 top-0 origin-center will-change-transform",
                    DESKTOP_SLIDE_CLASS,
                    !isActive && "cursor-pointer",
                  )}
                  style={{ zIndex }}
                  animate={offsetTransform(offset, reduceMotion)}
                  aria-hidden={!isActive}
                  role={!isActive ? "button" : undefined}
                  tabIndex={!isActive ? -1 : undefined}
                  onClick={!isActive ? () => goTo(index) : undefined}
                  onKeyDown={
                    !isActive
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            goTo(index);
                          }
                        }
                      : undefined
                  }
                >
                  <motion.div animate={offsetOpacity(offset, reduceMotion)}>
                    <VideoTestimonialCard
                      item={item}
                      isActive={isActive}
                      canAutoplay={canAutoplay}
                      desktop
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </>
        ) : (
          activeItem ? (
            <VideoTestimonialCard
              key={activeItem.id ?? activeItem.videoSrc}
              item={activeItem}
              isActive
              canAutoplay={canAutoplay}
            />
          ) : null
        )}
      </div>

      {activeItem ? (
        <p
          aria-live="polite"
          className={cn(
            "mx-auto mt-3 w-full max-w-[360px] text-center text-[var(--section-text)]/65",
            captionClassName,
          )}
        >
          {activeItem.caption}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-center gap-4">
        <ArrowButton
          direction="prev"
          variant="secondary"
          colorScheme={buttonScheme}
          size="sm"
          onClick={goPrev}
          aria-label="Previous testimonial"
        />
        <ArrowButton
          direction="next"
          variant="secondary"
          colorScheme={buttonScheme}
          size="sm"
          onClick={goNext}
          aria-label="Next testimonial"
        />
      </div>
    </div>
  );

  return (
    <SectionShell
      theme={theme}
      archTop={archTop}
      className={cn(
        "overflow-visible",
        archTop && "py-12 lg:py-16",
        className,
      )}
      id={id}
      flushTop={flushTop}
      flushBottom={flushBottom}
      transparentBg={transparentBg}
    >
      <SectionLayout
        layout="horizontal"
        textSlot={
          (eyebrow || title || body) ? (
            <TextSection
              eyebrow={eyebrow}
              heading={title}
              headingSize={headingSize}
              body={body}
              bodySize={bodySize}
              buttonScheme={buttonScheme}
              align="left"
            />
          ) : null
        }
        contentSlot={<div className="min-w-0 overflow-visible">{carousel}</div>}
      />
    </SectionShell>
  );
}

export default VideoTestimonialsCarouselSection;
