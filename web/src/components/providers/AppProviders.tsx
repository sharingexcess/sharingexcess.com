import { createContext, useContext, type ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageTransitionCurtain } from "@/components/transitions/PageTransitionCurtain";
import { MotionProvider } from "./MotionProvider";
import { SmoothScrollProvider } from "./SmoothScrollProvider";

const ScrollInteractionContext = createContext(true);

/** Whether scroll-triggered snap/reveal behavior is active (off in Storybook). */
export function useScrollInteractionsEnabled() {
  return useContext(ScrollInteractionContext);
}

export interface AppProvidersProps {
  children?: ReactNode;
  /** Lenis smooth scroll — off in Storybook or for reduced-motion users */
  smoothScroll?: boolean;
  /** Scroll snap / reveal — off in Storybook so components render immediately */
  scrollInteractions?: boolean;
  /** Render the fixed site header (off in Storybook when previewing the header itself) */
  showHeader?: boolean;
  /** Server-known home route — avoids header style flash before client effects run */
  isHomePage?: boolean;
}

/** Headless global providers (Lenis + motion config) and optional site header. Mount once in BaseLayout. */
export function AppProviders({
  children,
  smoothScroll = true,
  scrollInteractions = true,
  showHeader = true,
  isHomePage = false,
}: AppProvidersProps) {
  return (
    <MotionProvider>
      <ScrollInteractionContext.Provider value={scrollInteractions}>
        <SmoothScrollProvider enabled={smoothScroll}>
          <PageTransitionCurtain />
          {showHeader && <SiteHeader isHomePage={isHomePage} />}
          {children}
        </SmoothScrollProvider>
      </ScrollInteractionContext.Provider>
    </MotionProvider>
  );
}
