import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { tokenizeScrollBlurWords } from "@/components/ui/ScrollBlurWords";
import { bridgeScrollProgress } from "@/lib/bridgeScrollProgress";
import { useReducedMotion } from "@/lib/motion";
import {
  BRIDGE_HEADER_BLUR_END,
  BRIDGE_HEADER_BLUR_START,
} from "@/sections/HomeScrollStatementSection";
import { useEffect, type RefObject } from "react";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function segmentProgress(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

/** Track progress where header blur progress matches a word-reveal threshold */
function headerBlurTrackForWordReveal(
  wordCount: number,
  wordsRevealed: number,
): number {
  if (wordCount <= 0 || wordsRevealed <= 0) {
    return BRIDGE_HEADER_BLUR_START;
  }

  const headerBlurProgress = Math.min(1, wordsRevealed / wordCount);
  return (
    BRIDGE_HEADER_BLUR_START +
    headerBlurProgress * (BRIDGE_HEADER_BLUR_END - BRIDGE_HEADER_BLUR_START)
  );
}

export type HomeHeroBridgeScrollOptions = {
  /** Statement header — used to align white wash with word reveal */
  header?: string;
  /** White reaches 100% once this many header words are fully revealed */
  whiteFullAtHeaderWords?: number;
  /** Scroll track fraction where animation ends and hold begins */
  animationFraction?: number;
};

/** Scroll track progress → hero handoff CSS vars on the bridge section */
export function useHomeHeroBridgeScrollVars(
  trackRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  options?: HomeHeroBridgeScrollOptions,
) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const headerText = options?.header;
  const whiteFullAtWords = options?.whiteFullAtHeaderWords ?? 4;
  const animationFraction = options?.animationFraction ?? 1;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const headerWordCount = headerText ? tokenizeScrollBlurWords(headerText).length : 11;
    const whiteFullTrack = headerBlurTrackForWordReveal(headerWordCount, whiteFullAtWords);
    const whiteStartTrack = Math.max(0.18, whiteFullTrack - 0.28);
    const shimmerStartTrack = whiteFullTrack + 0.04;
    const shimmerEndTrack = whiteFullTrack + 0.2;

    if (!enabled || reduceMotion) {
      el.style.setProperty("--hero-scroll", "1");
      el.style.setProperty("--hero-content-phase", "1");
      el.style.setProperty("--hero-video-blur", "0");
      el.style.setProperty("--bridge-white-opacity", "1");
      el.style.setProperty("--statement-rise", "1");
      el.style.setProperty("--bridge-shimmer-opacity", "1");
      return;
    }

    let raf = 0;

    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const track = trackRef.current;
        if (!track) return;

        const progress = bridgeScrollProgress(track, animationFraction);
        track.style.setProperty("--hero-scroll", String(progress));
        /* Hero text + donate — fade out over first third of track */
        track.style.setProperty(
          "--hero-content-phase",
          String(segmentProgress(progress, 0, 0.32)),
        );
        /* Video blur — gradual over a long scroll span */
        track.style.setProperty(
          "--hero-video-blur",
          String(segmentProgress(progress, 0.18, 0.72) * 24),
        );
        /* White wash — full once the first N header words resolve */
        track.style.setProperty(
          "--bridge-white-opacity",
          String(segmentProgress(progress, whiteStartTrack, whiteFullTrack)),
        );
        /* Statement rises into place as handoff connects hero → white section */
        track.style.setProperty(
          "--statement-rise",
          String(segmentProgress(progress, 0.18, 0.62)),
        );
        /* Halftone shimmer — fades in once white is fully opaque */
        track.style.setProperty(
          "--bridge-shimmer-opacity",
          String(segmentProgress(progress, shimmerStartTrack, shimmerEndTrack)),
        );
      });
    };

    update();

    if (lenis) {
      lenis.on("scroll", update);
      lenis.on("virtual-scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", update);
    document.addEventListener("astro:after-swap", update);

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
        lenis.off("virtual-scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      document.removeEventListener("astro:after-swap", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [
    animationFraction,
    enabled,
    headerText,
    lenis,
    reduceMotion,
    trackRef,
    whiteFullAtWords,
  ]);
}
