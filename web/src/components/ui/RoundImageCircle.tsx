import { cn } from "@/lib/cn";
import {
  fadeIn,
  motion,
  roundImageBleedGlideVariants,
  roundImageGlideVariants,
  useReducedMotion,
} from "@/lib/motion";
import type { MotionValue } from "@/lib/motion";
import type { ImagePosition } from "@/lib/types";
import type { ReactNode } from "react";

export interface RoundImageCircleProps {
  src?: string;
  alt?: string;
  children?: ReactNode;
  imagePosition?: ImagePosition;
  /** contained = mobile circle; bleed variant is handled inline in RoundBleedLayout */
  variant?: "contained";
  inView?: boolean;
  /** Scale glide for photos; bleed glide (translate only) for maps; fade for mobile */
  glideMode?: "scale" | "bleed" | "fade";
  /** Drives the border-radius morph from circle → rounded square on scroll-away. */
  morphBorderRadius?: MotionValue<string>;
  className?: string;
}

export function RoundImageCircle({
  src,
  alt = "",
  children,
  imagePosition = "right",
  inView = false,
  glideMode = "scale",
  morphBorderRadius,
  className,
}: RoundImageCircleProps) {
  const onLeft = imagePosition === "left";
  const reduceMotion = useReducedMotion();
  const variants =
    glideMode === "bleed" ? roundImageBleedGlideVariants(onLeft, "28%") :
    glideMode === "fade"  ? fadeIn :
                            roundImageGlideVariants(onLeft, "28%");

  const media =
    children ??
    (src ? <img src={src} alt={alt} className="size-full object-cover" /> : null);

  if (reduceMotion) {
    return (
      <div className={cn("relative mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-full", className)}>
        {media}
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[400px]">
      <motion.div
        className={cn(
          "size-full overflow-hidden",
          morphBorderRadius ? "" : "rounded-full",
          className,
        )}
        style={morphBorderRadius ? { borderRadius: morphBorderRadius } : undefined}
        variants={variants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {media}
      </motion.div>
    </div>
  );
}

export default RoundImageCircle;
