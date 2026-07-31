import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { motion } from "./tokens";

export interface CountUpProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Both queries are listed so the handler runs either way; with only the
      // reduce query it never fires for users who have no motion preference.
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions?.reduce) return;

          const proxy = { n: 0 };
          el.textContent = format(0);

          gsap.to(proxy, {
            n: value,
            duration: motion.duration.count,
            ease: motion.ease.count,
            onUpdate: () => {
              el.textContent = format(proxy.n);
            },
            scrollTrigger: { trigger: el, start: motion.start, once: true },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [value, decimals, prefix, suffix] },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}

export default CountUp;
