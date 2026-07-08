import { useLayoutEffect, useRef, useState } from "react";

export interface UseFitTextOptions {
  /** Minimum font size in pixels (default 56 — 3.5rem) */
  minSizePx?: number;
  /** Hard floor when scaling multiline headings down to prevent overflow (default 28) */
  floorSizePx?: number;
  /** Bumps measurement when layout becomes ready (e.g. fonts loaded) */
  remeasureKey?: unknown;
  /** Upper bound when searching for the largest fitting size (default 48) */
  maxSizePx?: number;
}

/**
 * Scales a single-line text element down when it overflows its container.
 * Uses the element's CSS-computed font size as the preferred (max) size.
 */
export function useFitText(text: string, options: UseFitTextOptions = {}) {
  const { minSizePx = 56 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const [fontSizePx, setFontSizePx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    const fit = () => {
      el.style.fontSize = "";
      const preferredPx = parseFloat(getComputedStyle(el).fontSize);
      const maxWidth = container.clientWidth;

      if (maxWidth <= 0 || !Number.isFinite(preferredPx)) return;

      const fits = (sizePx: number) => {
        el.style.fontSize = `${sizePx}px`;
        return el.scrollWidth <= maxWidth + 0.5;
      };

      if (fits(preferredPx)) {
        el.style.fontSize = "";
        setFontSizePx(null);
        return;
      }

      let low = minSizePx;
      let high = preferredPx;
      let best = minSizePx;

      while (high - low > 0.5) {
        const mid = (low + high) / 2;
        if (fits(mid)) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      el.style.fontSize = "";
      setFontSizePx(Math.round(best * 10) / 10);
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    const fonts = document.fonts;
    void fonts?.ready.then(fit);
    fonts?.addEventListener("loadingdone", fit);

    return () => {
      observer.disconnect();
      fonts?.removeEventListener("loadingdone", fit);
    };
  }, [text, minSizePx]);

  return { containerRef, textRef, fontSizePx };
}

/**
 * Scales a multiline heading so every nowrap line fits within its container.
 * Applies a single font size to the container element (children inherit).
 */
export function useFitMultilineText(
  lineCount: number,
  options: UseFitTextOptions = {},
) {
  const { floorSizePx = 28, remeasureKey, maxSizePx = 48 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSizePx, setFontSizePx] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (lineCount === 0) return;

    let cancelled = false;
    let pendingRaf = 0;
    let observer: ResizeObserver | null = null;

    const fit = () => {
      if (cancelled) return;

      const container = containerRef.current;
      if (!container) {
        pendingRaf = requestAnimationFrame(fit);
        return;
      }

      if (!observer) {
        observer = new ResizeObserver(fit);
        observer.observe(container);
      }

      const text = container.querySelector<HTMLElement>("[data-fit-heading]");
      const lines = container.querySelectorAll<HTMLElement>("[data-fit-line]");
      if (!text || lines.length < lineCount) {
        pendingRaf = requestAnimationFrame(fit);
        return;
      }

      const maxWidth = container.clientWidth;

      if (maxWidth <= 0) {
        pendingRaf = requestAnimationFrame(fit);
        return;
      }

      const allFit = (sizePx: number) => {
        text.style.fontSize = `${sizePx}px`;
        return [...lines].every((line) => line.scrollWidth <= maxWidth + 0.5);
      };

      let low = floorSizePx;
      let high = maxSizePx;
      let best = floorSizePx;

      while (high - low > 0.5) {
        const mid = (low + high) / 2;
        if (allFit(mid)) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      text.style.removeProperty("font-size");
      setFontSizePx(Math.round(best * 10) / 10);
    };

    fit();

    const fonts = document.fonts;
    void fonts?.ready.then(fit);
    fonts?.addEventListener("loadingdone", fit);

    return () => {
      cancelled = true;
      cancelAnimationFrame(pendingRaf);
      observer?.disconnect();
      fonts?.removeEventListener("loadingdone", fit);
    };
  }, [lineCount, floorSizePx, maxSizePx, remeasureKey]);

  return { containerRef, fontSizePx };
}
