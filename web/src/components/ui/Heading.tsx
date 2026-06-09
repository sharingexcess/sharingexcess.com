import type { JSX } from "react";
import { cn } from "@/lib/cn";

export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

const levelClasses = {
  1: "text-4xl font-bold tracking-tight md:text-5xl",
  2: "text-3xl font-bold tracking-tight",
  3: "text-2xl font-semibold",
  4: "text-xl font-semibold",
};

export function Heading({ children, level = 2, className }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={cn(levelClasses[level], className)}>{children}</Tag>;
}

export default Heading;
