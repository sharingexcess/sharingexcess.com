import { cn } from "@/lib/cn";
import { headingEmphasisClassName } from "@/lib/typography";
import {
  animate,
  blurWordContainerVariants,
  blurWordVariants,
  heroWordContainerVariants,
  heroWordHighlightCyclePerWord,
  heroWordHighlightLinger,
  heroWordHighlightSpread,
  heroWordVariants,
  motion,
  sectionHeadingInViewOptions,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "@/lib/motion";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useIntroRevealed } from "@/lib/useIntroRevealed";
import { useFitMultilineText } from "@/lib/useFitText";
import type { CSSProperties, JSX, ReactNode, Ref } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type WordToken = {
  text: string;
  emphasized: boolean;
  key: string;
  trailingPunctuation?: string;
};

/** Punctuation-only chunks after emphasis spans, e.g. "*waste*." → attach "." to "waste" */
const PUNCTUATION_ONLY = /^[^\p{L}\p{N}\s]+$/u;

const KALE_COLOR = "var(--color-kale)";
const BRAND_GREEN_COLOR = "var(--color-se-green-base)";

function warpProgressForLinger(progress: number, wordCount: number, linger: number): number {
  if (wordCount <= 1 || linger <= 0) return progress;

  const wrapped = ((progress % wordCount) + wordCount) % wordCount;
  const whole = Math.floor(wrapped);
  const frac = wrapped - whole;
  const hold = Math.min(linger * 0.5, 0.4);

  let remappedFrac: number;
  if (frac < hold) {
    remappedFrac = 0;
  } else if (frac > 1 - hold) {
    remappedFrac = 1;
  } else {
    remappedFrac = (frac - hold) / (1 - 2 * hold);
  }

  return whole + remappedFrac;
}

function wordHighlightIntensity(
  progress: number,
  wordIndex: number,
  wordCount: number,
  spread: number,
  linger: number,
): number {
  if (wordCount <= 1) return 1;

  const pos = warpProgressForLinger(progress, wordCount, linger) % wordCount;
  let dist = Math.abs(pos - wordIndex);
  dist = Math.min(dist, wordCount - dist);

  return Math.exp(-(dist * dist) / (2 * spread * spread));
}

function HighlightWord({
  token,
  wordIndex,
  wordCount,
  progress,
  highlightActive,
}: {
  token: WordToken;
  wordIndex: number;
  wordCount: number;
  progress: MotionValue<number>;
  highlightActive: boolean;
}) {
  const color = useTransform(progress, (value) => {
    const intensity = wordHighlightIntensity(
      value,
      wordIndex,
      wordCount,
      heroWordHighlightSpread,
      heroWordHighlightLinger,
    );
    const kaleMix = Math.round((1 - intensity) * 100);
    return `color-mix(in srgb, ${KALE_COLOR} ${kaleMix}%, ${BRAND_GREEN_COLOR})`;
  });

  return (
    <motion.span className="inline-block" style={highlightActive ? { color } : undefined}>
      <WordContent token={token} />
    </motion.span>
  );
}

function tokenizeLine(line: string, lineIndex: number, emphasis = true): WordToken[] {
  const tokens: WordToken[] = [];
  const source = emphasis ? line : line.replace(/\*([^*]+)\*/g, "$1");
  const parts = emphasis ? source.split(/\*([^*]+)\*/g) : [source];
  let wordIndex = 0;

  parts.forEach((part, i) => {
    if (!part) return;
    const emphasized = emphasis && i % 2 === 1;
    part.split(/\s+/).filter(Boolean).forEach((word) => {
      if (PUNCTUATION_ONLY.test(word) && tokens.length > 0) {
        const previous = tokens[tokens.length - 1];
        previous.trailingPunctuation = `${previous.trailingPunctuation ?? ""}${word}`;
        return;
      }

      tokens.push({
        text: word,
        emphasized,
        key: `${lineIndex}-${wordIndex++}`,
      });
    });
  });

  return tokens;
}

function tokenizeTitle(title: string, emphasis = true): WordToken[][] {
  return title
    .split("\n")
    .map((line, lineIndex) => tokenizeLine(line, lineIndex, emphasis));
}

function WordContent({ token }: { token: WordToken }) {
  return (
    <>
      {token.emphasized ? (
        <em className={headingEmphasisClassName}>{token.text}</em>
      ) : (
        token.text
      )}
      {token.trailingPunctuation}
    </>
  );
}

