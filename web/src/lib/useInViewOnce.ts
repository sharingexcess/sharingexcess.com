import { useInView } from "@/lib/motion";
import { useEffect, useState, type RefObject } from "react";

type InViewOptions = NonNullable<Parameters<typeof useInView>[1]>;

function isElementVisible(el: Element, minRatio = 0.1): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;

  if (rect.width <= 0 || rect.height <= 0) return false;

  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, vw) - Math.max(rect.left, 0);
  if (visibleHeight <= 0 || visibleWidth <= 0) return false;

  const ratio = (visibleHeight * visibleWidth) / (rect.height * rect.width);
  return ratio >= minRatio;
}

/**
 * Framer Motion useInView plus a mount/scroll/layout fallback for islands that
 * hydrate after the element is already on screen (e.g. client:visible sections).
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  options?: InViewOptions,
): boolean {
  const motionInView = useInView(ref, options);
  const [fallbackInView, setFallbackInView] = useState(false);
  const isInView = motionInView || fallbackInView;

  useEffect(() => {
    if (isInView) return;

    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    const check = () => {
      if (cancelled || !ref.current) return;
      if (isElementVisible(ref.current)) {
        setFallbackInView(true);
      }
    };

    check();
    const raf = requestAnimationFrame(() => requestAnimationFrame(check));

    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(el);

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [isInView, ref]);

  return isInView;
}
