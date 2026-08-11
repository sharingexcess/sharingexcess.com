import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { computeEdgeShimmerReveal } from "@/lib/archScroll";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, type RefObject } from "react";
import { HalftoneStaticEdgeShimmerEngine } from "./halftoneStaticEdgeShimmer";
import type { RippleContentMask } from "./heroHalftoneRipple";
import "./heroBackgroundPulse.css";

export interface DotGridEdgeShimmerProps {
  className?: string;
  active?: boolean;
  archTop?: boolean;
  /** Section content — static oval is sized around this bounds */
  contentMaskRef?: RefObject<HTMLElement | null>;
}

/** Extra padding so the calm oval reads larger than the content block */
const MASK_INFLATE_X = 64;
const MASK_INFLATE_Y = 88;

function resolveContentMask(
  overlay: HTMLElement,
  contentEl: HTMLElement | null,
): RippleContentMask | null {
  if (!contentEl) return null;

  const overlayRect = overlay.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();

  if (contentRect.width <= 0 || contentRect.height <= 0) return null;

  return {
    left: contentRect.left - overlayRect.left - MASK_INFLATE_X,
    top: contentRect.top - overlayRect.top - MASK_INFLATE_Y,
    right: contentRect.right - overlayRect.left + MASK_INFLATE_X,
    bottom: contentRect.bottom - overlayRect.top + MASK_INFLATE_Y,
  };
}

export function DotGridEdgeShimmer({
  className,
  active = true,
  archTop = false,
  contentMaskRef,
}: DotGridEdgeShimmerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const contentMaskRefRef = useRef(contentMaskRef);
  const lenis = useLenis();
  const [reduceMotion, setReduceMotion] = useState(false);

  activeRef.current = active;
  contentMaskRefRef.current = contentMaskRef;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new HalftoneStaticEdgeShimmerEngine();
    let raf = 0;
    let running = true;
    let animating = false;
    let isIntersecting = true;
    let isDocVisible = document.visibilityState === "visible";
    let logicalWidth = 0;
    let logicalHeight = 0;
    let reveal = archTop ? 0 : 1;

    const syncContentMask = () => {
      const mask = resolveContentMask(
        overlay,
        contentMaskRefRef.current?.current ?? null,
      );
      engine.setContentMask(mask);
    };

    const updateReveal = () => {
      const section = overlay.closest("section");
      if (!section) {
        reveal = 1;
        return;
      }
      reveal = computeEdgeShimmerReveal(section);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = overlay.getBoundingClientRect();
      logicalWidth = rect.width;
      logicalHeight = rect.height;
      canvas.width = Math.round(logicalWidth * dpr);
      canvas.height = Math.round(logicalHeight * dpr);
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.rebuild(logicalWidth, logicalHeight, dpr);
      syncContentMask();
      updateReveal();

      if (!animating) {
        engine.draw(ctx, logicalWidth, logicalHeight, performance.now(), reveal);
      }
    };

    const stopLoop = () => {
      animating = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const drawFrame = (now: number) => {
      if (logicalWidth <= 0 || logicalHeight <= 0) return;
      syncContentMask();
      engine.draw(ctx, logicalWidth, logicalHeight, now, reveal);
    };

    const frame = (now: number) => {
      if (!running) return;

      if (!isIntersecting || !isDocVisible) {
        stopLoop();
        return;
      }

      if (!activeRef.current || reveal <= 0.004) {
        stopLoop();
        if (reveal > 0) drawFrame(now);
        return;
      }

      drawFrame(now);
      raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (!running || animating) return;
      if (!isIntersecting || !isDocVisible || !activeRef.current) return;
      if (logicalWidth <= 0 || logicalHeight <= 0) return;
      if (reveal <= 0.004) return;

      animating = true;
      raf = requestAnimationFrame(frame);
    };

    const syncPlayback = () => {
      updateReveal();

      if (activeRef.current && isIntersecting && isDocVisible) {
        if (reveal <= 0.004) {
          stopLoop();
          drawFrame(performance.now());
        } else {
          startLoop();
        }
      } else {
        stopLoop();
        if (isIntersecting && isDocVisible) {
          drawFrame(performance.now());
        }
      }
    };

    const onScroll = () => {
      syncPlayback();
    };

    const ro = new ResizeObserver(() => {
      resize();
      syncPlayback();
    });
    ro.observe(overlay);

    const contentEl = contentMaskRefRef.current?.current;
    if (contentEl) {
      ro.observe(contentEl);
    }

    resize();

    if (lenis) {
      lenis.on("scroll", onScroll);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll);

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry?.isIntersecting ?? false;
        syncPlayback();
      },
      { root: null, threshold: 0 },
    );
    io.observe(overlay);

    const onVisibilityChange = () => {
      isDocVisible = document.visibilityState === "visible";
      syncPlayback();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    syncPlayback();

    return () => {
      running = false;
      stopLoop();
      ro.disconnect();
      io.disconnect();
      if (lenis) {
        lenis.off("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [archTop, lenis, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "hero-bg-pulse-overlay",
        archTop &&
          "lg:top-[calc(-1*var(--arch-rise,180px))] lg:h-[calc(100%+var(--arch-rise,180px))]",
        "!z-[1]",
        className,
      )}
      aria-hidden
    >
      <canvas ref={canvasRef} className="hero-bg-pulse-canvas" />
    </div>
  );
}

/** @deprecated Use DotGridEdgeShimmer */
export const DotGridBackgroundBlips = DotGridEdgeShimmer;

export default DotGridEdgeShimmer;