function AnimatedWords({
  tokens,
  compact,
  wordVariants,
  wordOffset = 0,
  wordCount = 0,
  highlightActive = false,
  highlightProgress,
}: {
  tokens: WordToken[];
  compact?: boolean;
  wordVariants: Variants;
  wordOffset?: number;
  wordCount?: number;
  highlightActive?: boolean;
  highlightProgress?: MotionValue<number>;
}) {
  const wordGap = compact ? "0.15em" : "0.25em";
  const { leading, trailing } = splitTokensForOrphanGuard(tokens);

  const renderAnimatedGroup = (group: WordToken[], startIndex: number) =>
    group.map((token, index) => {
      const flatIndex = wordOffset + startIndex + index;

      return (
        <motion.span
          key={token.key}
          variants={wordVariants}
          className="inline-block will-change-[transform,opacity,filter]"
          style={index < group.length - 1 ? { marginRight: wordGap } : undefined}
        >
          {highlightProgress ? (
            <HighlightWord
              token={token}
              wordIndex={flatIndex}
              wordCount={wordCount}
              progress={highlightProgress}
              highlightActive={highlightActive}
            />
          ) : (
            <WordContent token={token} />
          )}
        </motion.span>
      );
    });

  return (
    <>
      {leading.map((token, index) => {
        const flatIndex = wordOffset + index;

        return (
          <motion.span
            key={token.key}
            variants={wordVariants}
            className="inline-block will-change-[transform,opacity,filter]"
            style={index < leading.length - 1 || trailing ? { marginRight: wordGap } : undefined}
          >
            {highlightProgress ? (
              <HighlightWord
                token={token}
                wordIndex={flatIndex}
                wordCount={wordCount}
                progress={highlightProgress}
                highlightActive={highlightActive}
              />
            ) : (
              <WordContent token={token} />
            )}
          </motion.span>
        );
      })}
      {trailing && (
        <span className="inline max-lg:whitespace-normal lg:inline-block lg:whitespace-nowrap">
          {renderAnimatedGroup(trailing, leading.length)}
        </span>
      )}
    </>
  );
}

function splitTokensForOrphanGuard(tokens: WordToken[]): {
  leading: WordToken[];
  trailing: WordToken[] | null;
} {
  if (tokens.length <= 2) {
    return { leading: [], trailing: tokens.length > 0 ? tokens : null };
  }

  return {
    leading: tokens.slice(0, -2),
    trailing: tokens.slice(-2),
  };
}

function renderWordToken(
  token: WordToken,
  index: number,
  tokens: WordToken[],
  compact: boolean | undefined,
  render: (token: WordToken) => ReactNode,
) {
  const wordGap = compact ? "0.15em" : "0.25em";

  return (
    <span
      key={token.key}
      className="inline-block"
      style={index < tokens.length - 1 ? { marginRight: wordGap } : undefined}
    >
      {render(token)}
    </span>
  );
}

function StaticWords({
  tokens,
  compact,
}: {
  tokens: WordToken[];
  compact?: boolean;
}) {
  const { leading, trailing } = splitTokensForOrphanGuard(tokens);

  return (
    <>
      {leading.map((token, index) =>
        renderWordToken(token, index, leading, compact, (t) => <WordContent token={t} />),
      )}
      {trailing && (
        <span className="inline max-lg:whitespace-normal lg:inline-block lg:whitespace-nowrap">
          {trailing.map((token, index) =>
            renderWordToken(token, index, trailing, compact, (t) => <WordContent token={t} />),
          )}
        </span>
      )}
    </>
  );
}

function WordLine({
  tokens,
  multiline,
  animated,
  fitLine,
  wordVariants,
  wordOffset = 0,
  wordCount = 0,
  highlightActive = false,
  highlightProgress,
}: {
  tokens: WordToken[];
  multiline: boolean;
  animated: boolean;
  fitLine?: boolean;
  wordVariants?: Variants;
  wordOffset?: number;
  wordCount?: number;
  highlightActive?: boolean;
  highlightProgress?: MotionValue<number>;
}) {
  return (
    <span
      data-fit-line={fitLine ? "" : undefined}
      className={cn(
        multiline && "block",
        fitLine && "whitespace-nowrap",
        multiline && !fitLine && "lg:whitespace-nowrap",
      )}
    >
      {animated && wordVariants ? (
        <AnimatedWords
          tokens={tokens}
          compact={fitLine}
          wordVariants={wordVariants}
          wordOffset={wordOffset}
          wordCount={wordCount}
          highlightActive={highlightActive}
          highlightProgress={highlightProgress}
        />
      ) : (
        <StaticWords tokens={tokens} compact={fitLine} />
      )}
    </span>
  );
}

