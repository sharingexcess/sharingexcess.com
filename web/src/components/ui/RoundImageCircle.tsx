import { cn } from "@/lib/cn";
import {
  motion,
  roundImageGlideVariants,
  useReducedMotion,
} from "@/lib/motion";
import type { ImagePosition } from "@/lib/types";

export interface RoundImageCircleProps {
  src: string;
  alt: string;
  imagePosition?: ImagePosition;
  /** Section-bleed desktop circle vs contained mobile circle */
  variant?: "bleed" | "contained";
  /** Driven by a section-level `useInView` — the circle itself is mostly off-screen */
  inView?: boolean;
  className?: string;
}

export function RoundImageCircle({
  src,
  alt,
  imagePosition = "right",
  variant = "bleed",
  inView = false,
  className,
}: RoundImageCircleProps) {
  const onLeft = imagePosition === "left";
  const reduceMotion = useReducedMotion();
  const isBleed = variant === "bleed";
  const glideOffset = isBleed ? undefined : "28%";
  const variants = roundImageGlideVariants(onLeft, glideOffset);

  const image = <img src={src} alt={alt} className="size-full object-cover" />;

  const maskClassName = cn("size-full overflow-hidden rounded-full", className);

  if (reduceMotion) {
    if (isBleed) {
      return (
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 aspect-square w-[107.8%] -translate-y-1/2",
            onLeft ? "left-[-58.6%]" : "right-[-58.6%]",
          )}
        >
          <div className={maskClassName}>{image}</div>
        </div>
      );
    }

    return <div className={cn("relative mx-auto aspect-square w-full max-w-[400px]", maskClassName)}>{image}</div>;
  }

  const motionMask = (
    <motion.div
      className={maskClassName}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {image}
    </motion.div>
  );

  if (isBleed) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 aspect-square w-[107.8%] -translate-y-1/2",
          onLeft ? "left-[-58.6%]" : "right-[-58.6%]",
        )}
      >
        {motionMask}
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[400px]">
      {motionMask}
    </div>
  );
}

export default RoundImageCircle;
