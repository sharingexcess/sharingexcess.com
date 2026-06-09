import { cn } from "@/lib/cn";
import type { SectionProps } from "@/lib/types";

export interface SectionShellProps extends SectionProps {
  children: React.ReactNode;
  as?: "section" | "div";
}

export function SectionShell({
  theme = "light",
  id,
  className,
  children,
  as: Tag = "section",
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      data-theme={theme}
      className={cn(
        "bg-[var(--section-bg)] px-6 py-16 text-[var(--section-text)]",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </Tag>
  );
}

export default SectionShell;
