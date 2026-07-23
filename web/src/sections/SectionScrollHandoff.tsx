import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { measureDepthFadeProgress } from "@/lib/sectionScrollFade";
import { motion, useMotionValue, useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type FadeTone = "light" | "dark";

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

export interface SectionScrollHandoffProps extends SectionScrollFadePhase {
  children: ReactNode;
  className?: string;
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
  const startRatio =
    startVh != null ? (startVh * vhPx) / totalHeight : (start ?? 0);
  const endRatio = endVh != null ? (endVh * vhPx) / totalHeight : (end ?? 1);
  return measureDepthFadeProgress(scrollDepth, totalHeight, startRatio, endRatio);
}

function initialOverlayOpacity(fadeFrom: FadeTone, fadeTo: FadeTone): number {
  if (fadeFrom === fadeTo) return 0;
  return 0;
}

function overlayTone(fadeFrom: FadeTone, fadeTo: FadeTone): FadeTone | null {
  if (fadeFrom === fadeTo) return null;
  if (fadeFrom === "dark" && fadeTo === "light") return "light";
  if (fadeFrom === "light" && fadeTo === "dark") return "dark";
  return null;
}

function toneClassName(tone: FadeTone): string {
  return tone === "dark" ? "bg-kale" : "bg-[var(--color-neutral-000)]";
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
  secondFade,
}: SectionScrollHandoffProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const primaryFade = useScrollFadeOpacity(
    wrapperRef,
    { fadeFrom, fadeTo, fadeStart, fadeEnd, fadeStartVh, fadeEndVh },
    true,
  );
  const secondaryFade = useScrollFadeOpacity(wrapperRef, secondFade ?? {}, Boolean(secondFade));

  const baseIsDark = fadeFrom === "dark";

  return (
    <div ref={wrapperRef} className={cn("relative isolate", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          baseIsDark ? "bg-kale" : "bg-[var(--color-neutral-000)]",
        )}
      />
      {primaryFade.tone && (
        <motion.div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 z-0", toneClassName(primaryFade.tone))}
          style={{ opacity: primaryFade.opacity }}
        />
      )}
      {secondaryFade.tone && (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-0",
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
