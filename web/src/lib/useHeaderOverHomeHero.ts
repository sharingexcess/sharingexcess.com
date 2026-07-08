import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { getSiteHeaderHeight } from "@/lib/roundSectionScroll";
import { useEffect, useLayoutEffect, useState } from "react";

export const HOME_HERO_SELECTOR = "[data-home-hero]";

function isOverHomeHero(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname !== "/") return false;

  const hero = document.querySelector(HOME_HERO_SELECTOR);
  if (!hero) return false;

  return hero.getBoundingClientRect().bottom > getSiteHeaderHeight();
}

/** True when the fixed header overlaps the home page full-bleed hero. */
export function useHeaderOverHomeHero(): boolean {
  const lenis = useLenis();
  const [overHero, setOverHero] = useState(false);

  useLayoutEffect(() => {
    setOverHero(isOverHomeHero());
  }, []);

  useEffect(() => {
    const update = () => setOverHero(isOverHomeHero());

    // Route changes don't fire scroll — recalculate glass vs solid header styling.
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
