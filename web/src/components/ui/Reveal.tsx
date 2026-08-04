import { cn } from "@/lib/cn";
import { fadeInUp, motion, useReducedMotion } from "@/lib/motion";
import type { ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Scroll-triggered fade-in — uses Framer Motion `whileInView` */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
