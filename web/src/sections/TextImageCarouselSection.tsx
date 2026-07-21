import { TextImage, type TextImageItem } from "@/components/ui/TextImage";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/motion";
import { scrollTrackToIndex, useScrollDrivenIndex } from "@/lib/useScrollDrivenIndex";
import type { ImagePosition, SectionCardColor, SectionProps, SectionTheme } from "@/lib/types";
import { useCallback, useRef } from "react";
import { SectionLayout } from "./SectionLayout";
import { SectionShell } from "./SectionShell";

export type { TextImageItem };

/** Viewport heights of scroll distance while the carousel stays pinned */
const DEFAULT_SCROLL_STEP_VH = 100;

export interface TextImageCarouselSectionProps extends SectionProps {
  theme?: SectionTheme;
  eyebrow?: string;
  isCard?: boolean;
  cardColor?: SectionCardColor;
  items: TextImageItem[];
  imagePosition?: ImagePosition;
  /** Uncontrolled initial slide */
  defaultIndex?: number;
  /** Pin the carousel and advance slides as the user scrolls */
  advanceOnScroll?: boolean;
  /** Scroll depth per slide while pinned (in viewport heights) */
  scrollStepVh?: number;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
}

export function TextImageCarouselSection({
  theme = "light",
  isCard = false,
  cardColor = "surface",
  eyebrow,
  items,
  imagePosition = "left",
  defaultIndex = 0,
  advanceOnScroll = true,
  scrollStepVh = DEFAULT_SCROLL_STEP_VH,
  autoAdvance = false,
  autoAdvanceMs,
  className,
  id,
  flushTop,
  flushBottom,
  transparentBg,
}: TextImageCarouselSectionProps) {
  const trackRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const useScrollControl = advanceOnScroll && items.length > 1 && !reduceMotion;
  const scrollIndex = useScrollDrivenIndex(
    trackRef,
    items.length,
    useScrollControl,
  );

  const handleIndexSelect = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || !useScrollControl) return;
      scrollTrackToIndex(track, index, items.length, lenis);
    },
    [items.length, lenis, useScrollControl],
  );

  const carousel = (
    <TextImage
      eyebrow={eyebrow}
      items={items}
      imagePosition={imagePosition}
      defaultIndex={defaultIndex}
      activeIndex={useScrollControl ? scrollIndex : undefined}
      onActiveIndexChange={useScrollControl ? handleIndexSelect : undefined}
      autoAdvance={autoAdvance && !useScrollControl}
      autoAdvanceMs={autoAdvanceMs}
      isCard={isCard}
      pinnedLayout={useScrollControl}
    />
  );

  const carouselContent = isCard ? (
    <SectionLayout
      layout="vertical"
      isCard={isCard}
      cardColor={cardColor}
      sectionTheme={theme}
      textSlotClassName="w-full"
      contentSlot={carousel}
    />
  ) : (
    carousel
  );

  if (useScrollControl) {
    return (
      <section
        ref={trackRef}
        id={id}
        data-section=""
        data-theme={theme}
        style={{ height: `${items.length * scrollStepVh}vh` }}
        className={cn(
          "relative overflow-visible text-[var(--section-text)]",
          transparentBg ? "bg-transparent" : "bg-[var(--section-bg)]",
          className,
        )}
      >
        <div
          className={cn(
            "sticky top-0 z-[1] flex h-svh w-full items-center justify-center px-6 lg:px-24",
            transparentBg ? "bg-transparent" : "bg-[var(--section-bg)]",
          )}
        >
          <div className="@container mx-auto w-full max-w-6xl">{carouselContent}</div>
        </div>
      </section>
    );
  }

  return (
    <SectionShell
      theme={theme}
      className={className}
      id={id}
      flushTop={flushTop}
      flushBottom={flushBottom}
      transparentBg={transparentBg}
    >
      <SectionLayout
        layout="vertical"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        textSlotClassName="w-full"
        contentSlot={carousel}
      />
    </SectionShell>
  );
}

export default TextImageCarouselSection;
