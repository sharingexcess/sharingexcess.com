import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export interface MotionProviderProps {
  children: ReactNode;
}

/** Respects `prefers-reduced-motion` for all descendant motion components */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
