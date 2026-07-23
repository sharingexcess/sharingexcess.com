import { cn } from "@/lib/cn";
import {
  blurWordContainerVariants,
  blurWordVariants,
  heroWordContainerVariants,
  heroWordVariants,
  motion,
  sectionHeadingInViewOptions,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useFitMultilineText } from "@/lib/useFitText";
import type { CSSProperties, JSX, Ref } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type WordToken = { text: string; emphasized: boolean; key: string };

function tokenizeLine(line: string, lineIndex: number, emphasis = true): WordToken[] {
  const tokens: WordToken[] = [];
  const source = emphasis ? line : line.replace(/\*([^*]+)\*/g, "$1");
  const parts = emphasis ? source.split(/\*([^*]+)\*/g) : [source];
  let wordIndex = 0;

  parts.forEach((part, i) => {
    if (!part) return;
    const emphasized = emphasis && i % 2 === 1;
    part.split(/\s+/).filter(Boolean).forEach((word) => {
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
  if (token.emphasized) {
    return (
      <em className="not-italic text-[var(--section-emphasis)]">{token.text}</em>
    );
  }
  return token.text;
}

function AnimatedWords({
  tokens,
  compact,
  wordVariants,
}: {
  tokens: WordToken[];
  compact?: boolean;
  wordVariants: Variants;
}) {
  const wordGap = compact ? "0.15em" : "0.25em";
  return tokens.map((token, i) => (
    <motion.span
      key={token.key}
      variants={wordVariants}
      className="inline-block will-change-[transform,opacity,filter]"
      style={i < tokens.length - 1 ? { marginRight: wordGap } : undefined}
    >
      <WordContent token={token} />
    </motion.span>
  ));
}

function StaticWords({
  tokens,
  compact,
}: {
  tokens: WordToken[];
  compact?: boolean;
}) {
  const wordGap = compact ? "0.15em" : "0.25em";
  return tokens.map((token, i) => (
    <span
      key={token.key}
      className="inline-block"
      style={i < tokens.length - 1 ? { marginRight: wordGap } : undefined}
    >
      <WordContent token={token} />
    </span>
  ));
}

function WordLine({
  tokens,
  multiline,
  animated,
  fitLine,
  wordVariants,
}: {
  tokens: WordToken[];
  multiline: boolean;
  animated: boolean;
  fitLine?: boolean;
  wordVariants?: Variants;
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
        <AnimatedWords tokens={tokens} compact={fitLine} wordVariants={wordVariants} />
      ) : (
        <StaticWords tokens={tokens} compact={fitLine} />
      )}
    </span>
  );
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
  reveal = "slide",
  trigger = "mount",
  revealDelay,
  revealStagger,
  onRevealComplete,
}: AnimatedHeroHeadingProps) {
  const reduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLElement>(null);
  const inView = useInViewOnce(headingRef, sectionHeadingInViewOptions);
  const [fontsReady, setFontsReady] = useState(Boolean(reduceMotion));
  const lines = useMemo(() => tokenizeTitle(title, emphasis), [title, emphasis]);
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
    { remeasureKey: fontsReady, maxSizePx: 36 },
  );
  const fitTextStyle =
    fontSizePx != null ? ({ fontSize: `${fontSizePx}px` } as CSSProperties) : undefined;
  const revealActive = trigger === "inView" ? fontsReady && inView : fontsReady;

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
      className={cn(className, !fontsReady && "invisible")}
      aria-label={title.replace(/\*/g, "")}
    >
      <motion.span
        variants={resolvedContainerVariants}
        initial="hidden"
        animate={revealActive ? "visible" : "hidden"}
        onAnimationComplete={(definition) => {
          if (definition === "visible") onRevealComplete?.();
        }}
        className={cn(multiline && "flex flex-col")}
      >
        {lines.map((tokens, lineIndex) => (
          <WordLine
            key={lineIndex}
            tokens={tokens}
            multiline={multiline}
            animated
            fitLine={shouldFitText}
            wordVariants={wordVariants}
          />
        ))}
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
