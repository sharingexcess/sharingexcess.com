/** Scroll depth fade — 0 below `startDepth`, 1 above `endDepth`. */
export function measureDepthFadeProgress(
  scrollDepth: number,
  totalHeight: number,
  startRatio: number,
  endRatio: number,
): number {
  if (totalHeight <= 0 || endRatio <= startRatio) return scrollDepth > 0 ? 1 : 0;

  const startDepth = startRatio * totalHeight;
  const endDepth = endRatio * totalHeight;
  const span = endDepth - startDepth;
  if (span <= 0) return 0;

  return Math.max(0, Math.min(1, (scrollDepth - startDepth) / span));
}
