import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export interface SmoothScrollProviderProps {
  children: ReactNode;
  /** Lenis smooth scroll — disable in Storybook or for reduced-motion users */
  enabled?: boolean;
}

export function SmoothScrollProvider({
  children,
  enabled = true,
}: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const instance = new Lenis({
      autoRaf: true,
      duration: 1.1,
      smoothWheel: true,
    });

    setLenis(instance);

    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, [enabled]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
