import type Lenis from "lenis";

type LenisListener = (instance: Lenis | null) => void;

let lenisInstance: Lenis | null = null;
const listeners = new Set<LenisListener>();

/** Register the global Lenis instance (SmoothScrollProvider). */
export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
  for (const listener of listeners) listener(instance);
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

/** Subscribe to Lenis mount/unmount — for Astro islands outside AppProviders. */
export function subscribeLenisInstance(listener: LenisListener): () => void {
  listeners.add(listener);
  listener(lenisInstance);
  return () => listeners.delete(listener);
}
