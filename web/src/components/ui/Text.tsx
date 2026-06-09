import { cn } from "@/lib/cn";

export interface TextProps {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span";
}

export function Text({ children, className, as: Tag = "p" }: TextProps) {
  return <Tag className={cn("text-base leading-relaxed", className)}>{children}</Tag>;
}

export default Text;
