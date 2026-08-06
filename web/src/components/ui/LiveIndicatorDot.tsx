import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "@/lib/motion";
import { useScrollHandoffBackgroundFadeComplete } from "@/lib/useScrollHandoffBackgroundFadeComplete";
import { useRef } from "react";

export interface LiveIndicatorDotProps {
  className?: string;
}

/** Small pulsing kelly dot — signals live/updating data */
export function LiveIndicatorDot({ className }: LiveIndicatorDotProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const backgroundFadeComplete = useScrollHandoffBackgroundFadeComplete(ref);
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      ref={ref}
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full bg-bright-kelly",
        !backgroundFadeComplete && "invisible",
        backgroundFadeComplete && "live-indicator-dot",
        className,
      )}
      initial={false}
      animate={{ opacity: backgroundFadeComplete ? 1 : 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    />
  );
}

export default LiveIndicatorDot;
