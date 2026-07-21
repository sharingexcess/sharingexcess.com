import type { ReactNode } from "react";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Splits body copy on [label](url) spans and returns inline <a> elements.
 *
 * Usage: parseBodyLinks("Learn more on [Surplus](https://surplus.sharingexcess.com).")
 */
export function parseBodyLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    const href = match[2];
    const external = href.startsWith("http");
    parts.push(
      <a
        key={key++}
        href={href}
        className="underline underline-offset-2 hover:opacity-80"
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {match[1]}
      </a>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
