import { cn } from "@/lib/cn";
import { getImpactEquivalents } from "@/lib/impactEquivalents";
import {
  AnimatePresence,
  metricEquivalentFade,
  metricEquivalentWordContainerVariants,
  metricEquivalentWordVariants,
  motion,
  useReducedMotion,
} from "@/lib/motion";
import { bodyMdClassName } from "@/lib/typography";
import { useEffect, useMemo, useState } from "react";

const ROTATION_INTERVAL_MS = 5000;
const WORD_GAP = "0.2em";

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function EquivalentPhrase({
  phrase,
  reduceMotion,
}: {
  phrase: string;
  reduceMotion: boolean | null;
}) {
  const text = `(That's ${phrase})`;
  const words = useMemo(() => splitWords(text), [text]);

  if (reduceMotion) {
    return text;
  }

  return (
    <motion.span
      variants={metricEquivalentWordContainerVariants}
      initial="hidden"
      animate="visible"
      className="inline"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={metricEquivalentWordVariants}
          className="inline-block will-change-[opacity]"
          style={index < words.length - 1 ? { marginRight: WORD_GAP } : undefined}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

export interface MetricEquivalentsRotatorProps {
  totalLbs: number;
  className?: string;
}

export function MetricEquivalentsRotator({
  totalLbs,
  className,
}: MetricEquivalentsRotatorProps) {
  const equivalents = getImpactEquivalents(totalLbs);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (equivalents.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % equivalents.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [equivalents.length]);

  if (equivalents.length === 0) return null;

  const activeEquivalent = equivalents[activeIndex];

  return (
    <div
      className={cn(
        "relative w-full min-h-[2.8em] text-[var(--section-text,#003619)]",
        className,
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={activeEquivalent.id}
          className={cn(bodyMdClassName, "absolute inset-x-0 top-0")}
          initial={false}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={metricEquivalentFade}
        >
          <EquivalentPhrase phrase={activeEquivalent.phrase} reduceMotion={reduceMotion} />
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default MetricEquivalentsRotator;
