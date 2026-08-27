import { HomeScrollStatementContent } from "@/sections/HomeScrollStatementSection";
import { DotGridEdgeShimmer } from "@/components/ui/DotGridBackgroundBlips";
import { WEIGHTED_EDGE_SHIMMER_COLORS } from "@/components/ui/halftoneStaticEdgeShimmer";
import {
  HomeHeroBackground,
  HomeHeroDonateContent,
  HomeHeroGradients,
  type HeroSectionProps,
} from "@/sections/HeroSection";
import { cn } from "@/lib/cn";
import {
  BRIDGE_DEFAULT_ANIMATION_VH,
  BRIDGE_DEFAULT_HOLD_VH,
  bridgeAnimationFraction,
} from "@/lib/bridgeScrollProgress";
import { useHomeHeroBridgeScrollVars } from "@/lib/useHomeHeroBridgeScrollVars";
import { useReducedMotion } from "@/lib/motion";
import { useRef, type CSSProperties } from "react";

export interface HomeHeroStatementBridgeProps
  extends Pick<
    HeroSectionProps,
    "title" | "body" | "bodyMobile" | "bodySize" | "imageSrc" | "imageAlt" | "videoSrc" | "className" | "id"
  > {
  header: string;
  caption: string;
  emphasis: string;
  /** Scroll track height for hero + statement animation */
  scrollHeightVh?: number;
  /** Extra scroll after all statement text resolves — pinned hold before next section */
  holdScrollVh?: number;
}

/** Unified hero → white statement scroll handoff */
export function HomeHeroStatementBridge({
  title,
  body,
  bodyMobile,
  bodySize,
  imageSrc,
  imageAlt = "",
  videoSrc,
  header,
  caption,
  emphasis,
  scrollHeightVh = BRIDGE_DEFAULT_ANIMATION_VH,
  holdScrollVh = BRIDGE_DEFAULT_HOLD_VH,
  className,
  id,
}: HomeHeroStatementBridgeProps) {
  const trackRef = useRef<HTMLElement>(null);
  const statementContentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scrollFx = !reduceMotion;
  const animationFraction = bridgeAnimationFraction(scrollHeightVh, holdScrollVh);
  const totalScrollVh = scrollHeightVh + holdScrollVh;

  useHomeHeroBridgeScrollVars(trackRef, scrollFx, {
    header,
    whiteFullAtHeaderWords: 4,
    animationFraction,
  });

  if (!imageSrc) {
    throw new Error("HomeHeroStatementBridge requires imageSrc");
  }

  return (
    <section
      ref={trackRef}
      id={id}
      data-home-hero
      data-theme="dark"
      style={
        {
          "--section-emphasis": "var(--color-neutral-000)",
          minHeight: `${totalScrollVh}vh`,
        } as CSSProperties
      }
      className={cn(
        "home-hero-bridge home-hero-donate--scroll-fx relative z-0 overflow-visible",
        className,
      )}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="home-hero-bridge__bg home-hero-donate__bg-wrap absolute inset-0 z-0"
          aria-hidden
        >
          <HomeHeroBackground
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            videoSrc={videoSrc}
          />
        </div>

        <div
          aria-hidden
          className="home-hero-bridge__white pointer-events-none absolute inset-0 z-[1] bg-white"
        />

        <div
          aria-hidden
          className="home-hero-bridge__shimmer pointer-events-none absolute inset-0 z-[2]"
        >
          <DotGridEdgeShimmer
            scrollReveal={false}
            active={scrollFx}
            contentMaskRef={statementContentRef}
            maskInflateX={220}
            shimmerColors={WEIGHTED_EDGE_SHIMMER_COLORS}
            className="!z-0"
          />
        </div>

        <HomeScrollStatementContent
          header={header}
          caption={caption}
          emphasis={emphasis}
          scrollTrackRef={trackRef}
          contentMaskRef={statementContentRef}
          scrollAnimationFraction={animationFraction}
          embedded
          className="home-hero-bridge__statement"
        />

        <div className="home-hero-bridge__hero-layer pointer-events-none absolute inset-0 z-[4]">
          <HomeHeroGradients showTopGradient showBottomGradient={false} />
          <div
            className={cn(
              "pointer-events-auto flex h-full flex-col justify-end",
              scrollFx && "home-hero-donate__content",
            )}
          >
            <HomeHeroDonateContent
              title={title}
              body={body}
              bodyMobile={bodyMobile}
              bodySize={bodySize}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHeroStatementBridge;
