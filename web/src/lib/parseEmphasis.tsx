import {
  headingEmphasisClassName,
  paragraphEmphasisClassName,
} from "@/lib/typography";
import type { ReactNode } from "react";

export type EmphasisContext = "heading" | "paragraph";

/**
 * Splits a string on *asterisk-wrapped* spans and returns a ReactNode array.
 * Emphasized runs are wrapped in <em> styled with --section-emphasis.
 *
 * Usage:  parseEmphasis("*Food rescue* at scale.")
 *  →  [<em>Food rescue</em>, " at scale."]
 */
export function parseEmphasis(
  text: string,
  emphasis = true,
  context: EmphasisContext = "heading",
): ReactNode[] {
  if (!emphasis) {
    return [text.replace(/\*([^*]+)\*/g, "$1")];
  }

  const emphasisClassName =
    context === "paragraph" ? paragraphEmphasisClassName : headingEmphasisClassName;

  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className={emphasisClassName}>
        {part}
      </em>
    ) : (
      part
    ),
  );
}
