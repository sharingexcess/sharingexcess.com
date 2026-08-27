import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { scrollProgressInTrack } from "@/lib/useScrollDrivenIndex";
import { cn } from "@/lib/cn";
import { headingEmphasisClassName } from "@/lib/typography";
import { parseEmphasis } from "@/lib/parseEmphasis";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "@/lib/motion";
import { useEffect, useMemo, type JSX, type RefObject } from "react";

const DEFAULT_MAX_BLUR_PX = 16;
const DEFAULT_MIN_OPACITY = 0.28;

const TRAILING_PUNCTUATION = /^[.,!?;:…]+$/;

function mergeTrailingPunctuation(
  entries: { word: string; emphasized: boolean }[],
): { word: string; emphasized: boolean }[] {
  const merged: { word: string; emphasized: boolean }[] = [];

  for (const entry of entries) {
    const trimmed = entry.word.trim();
    if (!trimmed) continue;

    if (TRAILING_PUNCTUATION.test(trimmed) && merged.length > 0) {
      merged[merged.length - 1].word += trimmed;
      continue;
    }

    merged.push({ word: trimmed, emphasized: entry.emphasized });
  }

  return merged;
}

function tokenize(text: string): string[] {
  return tokenizeWithEmphasis(text).map((entry) => entry.word);
}

function tokenizeWithEmphasis(text: string): { word: string; emphasized: boolean }[] {
  const result: { word: string; emphasized: boolean }[] = [];
  const parts = text.split(/(\*[^*]+\*)/g);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("*") && part.endsWith("*")) {
      const inner = part.slice(1, -1);
      for (const word of inner.split(/\s+/).filter(Boolean)) {
        result.push({ word, emphasized: true });
      }
      continue;
    }

    for (const word of part.split(/\s+/).filter(Boolean)) {
      result.push({ word, emphasized: false });
    }
  }

  return mergeTrailingPunctuation(result);
}

function splitWordEntriesForOrphanGuard(
  entries: { word: string; emphasized: boolean }[],
): {
  leading: { word: string; emphasized: boolean }[];
  trailing: { word: string; emphasized: boolean }[] | null;
} {
  if (entries.length <= 2) {
    return { leading: [], trailing: entries.length > 0 ? entries : null };
  }

  return {
    leading: entries.slice(0, -2),
    trailing: entries.slice(-2),
  };
}

function useScrollRevealProgress(
  scrollRef: RefObject<Element | null>,
  /** Section scroll depth (0–1) where word blur begins */
  blurStart = 0,
  /** Section scroll depth (0–1) where word blur finishes */
  blurEnd = 1,
  animationFraction?: number,
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

      const rawProgress = scrollProgressInTrack(target);
      const trackProgress =
        animationFraction != null && animationFraction < 1
          ? Math.min(1, rawProgress / animationFraction)
          : rawProgress;
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
  }, [animationFraction, blurEnd, blurStart, lenis, progress, reduceMotion, scrollRef]);

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
  maxBlurPx = DEFAULT_MAX_BLUR_PX,
  minOpacity = DEFAULT_MIN_OPACITY,
  emphasized = false,
}: {
  word: string;
  index: number;
  totalWords: number;
  progress: MotionValue<number>;
  maxBlurPx?: number;
  minOpacity?: number;
  emphasized?: boolean;
}) {
  const blurPx = useTransform(progress, (value) => {
    const amount = wordRevealAmount(value, index, totalWords);
    return (1 - amount) * maxBlurPx;
  });
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const opacity = useTransform(progress, (value) => {
    const amount = wordRevealAmount(value, index, totalWords);
    return minOpacity + (1 - minOpacity) * amount;
  });

  return (
    <motion.span
      style={{ filter, opacity }}
      className={cn(
        "inline-block will-change-[opacity,filter]",
        emphasized && headingEmphasisClassName,
      )}
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
  /** Starting blur radius (px) before each word resolves */
  maxBlurPx?: number;
  /** Opacity floor before each word resolves — use 0 for full fade-in */
  minOpacity?: number;
  /** Parse *asterisk* spans for heading emphasis color */
  emphasis?: boolean;
  /** Keep the last two words on one line — avoids single-word orphans */
  orphanGuard?: boolean;
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
  maxBlurPx = DEFAULT_MAX_BLUR_PX,
  minOpacity = DEFAULT_MIN_OPACITY,
  emphasis = false,
  orphanGuard = false,
}: ScrollBlurWordsProps) {
  const wordEntries = useMemo(
    () => (emphasis ? tokenizeWithEmphasis(text) : tokenize(text).map((word) => ({ word, emphasized: false }))),
    [emphasis, text],
  );
  const { leading, trailing } = orphanGuard
    ? splitWordEntriesForOrphanGuard(wordEntries)
    : { leading: wordEntries, trailing: null };

  const renderWord = (
    entry: { word: string; emphasized: boolean },
    wordIndex: number,
  ) => (
    <ScrollBlurWord
      word={entry.word}
      index={wordIndex}
      totalWords={totalWords}
      progress={progress}
      maxBlurPx={maxBlurPx}
      minOpacity={minOpacity}
      emphasized={entry.emphasized}
    />
  );

  if (reduceMotion || !progress) {
    return (
      <Tag className={className}>
        {emphasis ? parseEmphasis(text) : text.replace(/\*([^*]+)\*/g, "$1")}
      </Tag>
    );
  }

  return (
    <Tag className={cn("text-pretty", className)} aria-label={text.replace(/\*/g, "")}>
      {leading.map((entry, i) => {
        const wordIndex = startIndex + i;
        const isLastInLeading = i === leading.length - 1;

        return (
          <span key={`${wordIndex}-${entry.word}`}>
            {renderWord(entry, wordIndex)}
            {!isLastInLeading || trailing ? "\u00A0" : null}
          </span>
        );
      })}
      {trailing && (
        <span className="inline-block whitespace-nowrap">
          {trailing.map((entry, i) => {
            const wordIndex = startIndex + leading.length + i;
            const isLast = i === trailing.length - 1;

            return (
              <span key={`${wordIndex}-${entry.word}`}>
                {renderWord(entry, wordIndex)}
                {!isLast && "\u00A0"}
              </span>
            );
          })}
        </span>
      )}
    </Tag>
  );
}

export { tokenize as tokenizeScrollBlurWords, useScrollRevealProgress };

export default ScrollBlurWords;
