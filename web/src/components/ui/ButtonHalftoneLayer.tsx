import { motion, type Variants } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";
import { paintHalftoneDisc } from "./buttonHalftoneDisc";

type ButtonHalftoneLayerProps = {
  color: string;
  offset: string;
  layerIndex: number;
  variants: Variants;
};

export function ButtonHalftoneLayer({
  color,
  offset,
  layerIndex,
  variants,
}: ButtonHalftoneLayerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const paint = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintHalftoneDisc(ctx, rect.width, rect.height, color);
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(container);
    return () => ro.disconnect();
  }, [color]);

  return (
    <motion.span
      ref={containerRef}
      className="absolute left-1/2 top-0 aspect-square w-[140%] -translate-x-1/2"
      style={{ zIndex: layerIndex + 1, transformOrigin: "center center" }}
      variants={variants}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none block size-full"
      />
    </motion.span>
  );
}
