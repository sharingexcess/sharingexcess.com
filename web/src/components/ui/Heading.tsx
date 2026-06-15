import type { JSX } from "react";
import { cn } from "@/lib/cn";

export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

// Maps to Foundations/Typography documented styles (Poppins Medium).
// cqw clamps target 1512px Figma artboard — parent needs `@container` (see SectionShell).
const levelClasses = {
  1: "text-[clamp(64px,7.94cqw,120px)] font-medium leading-none tracking-[-0.05em]", // Hero H1
  2: "text-[clamp(48px,6.35cqw,96px)] font-medium leading-[1.06] tracking-[-0.04em]", // Section H1
  3: "text-[clamp(40px,4.76cqw,72px)] font-medium leading-[1.06] tracking-[-0.04em]", // Section H2
  4: "text-[32px] font-medium leading-[1.1]", // sub-label
};

export function Heading({ children, level = 2, className }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={cn("text-kale", levelClasses[level], className)}>
      {children}
    </Tag>
  );
}

export default Heading;
