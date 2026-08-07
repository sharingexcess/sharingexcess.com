import { useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, type RefObject } from "react";
import {
  HalftoneRippleEngine,
  type RippleContentMask,
} from "./heroHalftoneRipple";
import "./heroBackgroundPulse.css";

export interface HeroBackgroundPulsesProps {
  /** When false, only the faint base grid shows — ripples start once this turns true */
  active?: boolean;
  /** Hero intro content — ripples are masked inside this element's bounds */
  contentMaskRef?: RefObject<HTMLElement | null>;
}

function resolveContentMask(
  overlay: HTMLElement,
  contentEl: HTMLElement | null,
): RippleContentMask | null {
  if (!contentEl) return null;

  const overlayRect = overlay.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();

  if (contentRect.width <= 0 || contentRect.height <= 0) return null;

  return {
    left: contentRect.left - overlayRect.left,
    top: contentRect.top - overlayRect.top,
    right: contentRect.right - overlayRect.left,
    bottom: contentRect.bottom - overlayRect.top,
  };
}

export function HeroBackgroundPulses({
  active = true,
  contentMaskRef,
}: HeroBackgroundPulsesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const contentMaskRefRef = useRef(contentMaskRef);
  const syncPlaybackRef = useRef<(() => void) | null>(null);
  const reduceMotion = useReducedMotion();

  activeRef.current = active;
  contentMaskRefRef.current = contentMaskRef;

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

    const engine = new HalftoneRippleEngine();
    let raf = 0;
    let running = true;
    let animating = false;
    let isIntersecting = true;
    let isDocVisible = document.visibilityState === "visible";
    let logicalWidth = 0;
    let logicalHeight = 0;

    const syncContentMask = () => {
      const mask = resolveContentMask(
        overlay,
        contentMaskRefRef.current?.current ?? null,
      );
      engine.setContentMask(mask);
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

      if (!animating) {
        engine.drawStatic(ctx, logicalWidth, logicalHeight, performance.now());
      }
    };

    const stopLoop = () => {
      animating = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const drawStatic = () => {
      if (logicalWidth <= 0 || logicalHeight <= 0) return;
      engine.setActive(false);
      syncContentMask();
      engine.drawStatic(ctx, logicalWidth, logicalHeight, performance.now());
    };

    const frame = (now: number) => {
      if (!running) return;

      if (!isIntersecting || !isDocVisible) {
        stopLoop();
        return;
      }

      if (!activeRef.current) {
        stopLoop();
        drawStatic();
        return;
      }

      syncContentMask();
      engine.setActive(true);
      engine.tick(now, logicalWidth, logicalHeight);
      engine.draw(ctx, logicalWidth, logicalHeight, now);
      raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (!running || animating) return;
      if (!isIntersecting || !isDocVisible || !activeRef.current) return;
      if (logicalWidth <= 0 || logicalHeight <= 0) return;

      animating = true;
      raf = requestAnimationFrame(frame);
    };

    const syncPlayback = () => {
      if (activeRef.current && isIntersecting && isDocVisible) {
        startLoop();
      } else {
        stopLoop();
        if (isIntersecting && isDocVisible) {
          drawStatic();
        }
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(overlay);

    const contentEl = contentMaskRefRef.current?.current;
    if (contentEl) {
      ro.observe(contentEl);
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
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div ref={overlayRef} className="hero-bg-pulse-overlay" aria-hidden>
      <canvas ref={canvasRef} className="hero-bg-pulse-canvas" />
    </div>
  );
}

export default HeroBackgroundPulses;
