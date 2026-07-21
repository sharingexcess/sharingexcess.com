import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useEffect, useState, type RefObject } from "react";
import type Lenis from "lenis";

export function scrollProgressInTrack(track: HTMLElement): number {
  const scrollRange = track.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) return 0;

  const scrolled = Math.max(0, Math.min(scrollRange, -track.getBoundingClientRect().top));
  return scrolled / scrollRange;
}

function progressToIndex(progress: number, itemCount: number): number {
  if (itemCount <= 1) return 0;
  return Math.min(itemCount - 1, Math.floor(progress * itemCount));
}

/** Maps scroll progress through a tall track to a stepped carousel index */
export function useScrollDrivenIndex(
  trackRef: RefObject<HTMLElement | null>,
  itemCount: number,
  enabled: boolean,
): number {
  const lenis = useLenis();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || itemCount <= 1) {
      setIndex(0);
      return;
    }

    const update = () => {
      const track = trackRef.current;
      if (!track) return;

      const progress = scrollProgressInTrack(track);
      const nextIndex = progressToIndex(progress, itemCount);
      setIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    };

    if (lenis) {
      lenis.on("scroll", update);
      lenis.on("virtual-scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
        lenis.off("virtual-scroll", update);
      } else {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      }
    };
  }, [enabled, itemCount, lenis, trackRef]);

  return index;
}

/** Scroll the pinned track so the carousel continues from the chosen slide */
export function scrollTrackToIndex(
  track: HTMLElement,
  index: number,
  itemCount: number,
  lenis: Lenis | null,
): void {
  if (itemCount <= 1) return;

  const scrollRange = track.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) return;

  const clampedIndex = Math.max(0, Math.min(itemCount - 1, index));
  const targetScrolled = (clampedIndex / itemCount) * scrollRange;

  const currentScrolled = Math.max(
    0,
    Math.min(scrollRange, -track.getBoundingClientRect().top),
  );
  const targetY = window.scrollY + (targetScrolled - currentScrolled);

  if (lenis) {
    lenis.scrollTo(targetY, { immediate: true });
  } else {
    window.scrollTo({ top: targetY, behavior: "auto" });
  }
}
