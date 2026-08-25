import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useEffect, useRef, useState } from "react";

export interface UseHideOnScrollOptions {
  /** Always show the header below this scroll offset (px) */
  threshold?: number;
  /** Ignore direction changes smaller than this (px) */
  deltaThreshold?: number;
  /** When false the header always stays visible (e.g. Storybook previews). */
  enabled?: boolean;
}

function readScrollY(): number {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

/**
 * Hide on scroll down, show on scroll up.
 * Subscribes to Lenis when available (same React island as the header).
 */
export function useHideOnScroll({
  threshold = 80,
  deltaThreshold = 1,
  enabled = true,
}: UseHideOnScrollOptions = {}): boolean {
  const lenis = useLenis();
  const [visible, setVisible] = useState(true);
  const lastScrollY  = useRef(0);
  // After navigation Lenis may emit one stale event with the previous page's
  // scroll position before scrollTo(0) settles. Skip tracking briefly.
  const skipRef = useRef(false);

  // Scroll tracking — re-registers when the Lenis instance changes.
  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const applyScroll = (scrollY: number) => {
      if (skipRef.current) return;

      if (scrollY <= threshold) {
        setVisible(true);
        lastScrollY.current = scrollY;
        return;
      }

      const delta = scrollY - lastScrollY.current;
      if (Math.abs(delta) < deltaThreshold) return;

      setVisible(delta < 0);
      lastScrollY.current = scrollY;
    };

    lastScrollY.current = readScrollY();

    if (lenis) {
      const onScroll = () => applyScroll(lenis.scroll);
      lenis.on("scroll", onScroll);
      return () => lenis.off("scroll", onScroll);
    }

    const onWindowScroll = () => applyScroll(readScrollY());
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, [enabled, lenis, threshold, deltaThreshold]);

  // Navigation reset — separate effect with no deps so it is never removed
  // or re-added when the Lenis instance changes (avoids registration gaps).
  useEffect(() => {
    const reset = () => {
      setVisible(true);
      skipRef.current = true;
      // Give scrollTo(0) time to settle before resuming scroll tracking.
      setTimeout(() => {
        skipRef.current = false;
        lastScrollY.current = readScrollY();
      }, 300);
    };
    document.addEventListener("astro:after-swap", reset);
    return () => document.removeEventListener("astro:after-swap", reset);
  }, []);

  return enabled ? visible : true;
}
