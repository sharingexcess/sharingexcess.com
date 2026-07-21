import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { measureDepthFadeProgress } from "@/lib/sectionScrollFade";
import { motion, useMotionValue, useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, type ReactNode } from "react";

export interface SectionScrollHandoffProps {
  children: ReactNode;
  className?: string;
  /** Background at the start of the handoff zone */
  fadeFrom?: "light" | "dark";
  /** Background at the end of the handoff zone */
  fadeTo?: "light" | "dark";
  /** Wrapper scroll depth (0–1) where the crossfade begins */
  fadeStart?: number;
  /** Wrapper scroll depth (0–1) where the crossfade completes */
  fadeEnd?: number;
  /** Scroll depth in vh where the crossfade begins (overrides fadeStart) */
  fadeStartVh?: number;
  /** Scroll depth in vh where the crossfade completes (overrides fadeEnd) */
  fadeEndVh?: number;
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
}: SectionScrollHandoffProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const overlayOpacity = useMotionValue(fadeFrom === fadeTo ? 0 : fadeFrom === "dark" ? 0 : 1);

  useEffect(() => {
    if (fadeFrom === fadeTo) {
      overlayOpacity.set(0);
      return;
    }

    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollDepth = Math.max(0, -rect.top);
      const vhPx = window.innerHeight / 100;
      const startRatio =
        fadeStartVh != null
          ? (fadeStartVh * vhPx) / rect.height
          : fadeStart;
      const endRatio =
        fadeEndVh != null ? (fadeEndVh * vhPx) / rect.height : fadeEnd;
      const progress = measureDepthFadeProgress(
        scrollDepth,
        rect.height,
        startRatio,
        endRatio,
      );
      overlayOpacity.set(reduceMotion ? (progress >= 1 ? 1 : 0) : progress);
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
  }, [fadeEnd, fadeEndVh, fadeFrom, fadeStart, fadeStartVh, fadeTo, lenis, overlayOpacity, reduceMotion]);

  const baseIsDark = fadeFrom === "dark";
  const overlayIsLight = fadeFrom === "dark" && fadeTo === "light";
  const overlayIsDark = fadeFrom === "light" && fadeTo === "dark";

  return (
    <div ref={wrapperRef} className={cn("relative isolate", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          baseIsDark ? "bg-kale" : "bg-[var(--color-neutral-000)]",
        )}
      />
      {(overlayIsLight || overlayIsDark) && (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-0",
            overlayIsLight ? "bg-[var(--color-neutral-000)]" : "bg-kale",
          )}
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export default SectionScrollHandoff;
