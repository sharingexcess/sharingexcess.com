import { cn } from "@/lib/cn";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useLayoutEffect, useRef } from "react";
import { SurplusDotGridEngine } from "./surplusDotGrid";

export interface SurplusDotGridBackgroundProps {
  className?: string;
}

export function SurplusDotGridBackground({ className }: SurplusDotGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new SurplusDotGridEngine();
    let raf = 0;
    let running = false;
    let logicalWidth = 0;
    let logicalHeight = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      logicalWidth = width;
      logicalHeight = height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.rebuild(width, height);
      engine.draw(ctx, width, height, performance.now());
    };

    const frame = (now: number) => {
      if (!running) return;
      if (logicalWidth > 0 && logicalHeight > 0) {
        engine.draw(ctx, logicalWidth, logicalHeight, now);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    requestAnimationFrame(() => requestAnimationFrame(resize));
    start();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onScroll = () => {
      if (logicalWidth <= 0 || logicalHeight <= 0) resize();
    };
    if (lenis) {
      lenis.on("scroll", onScroll);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (lenis) {
        lenis.off("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, [lenis]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0 bg-white", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}

export default SurplusDotGridBackground;
