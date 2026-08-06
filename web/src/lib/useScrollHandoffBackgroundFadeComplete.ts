import { useLenis } from "@/components/providers/SmoothScrollProvider";
import {
  measureHandoffBackgroundFadeComplete,
  SECTION_SCROLL_HANDOFF_SELECTOR,
} from "@/lib/sectionScrollHandoffMeasure";
import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks scroll-handoff background completion via DOM — works across Astro client
 * islands where React context cannot reach nested `client:*` components.
 */
export function useScrollHandoffBackgroundFadeComplete(
  elementRef: RefObject<Element | null>,
): boolean {
  const lenis = useLenis();
  const [fadeComplete, setFadeComplete] = useState(false);

  useEffect(() => {
    const update = () => {
      const anchor = elementRef.current;
      const handoff = anchor?.closest(SECTION_SCROLL_HANDOFF_SELECTOR) as HTMLElement | null;

      if (!handoff) {
        setFadeComplete(true);
        return;
      }

      setFadeComplete(measureHandoffBackgroundFadeComplete(handoff));
    };

    update();

    if (lenis) {
      lenis.on("scroll", update);
      window.addEventListener("resize", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, [elementRef, lenis]);

  return fadeComplete;
}
