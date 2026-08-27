import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { computeEdgeShimmerReveal } from "@/lib/archScroll";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, type RefObject } from "react";
import { HalftoneStaticEdgeShimmerEngine } from "./halftoneStaticEdgeShimmer";
import type {
  HalftoneRippleViewportProfile,
  RippleContentMask,
} from "./heroHalftoneRipple";
import "./heroBackgroundPulse.css";

export interface DotGridEdgeShimmerProps {
  className?: string;
  active?: boolean;
  archTop?: boolean;
  /** Fade in/out based on scroll position — off for sections that should always show shimmer */
  scrollReveal?: boolean;
  /** Section content — static oval is sized around this bounds */
  contentMaskRef?: RefObject<HTMLElement | null>;
  /** Size the oval from the viewport instead of content bounds */
  fullBleed?: boolean;
  viewportProfile?: HalftoneRippleViewportProfile;
  shimmerColors?: readonly string[];
  /** Horizontal padding around content mask — widens oval without stretching height */
  maskInflateX?: number;
  /** Vertical padding around content mask */
  maskInflateY?: number;
}

/** Extra padding so the calm oval reads larger than the content block */
const MASK_INFLATE_X = 64;
const MASK_INFLATE_Y = 88;
const MOBILE_MQ = "(max-width: 1023px)";
/** Tighter mask on portrait screens — large desktop inflate values hide the edge band */
const MOBILE_MASK_INFLATE_X = 36;
const MOBILE_MASK_INFLATE_Y = 48;

function resolveContentMask(
  overlay: HTMLElement,
  contentEl: HTMLElement | null,
  inflateX = MASK_INFLATE_X,
  inflateY = MASK_INFLATE_Y,
): RippleContentMask | null {
  if (!contentEl) return null;

  const overlayRect = overlay.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();

  if (contentRect.width <= 0 || contentRect.height <= 0) return null;

  const isMobile = window.matchMedia(MOBILE_MQ).matches;
  const resolvedInflateX = isMobile ? Math.min(inflateX, MOBILE_MASK_INFLATE_X) : inflateX;
  const resolvedInflateY = isMobile ? Math.min(inflateY, MOBILE_MASK_INFLATE_Y) : inflateY;

  return {
    left: contentRect.left - overlayRect.left - resolvedInflateX,
    top: contentRect.top - overlayRect.top - resolvedInflateY,
    right: contentRect.right - overlayRect.left + resolvedInflateX,
    bottom: contentRect.bottom - overlayRect.top + resolvedInflateY,
  };
}

function resolveMobileRoundContentMask(
  overlay: HTMLElement,
  contentEl: HTMLElement | null,
): RippleContentMask | null {
  if (!contentEl) return null;

  const overlayRect = overlay.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();

  if (contentRect.width <= 0 || contentRect.height <= 0) return null;

  const inflate = 44;

  return {
    left: contentRect.left - overlayRect.left - inflate,
    top: contentRect.top - overlayRect.top - inflate,
    right: contentRect.right - overlayRect.left + inflate,
    bottom: contentRect.bottom - overlayRect.top + inflate,
  };
}

function resolveEffectiveViewportProfile(
  mobile: boolean,
  fullBleed: boolean,
  hasContentMask: boolean,
  requested: HalftoneRippleViewportProfile,
): HalftoneRippleViewportProfile {
  if (requested === "full-bleed") return "full-bleed";
  if (mobile && !fullBleed && hasContentMask) return "mobile-round";
  return requested;
}

function resolveViewportBleedMask(overlay: HTMLElement): RippleContentMask {
  const rect = overlay.getBoundingClientRect();
  const insetX = rect.width * 0.04;
  const insetY = rect.height * 0.04;

  return {
    left: insetX,
    top: insetY,
    right: rect.width - insetX,
    bottom: rect.height - insetY,
  };
}

export function DotGridEdgeShimmer({
  className,
  active = true,
  archTop = false,
  scrollReveal = true,
  contentMaskRef,
  fullBleed = false,
  viewportProfile = "default",
  shimmerColors,
  maskInflateX = MASK_INFLATE_X,
  maskInflateY = MASK_INFLATE_Y,
}: DotGridEdgeShimmerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const contentMaskRefRef = useRef(contentMaskRef);
  const fullBleedRef = useRef(fullBleed);
  const viewportProfileRef = useRef(viewportProfile);
  const shimmerColorsRef = useRef(shimmerColors);
  const maskInflateXRef = useRef(maskInflateX);
  const maskInflateYRef = useRef(maskInflateY);
  const lenis = useLenis();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [mobileShimmer, setMobileShimmer] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches,
  );

  activeRef.current = active;
  contentMaskRefRef.current = contentMaskRef;
  fullBleedRef.current = fullBleed;
  viewportProfileRef.current = viewportProfile;
  shimmerColorsRef.current = shimmerColors;
  maskInflateXRef.current = maskInflateX;
  maskInflateYRef.current = maskInflateY;

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setMobileShimmer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

    const hasContentMask = Boolean(contentMaskRefRef.current);
    const effectiveProfile = resolveEffectiveViewportProfile(
      mobileShimmer,
      fullBleedRef.current,
      hasContentMask,
      viewportProfileRef.current,
    );

    const engineOptions =
      effectiveProfile === "full-bleed"
        ? {
            viewportProfile: "full-bleed" as const,
            edgeBandCenter: 1.02,
            edgeBandSigma: 0.24,
            rippleColors: shimmerColorsRef.current,
          }
        : effectiveProfile === "mobile-round"
          ? {
              viewportProfile: "mobile-round" as const,
              edgeBandCenter: 0.94,
              edgeBandSigma: 0.2,
              rippleColors: shimmerColorsRef.current,
            }
          : {
              viewportProfile: effectiveProfile,
              rippleColors: shimmerColorsRef.current,
            };

    const engine = new HalftoneStaticEdgeShimmerEngine(engineOptions);
    let raf = 0;
    let running = true;
    let animating = false;
    let isIntersecting = true;
    let isDocVisible = document.visibilityState === "visible";
    let logicalWidth = 0;
    let logicalHeight = 0;
    let reveal = archTop ? 0 : 1;

    const syncContentMask = () => {
      const contentEl = contentMaskRefRef.current?.current ?? null;
      const useMobileRoundMask =
        mobileShimmer && !fullBleedRef.current && Boolean(contentEl);
      const mask = fullBleedRef.current
        ? resolveViewportBleedMask(overlay)
        : useMobileRoundMask
          ? resolveMobileRoundContentMask(overlay, contentEl)
          : resolveContentMask(
              overlay,
              contentEl,
              maskInflateXRef.current,
              maskInflateYRef.current,
            );

      engine.setContentMask(mask);
      engine.setViewportProfile(effectiveProfile);
    };

    const updateReveal = () => {
      if (!scrollReveal) {
        reveal = 1;
        return;
      }
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

    if (scrollReveal) {
      if (lenis) {
        lenis.on("scroll", onScroll);
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
      }
      window.addEventListener("resize", onScroll);
    }

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
      if (scrollReveal) {
        if (lenis) {
          lenis.off("scroll", onScroll);
        } else {
          window.removeEventListener("scroll", onScroll);
        }
        window.removeEventListener("resize", onScroll);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    archTop,
    lenis,
    reduceMotion,
    scrollReveal,
    fullBleed,
    viewportProfile,
    shimmerColors,
    maskInflateX,
    maskInflateY,
    mobileShimmer,
  ]);

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
