import { scrollProgressInTrack } from "@/lib/useScrollDrivenIndex";

export const BRIDGE_DEFAULT_ANIMATION_VH = 420;
export const BRIDGE_DEFAULT_HOLD_VH = 72;

/** Fraction of total track height used for hero + statement animation (rest is hold) */
export function bridgeAnimationFraction(animationVh: number, holdVh: number): number {
  const total = animationVh + holdVh;
  return total > 0 ? animationVh / total : 1;
}

/** Map raw scroll through the animation zone, then hold at 1 until the track ends */
export function bridgeScrollProgress(track: HTMLElement, animationFraction: number): number {
  const raw = scrollProgressInTrack(track);
  if (animationFraction >= 1) return raw;
  return Math.min(1, raw / animationFraction);
}
