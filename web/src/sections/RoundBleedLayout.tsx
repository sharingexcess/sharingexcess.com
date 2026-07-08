import { RoundImageCircle } from "@/components/ui/RoundImageCircle";
import { useScrollInteractionsEnabled } from "@/components/providers/AppProviders";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import {
  motion,
  motionEase,
  roundImageBleedGlideVariants,
  roundImageGlideVariants,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "@/lib/motion";
import { getSiteHeaderHeight } from "@/lib/roundSectionScroll";
import { useSnapSectionThenReveal } from "@/lib/useSnapSectionThenReveal";
import type { ImagePosition } from "@/lib/types";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

/** Scroll distance (px) over which the circle fully morphs to a rounded square. */
const MORPH_DISTANCE_PX = 360;
/** Morph delay for image sections — matches original design intent. */
const IMAGE_MORPH_DELAY_PX = 180;
/** Morph delay for the interactive map — starts immediately after snap so there's no dead zone. */
const MAP_MORPH_DELAY_PX = 60;
/** Map only: how far below the header (px) before the circle starts / finishes fading out. */
const MAP_FADE_OUT_START_PX = -40;
const MAP_FADE_OUT_END_PX = -120;

export interface RoundBleedLayoutProps {
  /** Which side the circle bleeds from at lg+ */
  position: ImagePosition;
  textSection: ReactNode;
  /** Circle contents — map, image, etc. Should fill its container (`size-full`). */
  children: ReactNode;
  /** Optional caption below the circle (mobile) / over the visible arc (desktop) */
  caption?: ReactNode;
  /** Enable pointer events on the bleed circle (maps, interactive media) */
  interactive?: boolean;
  /** Scale glide for photos; bleed glide (translate only) for maps */
  glideMode?: "scale" | "bleed";
}

export function RoundBleedLayout({
  position,
  textSection,
  children,
  caption,
  interactive = false,
  glideMode = "scale",
}: RoundBleedLayoutProps) {
  const onLeft = position === "left";
  const viewRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const { revealed, isSnapping } = useSnapSectionThenReveal(viewRef);
  // Mobile: reveal image + text together when the stack scrolls into view.
  const mobileInView = useInView(mobileRef, { once: true, amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const showContent = (revealed && !isSnapping) || reduceMotion;

  // Scroll-driven morph: circle → same size/position as the horizontal square image slot.
  //
  // All % values are relative to the max-w-6xl container (the absolute-position parent).
  //   width:  107.8% → 47.2%  (circle full-bleed → right col of grid-cols-2 gap-16 in 1152px = 544px)
  //   edge:  -58.6%  →  0%   (bleed offset → flush with container edge)
  //   top:    50%    →  0%   (vertically centred in 100dvh → top of content area)
  //   y:     -50%    →  0%   (offset half-height → no offset)
  //   borderRadius: 50%→10% (circle → rounded-square proportional to element size)
  const isMapMode = glideMode === "bleed";
  const morphDelay = isMapMode ? MAP_MORPH_DELAY_PX : IMAGE_MORPH_DELAY_PX;

  const lenis = useLenis();
  const scrollInteractions = useScrollInteractionsEnabled();
  const morphProgress = useMotionValue(0);
  // Map only: raw scrolledPast so we can fade the circle out as the user scrolls
  // back up — prevents the large circle from peeking into the section above.
  const scrolledPastRaw = useMotionValue(0);

  const wrapperWidth  = useTransform(morphProgress, [0, 1], ["107.8%", "47.2%"]);
  const wrapperEdge   = useTransform(morphProgress, [0, 1], ["-58.6%", "0%"]);
  const wrapperTop    = useTransform(morphProgress, [0, 1], ["50%",    "0%"]);
  const wrapperY      = useTransform(morphProgress, [0, 1], ["-50%",   "0%"]);
  const borderRadiusPct = useTransform(morphProgress, [0, 1], [50, 10]);
  const borderRadius    = useTransform(borderRadiusPct, v => `${v}%`);
  const wrapperOpacity = useTransform(
    scrolledPastRaw,
    [MAP_FADE_OUT_END_PX, MAP_FADE_OUT_START_PX],
    [0, 1],
  );

  useEffect(() => {
    if (!revealed || !lenis || !scrollInteractions || reduceMotion) return;

    const update = () => {
      const el = viewRef.current?.closest("section") ?? viewRef.current;
      if (!el) return;
      const scrolledPast = getSiteHeaderHeight() - el.getBoundingClientRect().top;
      if (isMapMode) scrolledPastRaw.set(scrolledPast);
      morphProgress.set(Math.max(0, Math.min(1, (scrolledPast - morphDelay) / MORPH_DISTANCE_PX)));
    };

    lenis.on("scroll", update);
    update();
    return () => lenis.off("scroll", update);
  }, [revealed, lenis, scrollInteractions, reduceMotion, morphProgress, scrolledPastRaw, isMapMode, morphDelay]);

  const textReveal = reduceMotion ? (
    textSection
  ) : (
    <motion.div
      initial={false}
      animate={{ opacity: showContent ? 1 : 0 }}
      transition={{ duration: 0.45, ease: motionEase }}
      aria-hidden={!showContent}
    >
      {textSection}
    </motion.div>
  );

  const circleVariants =
    glideMode === "bleed"
      ? roundImageBleedGlideVariants(onLeft)
      : roundImageGlideVariants(onLeft);

  const captionEl = caption ? (
    <p className="text-center text-xs italic opacity-64 text-[var(--section-text)]">{caption}</p>
  ) : null;

  return (
    <div ref={viewRef}>
      {/* Mobile: image + text reveal together on scroll-into-view, no snap, no morph */}
      <div ref={mobileRef} className="flex flex-col gap-8 lg:hidden">
        <div className="flex flex-col gap-2">
          <RoundImageCircle
            imagePosition={position}
            inView={reduceMotion ? true : mobileInView}
            glideMode={glideMode}
          >
            {children}
          </RoundImageCircle>
          {captionEl}
        </div>
        {reduceMotion ? textSection : (
          <motion.div
            initial={false}
            animate={{ opacity: mobileInView ? 1 : 0 }}
            transition={{ duration: 0.45, ease: motionEase }}
          >
            {textSection}
          </motion.div>
        )}
      </div>

      {/* Desktop: circle bleeds off section edge — Figma 1215:2580 proportions */}
      <div
        className={cn(
          "relative hidden lg:flex lg:items-center",
          "lg:min-h-[calc(100dvh-var(--site-header-height))]",
        )}
      >
        <div
          className={cn(
            "relative z-10 max-w-[47.6%]",
            onLeft ? "ml-auto lg:ps-16" : "mr-auto lg:pe-16",
          )}
        >
          {textReveal}
        </div>

        <motion.div
          className={cn(
            "absolute aspect-square",
            interactive ? "pointer-events-auto" : "pointer-events-none",
          )}
          style={{
            width: wrapperWidth,
            top: wrapperTop,
            y: wrapperY,
            ...(isMapMode && { opacity: wrapperOpacity }),
            ...(onLeft ? { left: wrapperEdge } : { right: wrapperEdge }),
          }}
        >
          <motion.div
            className="size-full overflow-hidden"
            style={{ borderRadius }}
            variants={circleVariants}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
          >
            {children}
          </motion.div>
          {caption && (
            <p
              className={cn(
                "pointer-events-none absolute bottom-[6%] z-10 max-w-[280px] text-center text-xs italic opacity-64 text-[var(--section-text)]",
                onLeft ? "left-[14%]" : "right-[14%]",
              )}
            >
              {caption}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default RoundBleedLayout;
