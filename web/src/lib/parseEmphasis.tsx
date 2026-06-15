import type { ReactNode } from "react";

/**
 * Splits a heading string on *asterisk-wrapped* spans and returns a ReactNode
 * array. Emphasized runs are wrapped in <em> styled with --section-emphasis.
 *
 * Usage:  parseEmphasis("*Food rescue* at scale.")
 *  →  [<em>Food rescue</em>, " at scale."]
 */
export function parseEmphasis(text: string, emphasis = true): ReactNode[] {
  if (!emphasis) {
    return [text.replace(/\*([^*]+)\*/g, "$1")];
  }

  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="not-italic text-[var(--section-emphasis)]">
        {part}
      </em>
    ) : (
      part
    ),
  );
}
