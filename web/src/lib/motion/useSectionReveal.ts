import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { motion } from "./tokens";

export interface SectionRevealOptions {
  /** "load" animates on mount; "scroll" waits until the section enters the viewport. */
  trigger?: "load" | "scroll";
  stagger?: number;
  delay?: number;
}

export function useSectionReveal<T extends HTMLElement = HTMLElement>({
  trigger = "scroll",
  stagger = motion.stagger,
  delay = 0,
}: SectionRevealOptions = {}) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const targets = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-reveal]"),
      );
      if (!targets.length) return;

      const mm = gsap.matchMedia();

      // Both queries are listed so the handler runs either way; with only the
      // reduce query it never fires for users who have no motion preference.
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions?.reduce) {
            gsap.set(targets, { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: motion.offset.y },
            {
              autoAlpha: 1,
              y: 0,
              stagger,
              delay,
              duration: motion.duration.reveal,
              ease: motion.ease.reveal,
              scrollTrigger:
                trigger === "scroll"
                  ? { trigger: root, start: motion.start, once: true }
                  : undefined,
            },
          );
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return scope;
}