function countWords(lines: WordToken[][]): number {
  return lines.reduce((total, line) => total + line.length, 0);
}

function useWordHighlightLoop(
  wordCount: number,
  enabled: boolean,
  reduceMotion: boolean | null,
) {
  const progress = useMotionValue(0);
  const [highlightActive, setHighlightActive] = useState(false);

  useEffect(() => {
    if (!enabled || reduceMotion || wordCount === 0) {
      setHighlightActive(false);
      progress.set(0);
      return;
    }

    setHighlightActive(true);
    progress.set(0);

    const controls = animate(progress, wordCount, {
      duration: wordCount * heroWordHighlightCyclePerWord,
      ease: "linear",
      repeat: Infinity,
    });

    return () => controls.stop();
  }, [enabled, progress, reduceMotion, wordCount]);

  return {
    highlightProgress: progress,
    highlightActive: enabled && highlightActive && !reduceMotion,
  };
}

export interface AnimatedHeroHeadingProps {
  title: string;
  /** Semantic tag — defaults to h2 */
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** When true, each newline becomes a block line (home hero layout) */
  multiline?: boolean;
  /** When false, *asterisk* spans render as plain text */
  emphasis?: boolean;
  /** Scale font size down so each nowrap line fits the container (home hero) */
  fitText?: boolean;
  /** Upper bound (px) when fitText scales multiline headings — default 36 mobile, pass higher for desktop columns */
  fitTextMaxSizePx?: number;
  /** Per-word motion style */
  reveal?: "slide" | "blur";
  /** When to start the reveal — mount on load, inView after scroll */
  trigger?: "mount" | "inView";
  /** Seconds before the first word animates in */
  revealDelay?: number;
  /** Seconds between each word */
  revealStagger?: number;
  /** Fires once the word-by-word reveal finishes */
  onRevealComplete?: () => void;
  /** Fires once when the reveal animation begins */
  onRevealStart?: () => void;
  /** When true, the reveal waits until the home intro overlay has finished */
  waitForIntroReveal?: boolean;
  /** After reveal, cycle brand-green highlight across words one at a time */
  wordHighlight?: "loop";
}

const revealPresets = {
  slide: {
    wordVariants: heroWordVariants,
    containerVariants: heroWordContainerVariants,
  },
  blur: {
    wordVariants: blurWordVariants,
    containerVariants: blurWordContainerVariants,
  },
} as const;

