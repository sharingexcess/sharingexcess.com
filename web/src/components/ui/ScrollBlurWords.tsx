import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { scrollProgressInTrack } from "@/lib/useScrollDrivenIndex";
import { cn } from "@/lib/cn";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "@/lib/motion";
import { useEffect, useMemo, type JSX, type RefObject } from "react";

const MAX_BLUR_PX = 16;
const MIN_OPACITY = 0.28;

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function useScrollRevealProgress(
  scrollRef: RefObject<Element | null>,
  /** Section scroll depth (0–1) where word blur begins */
  blurStart = 0,
  /** Section scroll depth (0–1) where word blur finishes */
  blurEnd = 1,
) {
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const progress = useMotionValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }

    const update = () => {
      const target = scrollRef.current;
      if (!target) return;

      const trackProgress = scrollProgressInTrack(target);
      const blurRange = blurEnd - blurStart;
      const blurProgress =
        blurRange <= 0
          ? 1
          : Math.max(0, Math.min(1, (trackProgress - blurStart) / blurRange));
      progress.set(blurProgress);
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
  }, [blurEnd, blurStart, lenis, progress, reduceMotion, scrollRef]);

  return { progress, reduceMotion };
}

function wordRevealAmount(
  scrollProgress: number,
  wordIndex: number,
  totalWords: number,
): number {
  return Math.min(1, Math.max(0, scrollProgress * totalWords - wordIndex));
}

function ScrollBlurWord({
  word,
  index,
  totalWords,
  progress,
}: {
  word: string;
  index: number;
  totalWords: number;
  progress: MotionValue<number>;
}) {
  const blurPx = useTransform(progress, (value) => {
    const amount = wordRevealAmount(value, index, totalWords);
    return (1 - amount) * MAX_BLUR_PX;
  });
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const opacity = useTransform(progress, (value) => {
    const amount = wordRevealAmount(value, index, totalWords);
    return MIN_OPACITY + (1 - MIN_OPACITY) * amount;
  });

  return (
    <motion.span
      style={{ filter, opacity }}
      className="inline-block will-change-[opacity,filter]"
    >
      {word}
    </motion.span>
  );
}

export interface ScrollBlurWordsProps {
  text: string;
  /** Index of the first word within the combined heading + body sequence */
  startIndex?: number;
  /** Total words across all blocks in the sequence */
  totalWords: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Shared progress — pass when multiple blocks share one scroll track */
  progress?: MotionValue<number>;
  reduceMotion?: boolean;
}

/** Word-by-word blur resolve driven by scroll progress */
export function ScrollBlurWords({
  text,
  startIndex = 0,
  totalWords,
  as: Tag = "p",
  className,
  progress,
  reduceMotion = false,
}: ScrollBlurWordsProps) {
  const words = useMemo(() => tokenize(text), [text]);

  if (reduceMotion || !progress) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn("text-pretty", className)} aria-label={text}>
      {words.map((word, i) => {
        const wordIndex = startIndex + i;
        const isLast = i === words.length - 1;

        return (
          <span key={`${wordIndex}-${word}`}>
            <ScrollBlurWord
              word={word}
              index={wordIndex}
              totalWords={totalWords}
              progress={progress}
            />
            {!isLast && "\u00A0"}
          </span>
        );
      })}
    </Tag>
  );
}

export { tokenize as tokenizeScrollBlurWords, useScrollRevealProgress };

export default ScrollBlurWords;
