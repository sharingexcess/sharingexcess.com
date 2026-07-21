import { ArrowButton } from "@/components/ui/ArrowButton";
import { TextSection } from "@/components/ui/TextSection";
import { YoutubeChromelessEmbed } from "@/components/ui/YoutubeChromelessEmbed";
import { cn } from "@/lib/cn";
import {
  carouselSlideSpring,
  motion,
  useInView,
  useReducedMotion,
} from "@/lib/motion";
import { isEmbeddableVideo } from "@/lib/toVideoEmbedSrc";
import type { SectionProps, SectionTheme } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
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
  items: VideoTestimonialItem[];
  defaultIndex?: number;
  /** Arch-shaped dark-to-light transition at the top of this section */
  archTop?: boolean;
}

const CARD_CLASS =
  "group relative h-[640px] w-[360px] shrink-0 overflow-hidden rounded-[var(--radius-md)]";

const POSTER_CLASS = "absolute inset-0 size-full object-cover";

function VideoTestimonialCard({
  item,
  isActive,
  canAutoplay,
}: {
  item: VideoTestimonialItem;
  isActive: boolean;
  canAutoplay: boolean;
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
      className={CARD_CLASS}
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

function offsetMotion(
  offset: CarouselOffset,
  reduceMotion: boolean,
) {
  const x =
    offset === -1
      ? "calc(-50% - 156px)"
      : offset === 1
        ? "calc(-50% + 156px)"
        : "-50%";

  return {
    x,
    scale: offset === 0 ? 1 : 0.76,
    opacity: offset === 0 ? 1 : 0.65,
    transition: reduceMotion ? { duration: 0 } : carouselSlideSpring,
  };
}

export function VideoTestimonialsCarouselSection({
  theme = "light",
  eyebrow,
  title,
  headingSize = "h2",
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

  return (
    <SectionShell
      theme={theme}
      archTop={archTop}
      className={cn(
        "overflow-visible",
        archTop && "py-16 lg:py-16",
        className,
      )}
      id={id}
      flushTop={flushTop}
      flushBottom={flushBottom}
      transparentBg={transparentBg}
    >
      <div className="flex flex-col gap-16">
        {(eyebrow || title) && (
          <TextSection
            eyebrow={eyebrow}
            heading={title}
            headingSize={headingSize}
            buttonScheme={buttonScheme}
            align="center"
            className="mx-auto max-w-[915px]"
          />
        )}

        <div
          className="relative mx-auto w-full max-w-[920px]"
          role="region"
          aria-roledescription="carousel"
          aria-label={title ?? "Video testimonials"}
        >
          <ArrowButton
            direction="prev"
            variant="secondary"
            colorScheme={buttonScheme}
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 z-30 -translate-y-1/2 max-lg:-left-2"
          />

          <ArrowButton
            direction="next"
            variant="secondary"
            colorScheme={buttonScheme}
            onClick={goNext}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 z-30 -translate-y-1/2 max-lg:-right-2"
          />

          <div
            ref={carouselRef}
            className="relative mx-auto h-[640px] max-w-[360px] px-20 max-lg:px-14"
          >
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
                    !isActive && "cursor-pointer",
                  )}
                  style={{ zIndex }}
                  animate={offsetMotion(offset, reduceMotion)}
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
                  <VideoTestimonialCard
                    item={item}
                    isActive={isActive}
                    canAutoplay={canAutoplay}
                  />
                </motion.div>
              );
            })}
          </div>

          {activeItem ? (
            <p
              aria-live="polite"
              className="mx-auto mt-6 max-w-[360px] text-center text-sm italic text-[var(--section-text)]/65"
            >
              {activeItem.caption}
            </p>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

export default VideoTestimonialsCarouselSection;
