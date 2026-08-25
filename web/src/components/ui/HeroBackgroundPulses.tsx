import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { HeroMobileViewportShimmerEngine } from "./heroMobileViewportShimmer";
import {
  HalftoneRippleEngine,
  type HalftoneRippleViewportProfile,
  type RippleContentMask,
  type RippleOrigin,
} from "./heroHalftoneRipple";
import "./heroBackgroundPulse.css";

function resolveHeroRippleViewportProfile(
  overlay: HTMLElement,
): HalftoneRippleViewportProfile {
  const isStackedHomeHero = Boolean(overlay.closest(".home-hero-donate--stacked"));
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;
  return isStackedHomeHero && isMobile ? "mobile-hero" : "default";
}

function isMobileHeroShimmer(overlay: HTMLElement): boolean {
  return resolveHeroRippleViewportProfile(overlay) === "mobile-hero";
}

export interface HeroBackgroundPulsesProps {
  /** When false, only the faint base grid shows — ripples start once this turns true */
  active?: boolean;
  /** Mobile shimmer — fades the overlay in once hero intro content has settled */
  entered?: boolean;
  /** Hero intro content — ripples are masked inside this element's bounds */
  contentMaskRef?: RefObject<HTMLElement | null>;
  /** Desktop ripples only — ignored on mobile shimmer */
  rippleOriginRef?: RefObject<HTMLElement | null>;
}

function resolveRippleOrigin(
  _overlay: HTMLElement,
  _originEl: HTMLElement | null,
  profile: HalftoneRippleViewportProfile,
): RippleOrigin | null {
  // Mobile uses viewport shimmer; desktop ripples emit from the content mask center.
  if (profile !== "default") return null;
  return null;
}

function resolveContentMask(
  overlay: HTMLElement,
  contentEl: HTMLElement | null,
): RippleContentMask | null {
  if (!contentEl) return null;

  const overlayRect = overlay.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();

  if (contentRect.width <= 0 || contentRect.height <= 0) return null;

  const isMobileTextMask = Boolean(
    contentEl.hasAttribute("data-hero-text-mask") &&
      window.matchMedia("(max-width: 1023px)").matches,
  );

  if (isMobileTextMask) {
    const inflateX = 30;
    const inflateYTop = 12;
    const inflateYBottom = 10;

    return {
      left: contentRect.left - overlayRect.left - inflateX,
      top: contentRect.top - overlayRect.top - inflateYTop,
      right: contentRect.right - overlayRect.left + inflateX,
      bottom: contentRect.bottom - overlayRect.top + inflateYBottom,
    };
  }

  return {
    left: contentRect.left - overlayRect.left,
    top: contentRect.top - overlayRect.top,
    right: contentRect.right - overlayRect.left,
    bottom: contentRect.bottom - overlayRect.top,
  };
}

export function HeroBackgroundPulses({
  active = true,
  entered = true,
  contentMaskRef,
  rippleOriginRef,
}: HeroBackgroundPulsesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const contentMaskRefRef = useRef(contentMaskRef);
  const rippleOriginRefRef = useRef(rippleOriginRef);
  const syncPlaybackRef = useRef<(() => void) | null>(null);
  const reduceMotion = useReducedMotion();
  const [mobileShimmer, setMobileShimmer] = useState(false);

  activeRef.current = active;
  contentMaskRefRef.current = contentMaskRef;
  rippleOriginRefRef.current = rippleOriginRef;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      const overlay = overlayRef.current;
      setMobileShimmer(Boolean(overlay && isMobileHeroShimmer(overlay)));
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    syncPlaybackRef.current?.();
  }, [active]);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const useShimmer = isMobileHeroShimmer(overlay);
    const shimmerEngine = useShimmer ? new HeroMobileViewportShimmerEngine() : null;
    const rippleEngine = useShimmer ? null : new HalftoneRippleEngine();

    let raf = 0;
    let running = true;
    let animating = false;
    let isIntersecting = true;
    let isDocVisible = document.visibilityState === "visible";
    let logicalWidth = 0;
    let logicalHeight = 0;

    const syncMask = () => {
      const mask = resolveContentMask(
        overlay,
        contentMaskRefRef.current?.current ?? null,
      );
      if (shimmerEngine) {
        shimmerEngine.setContentMask(mask);
        return;
      }
      rippleEngine?.setContentMask(mask);
    };

    const syncRippleState = () => {
      if (!rippleEngine) return;
      const profile = resolveHeroRippleViewportProfile(overlay);
      rippleEngine.setViewportProfile(profile);
      syncMask();
      rippleEngine.setRippleOrigin(
        resolveRippleOrigin(
          overlay,
          rippleOriginRefRef.current?.current ?? null,
          profile,
        ),
      );
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

      if (shimmerEngine) {
        shimmerEngine.rebuild(logicalWidth, logicalHeight, dpr);
        syncMask();
      } else if (rippleEngine) {
        rippleEngine.rebuild(logicalWidth, logicalHeight, dpr);
        syncRippleState();
      }

      if (!animating) {
        drawIdle(performance.now());
      }
    };

    const drawIdle = (now: number) => {
      if (logicalWidth <= 0 || logicalHeight <= 0) return;
      if (shimmerEngine) {
        shimmerEngine.drawStatic(ctx, logicalWidth, logicalHeight);
        return;
      }
      rippleEngine?.setActive(false);
      syncRippleState();
      rippleEngine?.drawStatic(ctx, logicalWidth, logicalHeight, now);
    };

    const stopLoop = () => {
      animating = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const frame = (now: number) => {
      if (!running) return;

      if (!isIntersecting || !isDocVisible) {
        stopLoop();
        return;
      }

      if (shimmerEngine) {
        shimmerEngine.draw(ctx, logicalWidth, logicalHeight, now, activeRef.current);
        raf = requestAnimationFrame(frame);
        return;
      }

      if (!rippleEngine) return;

      if (!activeRef.current) {
        stopLoop();
        drawIdle(now);
        return;
      }

      syncRippleState();
      rippleEngine.setActive(true);
      rippleEngine.tick(now, logicalWidth, logicalHeight);
      rippleEngine.draw(ctx, logicalWidth, logicalHeight, now);
      raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (!running || animating) return;
      if (!isIntersecting || !isDocVisible) return;
      if (logicalWidth <= 0 || logicalHeight <= 0) return;
      if (!activeRef.current) return;

      animating = true;
      raf = requestAnimationFrame(frame);
    };

    const syncPlayback = () => {
      if (isIntersecting && isDocVisible && activeRef.current) {
        startLoop();
        return;
      }

      stopLoop();
      if (isIntersecting && isDocVisible && !shimmerEngine) {
        drawIdle(performance.now());
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(overlay);

    const contentEl = contentMaskRefRef.current?.current;
    if (contentEl) {
      ro.observe(contentEl);
    }

    const originEl = rippleOriginRefRef.current?.current;
    if (originEl) {
      ro.observe(originEl);
    }

    resize();

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

    syncPlaybackRef.current = syncPlayback;
    syncPlayback();

    return () => {
      running = false;
      syncPlaybackRef.current = null;
      stopLoop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [mobileShimmer, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "hero-bg-pulse-overlay",
        mobileShimmer && "hero-bg-pulse-overlay--mobile-enter",
        mobileShimmer && entered && "is-entered",
      )}
      aria-hidden
    >
      <canvas ref={canvasRef} className="hero-bg-pulse-canvas" />
    </div>
  );
}

export default HeroBackgroundPulses;
