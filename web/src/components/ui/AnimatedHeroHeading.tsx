import { cn } from "@/lib/cn";
import {
  heroWordContainerVariants,
  heroWordVariants,
  motion,
  useReducedMotion,
} from "@/lib/motion";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";

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

function AnimatedWords({ tokens }: { tokens: WordToken[] }) {
  return tokens.map((token, i) => (
    <motion.span
      key={token.key}
      variants={heroWordVariants}
      className="inline-block will-change-[transform,opacity]"
      style={i < tokens.length - 1 ? { marginRight: "0.25em" } : undefined}
    >
      <WordContent token={token} />
    </motion.span>
  ));
}

function StaticWords({ tokens }: { tokens: WordToken[] }) {
  return tokens.map((token, i) => (
    <span
      key={token.key}
      className="inline-block"
      style={i < tokens.length - 1 ? { marginRight: "0.25em" } : undefined}
    >
      <WordContent token={token} />
    </span>
  ));
}

function WordLine({
  tokens,
  multiline,
  animated,
}: {
  tokens: WordToken[];
  multiline: boolean;
  animated: boolean;
}) {
  return (
    <span className={cn(multiline && "block whitespace-nowrap")}>
      {animated ? <AnimatedWords tokens={tokens} /> : <StaticWords tokens={tokens} />}
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
}

/** Word-by-word hero heading reveal — waits for fonts, respects reduced motion */
export function AnimatedHeroHeading({
  title,
  as: Tag = "h2",
  className,
  multiline = false,
  emphasis = true,
}: AnimatedHeroHeadingProps) {
  const reduceMotion = useReducedMotion();
  const [fontsReady, setFontsReady] = useState(Boolean(reduceMotion));
  const lines = useMemo(() => tokenizeTitle(title, emphasis), [title, emphasis]);

  useEffect(() => {
    if (reduceMotion) {
      setFontsReady(true);
      return;
    }

    document.fonts.ready.then(() => setFontsReady(true));
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <StaticHeroHeading
        Tag={Tag}
        className={className}
        lines={lines}
        multiline={multiline}
      />
    );
  }

  return (
    <Tag
      className={cn(className, !fontsReady && "invisible")}
      aria-label={title.replace(/\*/g, "")}
    >
      <motion.span
        variants={heroWordContainerVariants}
        initial="hidden"
        animate={fontsReady ? "visible" : "hidden"}
        className={cn(multiline && "flex flex-col")}
      >
        {lines.map((tokens, lineIndex) => (
          <WordLine
            key={lineIndex}
            tokens={tokens}
            multiline={multiline}
            animated
          />
        ))}
      </motion.span>
    </Tag>
  );
}

function StaticHeroHeading({
  Tag,
  className,
  lines,
  multiline,
}: {
  Tag: keyof JSX.IntrinsicElements;
  className?: string;
  lines: WordToken[][];
  multiline: boolean;
}) {
  return (
    <Tag className={className}>
      <span className={cn(multiline && "flex flex-col")}>
        {lines.map((tokens, lineIndex) => (
          <WordLine
            key={lineIndex}
            tokens={tokens}
            multiline={multiline}
            animated={false}
          />
        ))}
      </span>
    </Tag>
  );
}

export default AnimatedHeroHeading;
