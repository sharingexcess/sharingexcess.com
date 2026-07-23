import { connectGsapLenis } from "@/lib/connectGsapLenis";
import { registerGsapPlugins } from "@/lib/gsap";
import { useEffect, type ReactNode } from "react";
import { useLenis } from "./SmoothScrollProvider";

export interface GsapProviderProps {
  children: ReactNode;
}

/** Registers GSAP plugins and connects ScrollTrigger to Lenis when smooth scroll is active. */
export function GsapProvider({ children }: GsapProviderProps) {
  const lenis = useLenis();

  useEffect(() => {
    registerGsapPlugins();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    return connectGsapLenis(lenis);
  }, [lenis]);

  return children;
}
