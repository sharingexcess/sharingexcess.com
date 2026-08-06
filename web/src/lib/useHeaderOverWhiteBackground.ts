import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { isOverHomeHero } from "@/lib/useHeaderOverHomeHero";
import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

function readScrollY(lenisScroll?: number): number {
  if (typeof lenisScroll === "number") return lenisScroll;
  if (typeof window === "undefined") return 0;
  return window.scrollY;
}

function isDarkBackground(el: Element | null): boolean {
  let node: Element | null = el;
  while (node) {
    const theme = node.getAttribute("data-theme");
    if (theme === "dark") return true;
    if (theme === "light") return false;
    node = node.parentElement;
  }
  return false;
}

/** Full-bleed dark heroes stay shadowless; stacked home hero uses a light intro band. */
function suppressShadowOverHomeHero(scrollY?: number): boolean {
  if (!isOverHomeHero(scrollY)) return false;

  const hero = document.querySelector("[data-home-hero]");
  if (!hero) return false;

  return !hero.classList.contains("home-hero-donate--stacked");
}

function sampleOverWhiteBackground(
  headerBar: HTMLElement | null,
  scrollY?: number,
): boolean {
  if (typeof window === "undefined" || !headerBar) return false;
  if (suppressShadowOverHomeHero(scrollY)) return false;

  const rect = headerBar.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.bottom + 4;
  const sample = document.elementFromPoint(x, y);

  return sample ? !isDarkBackground(sample) : true;
}

/** True when page content directly below the header bar is on a light/white background. */
export function useHeaderOverWhiteBackground(
  headerBarRef: RefObject<HTMLElement | null>,
  initialOverWhite = false,
): boolean {
  const lenis = useLenis();
  const [overWhite, setOverWhite] = useState(initialOverWhite);

  useLayoutEffect(() => {
    setOverWhite(
      sampleOverWhiteBackground(headerBarRef.current, readScrollY(lenis?.scroll)),
    );
  }, [headerBarRef, lenis]);

  useEffect(() => {
    const update = () =>
      setOverWhite(
        sampleOverWhiteBackground(headerBarRef.current, readScrollY(lenis?.scroll)),
      );

    update();

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
  }, [lenis, headerBarRef]);

  return overWhite;
}
