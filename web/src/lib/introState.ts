/**
 * Shared state for the home page intro overlay.
 * Module-level: resets on hard page reload, persists across Astro SPA navigations.
 */

export const INTRO_HOLD_S = 1.8;
// Text fades (0.4s) then panel fades (0.65s with 0.15s start delay = 0.8s total).
export const INTRO_EXIT_S = 0.8;

/** Total intro duration — hold + exit. */
export const INTRO_TOTAL_S = INTRO_HOLD_S + INTRO_EXIT_S;

/** True once the intro overlay has finished (skip replay on SPA nav). */
export let introHasPlayed = false;

/** True once the homepage is visible — hero/nav animations may begin. */
export let introRevealed = false;

type IntroRevealListener = () => void;
const listeners = new Set<IntroRevealListener>();

export function isIntroRevealed(): boolean {
  return introRevealed;
}

/** Call when the overlay finishes or is skipped (reduced motion, inner page). */
export function markIntroRevealed(): void {
  if (introRevealed) return;
  introRevealed = true;
  introHasPlayed = true;
  for (const listener of listeners) listener();
}

export function subscribeIntroRevealed(listener: IntroRevealListener): () => void {
  if (introRevealed) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @deprecated Use markIntroRevealed */
export function markIntroPlayed(): void {
  markIntroRevealed();
}

/** @deprecated Use INTRO_EXIT_S */
export const INTRO_WIPE_S = INTRO_EXIT_S;
