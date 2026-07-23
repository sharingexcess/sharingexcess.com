import Lenis from "lenis";
import { getLenisInstance, setLenisInstance, subscribeLenisInstance } from "@/lib/lenisInstance";
import {
  destroyRoundSectionScrollLock,
  initRoundSectionScrollLock,
} from "@/lib/roundSectionScrollLock";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  const context = useContext(LenisContext);
  const [globalLenis, setGlobalLenis] = useState(() => context ?? getLenisInstance());

  useEffect(() => {
    if (context) {
      setGlobalLenis(context);
      return;
    }

    return subscribeLenisInstance(setGlobalLenis);
  }, [context]);

  return context ?? globalLenis;
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
      autoRaf: false,
      duration: 1.1,
      smoothWheel: true,
    });

    setLenis(instance);
    setLenisInstance(instance);
    initRoundSectionScrollLock(instance);

    return () => {
      destroyRoundSectionScrollLock();
      instance.destroy();
      setLenis(null);
      setLenisInstance(null);
    };
  }, [enabled]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
