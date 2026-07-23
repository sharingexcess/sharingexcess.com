import type Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Bridge Lenis smooth scroll with GSAP ScrollTrigger.
 * Lenis must be created with `autoRaf: false`; GSAP's ticker drives rAF.
 */
export function connectGsapLenis(lenis: Lenis): () => void {
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.animatedScroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  const tickerCallback = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.refresh();

  return () => {
    lenis.off("scroll", onScroll);
    gsap.ticker.remove(tickerCallback);
    ScrollTrigger.scrollerProxy(document.documentElement, {});
    ScrollTrigger.refresh();
  };
}
