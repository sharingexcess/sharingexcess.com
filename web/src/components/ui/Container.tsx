import { cn } from "@/lib/cn";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto max-w-6xl px-6", className)}>{children}</div>;
}

export default Container;
