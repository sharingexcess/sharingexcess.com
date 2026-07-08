import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useEffect } from "react";

/** Lock document scroll (and pause Lenis when present) while `locked` is true. */
export function useBodyScrollLock(locked: boolean): void {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [locked, lenis]);
}
