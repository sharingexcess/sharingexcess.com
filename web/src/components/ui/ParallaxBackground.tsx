import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "@/lib/motion";
import { useEffect, useRef, type RefObject } from "react";

/** Light spring — softens scroll-linked shifts without noticeable lag */
const PARALLAX_SPRING = { stiffness: 140, damping: 38, mass: 0.15 };

type ParallaxScrollOffset = readonly [string, string];

export interface ParallaxScrollStyleOptions {
  travel?: number;
  offset?: ParallaxScrollOffset;
  smooth?: boolean;
  /** Extra Y shift (%) — positive nudges the image down to show less of the bottom at rest */
  restOffset?: number;
}

/** Scroll-linked parallax transform for full-bleed background layers */
export function useParallaxScrollStyle(
  scrollRef: RefObject<Element | null>,
  {
    travel = 20,
    offset = ["start start", "end start"],
    smooth = false,
    restOffset = 0,
  }: ParallaxScrollStyleOptions = {},
) {
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const halfTravel = travel / 2;
  const edge = parallaxEdgeInset(travel);
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, PARALLAX_SPRING);
  const drivenProgress = smooth ? smoothProgress : progress;
  const y = useTransform(
    drivenProgress,
    (value) => `${-halfTravel + restOffset + value * travel}%`,
  );

  useEffect(() => {
    if (reduceMotion) {
      progress.set(0);
      return;
    }

    const update = () => {
      const target = scrollRef.current;
      if (!target) return;

      progress.set(
        measureOffsetProgress(
          target.getBoundingClientRect(),
          window.innerHeight,
          offset,
        ),
      );
    };

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      }
    };
  }, [lenis, offset, progress, reduceMotion, scrollRef]);

  const style = reduceMotion
    ? undefined
    : {
        y,
        height: `${100 + 2 * edge}%`,
        top: `-${edge}%`,
      };

  return { style, reduceMotion };
}

export interface ParallaxBackgroundProps {
  /** Element whose scroll progress drives the parallax — usually the clipping container */
  scrollRef: RefObject<Element | null>;
  src: string;
  alt: string;
  /** Optional cover video layered above `src` (poster frame) */
  videoSrc?: string;
  className?: string;
  /** Total Y travel as a % of the image height (split above/below center) */
  travel?: number;
  /** Scroll offsets — wider ranges (e.g. start/end → end/start) lengthen the effect */
  offset?: ParallaxScrollOffset;
  /** Ease image travel with a light spring instead of snapping to scroll position */
  smooth?: boolean;
  /** Extra Y shift (%) — positive nudges the image down to show less of the bottom at rest */
  restOffset?: number;
  /** CSS object-position for cover framing */
  objectPosition?: string;
}

/** Inset (% of container) so ±halfTravel% image shift never exposes the frame */
function parallaxEdgeInset(travel: number) {
  const halfTravel = travel / 2;
  // halfTravel% translate is relative to the oversized image; solve for symmetric edge buffer
  const minEdge = halfTravel / (1 - halfTravel / 50);
  return Math.ceil(minEdge + 4);
}

/** Match Framer Motion scroll offsets using target/viewport edge pairs */
export function measureOffsetProgress(
  rect: DOMRect,
  viewportHeight: number,
  offset: ParallaxScrollOffset,
): number {
  const targetPoint = (edge: string) => (edge === "start" ? rect.top : rect.bottom);
  const viewportPoint = (edge: string) => (edge === "start" ? 0 : viewportHeight);

  const [targetStartEdge, viewportStartEdge] = offset[0].split(" ") as [string, string];
  const [targetEndEdge, viewportEndEdge] = offset[1].split(" ") as [string, string];

  const startPos = targetPoint(targetStartEdge) - viewportPoint(viewportStartEdge);
  const endPos = targetPoint(targetEndEdge) - viewportPoint(viewportEndEdge);
  const span = startPos - endPos;

  if (span === 0) return 0;
  return Math.max(0, Math.min(1, startPos / span));
}

/** Full-bleed cover image with scroll-linked vertical parallax */
export function ParallaxBackground({
  scrollRef,
  src,
  alt,
  videoSrc,
  className,
  travel = 20,
  offset = ["start start", "end start"],
  smooth = false,
  restOffset = 0,
  objectPosition = "center",
}: ParallaxBackgroundProps) {
  const { style: parallaxStyle, reduceMotion } = useParallaxScrollStyle(scrollRef, {
    travel,
    offset,
    smooth,
    restOffset,
  });

  const coverClass = "absolute inset-0 size-full object-cover";

  if (videoSrc) {
    return (
      <motion.div
        style={parallaxStyle}
        className={cn(
          "absolute left-0 w-full",
          reduceMotion && "inset-0 size-full",
          className,
        )}
      >
        <img src={src} alt="" aria-hidden className={coverClass} />
        <video autoPlay loop muted playsInline aria-hidden className={coverClass}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>
    );
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      style={{ ...parallaxStyle, objectPosition }}
      className={cn(
        "absolute left-0 w-full max-h-none object-cover",
        reduceMotion && "inset-0 size-full",
        className,
      )}
    />
  );
}

export interface ParallaxCoverProps {
  src: string;
  alt: string;
  className?: string;
  travel?: number;
}

/** Overflow-hidden frame with an inset parallax cover image */
export function ParallaxCover({ src, alt, className, travel }: ParallaxCoverProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className={cn("relative overflow-hidden", className)}>
      <ParallaxBackground scrollRef={scrollRef} src={src} alt={alt} travel={travel} />
    </div>
  );
}
