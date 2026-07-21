import { cn } from "@/lib/cn";

export interface TextProps {
  children: React.ReactNode;
  size?: "xl" | "lg" | "md";
  className?: string;
  as?: "p" | "span";
}

// Maps to Foundations/Typography Paragraph styles
const sizeClasses = {
  xl: "text-[20px] leading-[1.6]",
  lg: "text-[18px] leading-[1.4]",
  md: "text-base   leading-[1.4]",
};

export function Text({ children, size = "md", className, as: Tag = "p" }: TextProps) {
  return (
    <Tag className={cn("text-kale", sizeClasses[size], className)}>
      {children}
    </Tag>
  );
}

export default Text;
