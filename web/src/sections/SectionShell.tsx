import { cn } from "@/lib/cn";
import type { SectionProps } from "@/lib/types";

export interface SectionShellProps extends SectionProps {
  children: React.ReactNode;
  as?: "section" | "div";
  /** Inner content max-width — Figma artboard content is 1320px (1512 − 96px padding) */
  contentClassName?: string;
}

export function SectionShell({
  theme = "light",
  id,
  className,
  contentClassName,
  children,
  as: Tag = "section",
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      data-theme={theme}
      className={cn(
        "relative overflow-hidden bg-[var(--section-bg)] px-6 py-12 text-[var(--section-text)] lg:px-24 lg:py-[120px]",
        className,
      )}
    >
      <div className={cn("@container mx-auto max-w-6xl", contentClassName)}>{children}</div>
    </Tag>
  );
}

export default SectionShell;
