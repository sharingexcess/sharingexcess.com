import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { resolveHandoffFadeProgress } from "@/lib/sectionScrollHandoffMeasure";
import { motion, useMotionValue, useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type FadeTone = "light" | "dark" | "green";

export interface SectionScrollFadePhase {
  fadeFrom?: FadeTone;
  fadeTo?: FadeTone;
  /** Wrapper scroll depth (0–1) where the crossfade begins */
  fadeStart?: number;
  /** Wrapper scroll depth (0–1) where the crossfade completes */
  fadeEnd?: number;
  /** Scroll depth in vh where the crossfade begins (overrides fadeStart) */
  fadeStartVh?: number;
  /** Scroll depth in vh where the crossfade completes (overrides fadeEnd) */
  fadeEndVh?: number;
}

/** Matches SiteFooter negative margin overlap — keeps handoff bg visible behind rounded footer top */
const FOOTER_OVERLAP_BLEED_CLASS = "-bottom-16 lg:-bottom-24";
const FOOTER_OVERLAP_PAD_CLASS = "pb-16 lg:pb-24";

export interface SectionScrollHandoffProps extends SectionScrollFadePhase {
  children: ReactNode;
  className?: string;
  /** Extra bottom padding + background bleed for footer overlap on the home page */
  extendForFooter?: boolean;
  /** Optional second crossfade within the same scroll zone (e.g. white → green before map) */
  secondFade?: SectionScrollFadePhase;
}

function resolveFadeRatio(
  scrollDepth: number,
  totalHeight: number,
  start: number | undefined,
  end: number | undefined,
  startVh: number | undefined,
  endVh: number | undefined,
  vhPx: number,
): number {
  return resolveHandoffFadeProgress(
    scrollDepth,
    totalHeight,
    start,
    end,
    startVh,
    endVh,
    vhPx,
  );
}

function initialOverlayOpacity(fadeFrom: FadeTone, fadeTo: FadeTone): number {
  if (fadeFrom === fadeTo) return 0;
  return 0;
}

function overlayTone(fadeFrom: FadeTone, fadeTo: FadeTone): FadeTone | null {
  if (fadeFrom === fadeTo) return null;
  return fadeTo;
}

function toneClassName(tone: FadeTone): string {
  switch (tone) {
    case "dark":
      return "bg-kale";
    case "green":
      return "bg-se-green-100";
    case "light":
      return "bg-[var(--color-neutral-000)]";
  }
}

function useScrollFadeOpacity(
  wrapperRef: RefObject<HTMLDivElement | null>,
  phase: SectionScrollFadePhase,
  enabled: boolean,
) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const fadeFrom = phase.fadeFrom ?? "dark";
  const fadeTo = phase.fadeTo ?? "light";
  const opacity = useMotionValue(initialOverlayOpacity(fadeFrom, fadeTo));

  useEffect(() => {
    if (!enabled || fadeFrom === fadeTo) {
      opacity.set(0);
      return;
    }

    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollDepth = Math.max(0, -rect.top);
      const vhPx = window.innerHeight / 100;
      const progress = resolveFadeRatio(
        scrollDepth,
        rect.height,
        phase.fadeStart,
        phase.fadeEnd,
        phase.fadeStartVh,
        phase.fadeEndVh,
        vhPx,
      );
      opacity.set(reduceMotion ? (progress >= 1 ? 1 : 0) : progress);
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
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, [
    enabled,
    fadeFrom,
    fadeTo,
    lenis,
    opacity,
    phase.fadeEnd,
    phase.fadeEndVh,
    phase.fadeStart,
    phase.fadeStartVh,
    reduceMotion,
    wrapperRef,
  ]);

  return { opacity, tone: overlayTone(fadeFrom, fadeTo) };
}

/**
 * Phantom-style scroll handoff — crossfades a shared background across wrapped
 * sections as the user scrolls (e.g. dark hero → light follower).
 */
export function SectionScrollHandoff({
  children,
  className,
  fadeFrom = "dark",
  fadeTo = "light",
  fadeStart = 0.28,
  fadeEnd = 0.4,
  fadeStartVh,
  fadeEndVh,
  extendForFooter = false,
  secondFade,
}: SectionScrollHandoffProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const primaryFade = useScrollFadeOpacity(
    wrapperRef,
    { fadeFrom, fadeTo, fadeStart, fadeEnd, fadeStartVh, fadeEndVh },
    true,
  );
  const secondaryFade = useScrollFadeOpacity(wrapperRef, secondFade ?? {}, Boolean(secondFade));
  const bgInsetClass = extendForFooter
    ? cn("inset-x-0 top-0", FOOTER_OVERLAP_BLEED_CLASS)
    : "inset-0";

  return (
    <div
      ref={wrapperRef}
      data-section-scroll-handoff
      data-fade-from={fadeFrom}
      data-fade-to={fadeTo}
      data-fade-start={fadeStart}
      data-fade-end={fadeEnd}
      {...(fadeStartVh != null ? { "data-fade-start-vh": fadeStartVh } : {})}
      {...(fadeEndVh != null ? { "data-fade-end-vh": fadeEndVh } : {})}
      data-has-second-fade={secondFade ? "true" : "false"}
      {...(secondFade?.fadeFrom ? { "data-second-fade-from": secondFade.fadeFrom } : {})}
      {...(secondFade?.fadeTo ? { "data-second-fade-to": secondFade.fadeTo } : {})}
      {...(secondFade?.fadeStart != null ? { "data-second-fade-start": secondFade.fadeStart } : {})}
      {...(secondFade?.fadeEnd != null ? { "data-second-fade-end": secondFade.fadeEnd } : {})}
      {...(secondFade?.fadeStartVh != null ? { "data-second-fade-start-vh": secondFade.fadeStartVh } : {})}
      {...(secondFade?.fadeEndVh != null ? { "data-second-fade-end-vh": secondFade.fadeEndVh } : {})}
      className={cn(
        "relative isolate",
        extendForFooter && FOOTER_OVERLAP_PAD_CLASS,
        className,
      )}
    >
      <div
        aria-hidden
        className={cn("pointer-events-none absolute z-0", bgInsetClass, toneClassName(fadeFrom))}
      />
      {primaryFade.tone && (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-0",
            bgInsetClass,
            toneClassName(primaryFade.tone),
          )}
          style={{ opacity: primaryFade.opacity }}
        />
      )}
      {secondaryFade.tone && (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-0",
            bgInsetClass,
            toneClassName(secondaryFade.tone),
          )}
          style={{ opacity: secondaryFade.opacity }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export default SectionScrollHandoff;