/** Word-by-word hero heading reveal — waits for fonts, respects reduced motion */
export function AnimatedHeroHeading({
  title,
  as: Tag = "h2",
  className,
  multiline = false,
  emphasis = true,
  fitText = false,
  fitTextMaxSizePx = 36,
  reveal = "slide",
  trigger = "mount",
  revealDelay,
  revealStagger,
  onRevealComplete,
  onRevealStart,
  waitForIntroReveal = false,
  wordHighlight,
}: AnimatedHeroHeadingProps) {
  const reduceMotion = useReducedMotion();
  const introRevealed = useIntroRevealed();
  const headingRef = useRef<HTMLElement>(null);
  const inView = useInViewOnce(headingRef, sectionHeadingInViewOptions);
  const [fontsReady, setFontsReady] = useState(Boolean(reduceMotion));
  const [revealComplete, setRevealComplete] = useState(Boolean(reduceMotion));
  const parseEmphasis = wordHighlight !== "loop" && emphasis;
  const lines = useMemo(() => tokenizeTitle(title, parseEmphasis), [title, parseEmphasis]);
  const wordCount = useMemo(() => countWords(lines), [lines]);
  const highlightLoopEnabled = wordHighlight === "loop" && revealComplete;
  const { highlightProgress, highlightActive } = useWordHighlightLoop(
    wordCount,
    highlightLoopEnabled,
    reduceMotion,
  );
  const { wordVariants, containerVariants } = revealPresets[reveal];
  const resolvedContainerVariants = useMemo(() => {
    if (revealDelay == null && revealStagger == null) return containerVariants;

    const baseTransition =
      typeof containerVariants.visible === "object" &&
      containerVariants.visible !== null &&
      "transition" in containerVariants.visible
        ? containerVariants.visible.transition
        : {};

    return {
      ...containerVariants,
      visible: {
        transition: {
          ...baseTransition,
          ...(revealDelay != null ? { delayChildren: revealDelay } : {}),
          ...(revealStagger != null ? { staggerChildren: revealStagger } : {}),
        },
      },
    };
  }, [containerVariants, revealDelay, revealStagger]);
  const shouldFitText = fitText && multiline;
  const { containerRef, fontSizePx } = useFitMultilineText(
    shouldFitText ? lines.length : 0,
    { remeasureKey: fontsReady, maxSizePx: fitTextMaxSizePx },
  );
  const fitTextStyle =
    fontSizePx != null ? ({ fontSize: `${fontSizePx}px` } as CSSProperties) : undefined;
  const revealActive =
    (!waitForIntroReveal || introRevealed) &&
    (trigger === "inView" ? fontsReady && inView : fontsReady);
  const revealStartedRef = useRef(false);

  useEffect(() => {
    if (revealStartedRef.current) return;
    if (!reduceMotion && !revealActive) return;

    revealStartedRef.current = true;
    onRevealStart?.();
  }, [onRevealStart, reduceMotion, revealActive]);

  useEffect(() => {
    if (reduceMotion) {
      setFontsReady(true);
      onRevealComplete?.();
      return;
    }

    document.fonts.ready.then(() => setFontsReady(true));
  }, [onRevealComplete, reduceMotion]);

  if (reduceMotion) {
    return (
      <StaticHeroHeading
        Tag={Tag}
        className={className}
        lines={lines}
        multiline={multiline}
        fitTextStyle={shouldFitText ? fitTextStyle : undefined}
        fitContainerRef={shouldFitText ? containerRef : undefined}
        fitLine={shouldFitText}
      />
    );
  }

  const heading = (
    <Tag
      ref={headingRef}
      data-fit-heading={shouldFitText ? "" : undefined}
      style={shouldFitText ? fitTextStyle : undefined}
      className={cn(
        className,
        (!fontsReady || (waitForIntroReveal && !introRevealed)) && "invisible",
      )}
      aria-label={title.replace(/\*/g, "")}
    >
      <motion.span
        variants={resolvedContainerVariants}
        initial="hidden"
        animate={revealActive ? "visible" : "hidden"}
        onAnimationComplete={(definition) => {
          if (definition === "visible") {
            setRevealComplete(true);
            onRevealComplete?.();
          }
        }}
        className={cn(multiline && "flex flex-col")}
      >
        {lines.map((tokens, lineIndex) => {
          const wordOffset = lines
            .slice(0, lineIndex)
            .reduce((total, line) => total + line.length, 0);

          return (
            <WordLine
              key={lineIndex}
              tokens={tokens}
              multiline={multiline}
              animated
              fitLine={shouldFitText}
              wordVariants={wordVariants}
              wordOffset={wordOffset}
              wordCount={wordCount}
              highlightActive={highlightActive}
              highlightProgress={highlightLoopEnabled ? highlightProgress : undefined}
            />
          );
        })}
      </motion.span>
    </Tag>
  );

  if (!shouldFitText) return heading;

  return (
    <div ref={containerRef} className="w-full min-w-0">
      {heading}
    </div>
  );
}

function StaticHeroHeading({
  Tag,
  className,
  lines,
  multiline,
  fitTextStyle,
  fitContainerRef,
  fitLine,
}: {
  Tag: keyof JSX.IntrinsicElements;
  className?: string;
  lines: WordToken[][];
  multiline: boolean;
  fitTextStyle?: CSSProperties;
  fitContainerRef?: Ref<HTMLDivElement>;
  fitLine?: boolean;
}) {
  const heading = (
    <Tag
      data-fit-heading={fitLine ? "" : undefined}
      style={fitTextStyle}
      className={className}
    >
      <span className={cn(multiline && "flex flex-col")}>
        {lines.map((tokens, lineIndex) => (
          <WordLine
            key={lineIndex}
            tokens={tokens}
            multiline={multiline}
            animated={false}
            fitLine={fitLine}
          />
        ))}
      </span>
    </Tag>
  );

  if (!fitLine || !fitContainerRef) return heading;

  return (
    <div ref={fitContainerRef} className="w-full min-w-0">
      {heading}
    </div>
  );
}

export default AnimatedHeroHeading;
