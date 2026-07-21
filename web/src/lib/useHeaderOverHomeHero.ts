import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { isHomePagePath } from "@/lib/isHomePagePath";
import { useEffect, useLayoutEffect, useState } from "react";

export const HOME_HERO_SELECTOR = "[data-home-hero]";

/** Hero scroll fraction where the header begins transitioning to its solid state. */
const HERO_HEADER_TRANSITION_RATIO = 0.5;

function getScrollY(): number {
  if (typeof window === "undefined") return 0;
  return window.scrollY;
}

function isOverHomeHero(scrollY = getScrollY()): boolean {
  if (typeof window === "undefined") return false;
  if (!isHomePagePath(window.location.pathname)) return false;

  const hero = document.querySelector(HOME_HERO_SELECTOR);
  if (!hero) return false;

  const heroEl = hero as HTMLElement;

  // Sticky donate hero stays pinned — use page scroll, not bounding rect.
  if (heroEl.classList.contains("home-hero-donate")) {
    const viewport = window.innerHeight || 1;
    return scrollY < viewport * HERO_HEADER_TRANSITION_RATIO;
  }

  const heroHeight = heroEl.offsetHeight;
  if (heroHeight <= 0) return false;

  return heroEl.getBoundingClientRect().bottom > heroHeight * HERO_HEADER_TRANSITION_RATIO;
}

/** True while the user is in the first half of the home page full-bleed hero. */
export function useHeaderOverHomeHero(initialOverHomeHero = false): boolean {
  const lenis = useLenis();
  const [overHero, setOverHero] = useState(initialOverHomeHero);

  useLayoutEffect(() => {
    setOverHero(isOverHomeHero(lenis?.scroll ?? getScrollY()));
  }, [lenis]);

  useEffect(() => {
    const update = () => setOverHero(isOverHomeHero(lenis?.scroll ?? getScrollY()));

    // Route changes don't fire scroll — recalculate overlay vs solid header styling.
    document.addEventListener("astro:after-swap", update);

    if (lenis) {
      lenis.on("scroll", update);
      return () => {
        lenis.off("scroll", update);
        document.removeEventListener("astro:after-swap", update);
      };
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("astro:after-swap", update);
    };
  }, [lenis]);

  return overHero;
}
