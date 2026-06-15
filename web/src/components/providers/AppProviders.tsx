import type { ReactNode } from "react";
import { MotionProvider } from "./MotionProvider";
import { SmoothScrollProvider } from "./SmoothScrollProvider";

export interface AppProvidersProps {
  children: ReactNode;
  /** Lenis smooth scroll — off in Storybook by default */
  smoothScroll?: boolean;
}

export function AppProviders({
  children,
  smoothScroll = true,
}: AppProvidersProps) {
  return (
    <MotionProvider>
      <SmoothScrollProvider enabled={smoothScroll}>
        {children}
      </SmoothScrollProvider>
    </MotionProvider>
  );
}
