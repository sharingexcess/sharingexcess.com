/** Stable per-dot jitter — matches hero halftone grid (Antimetal-style hash). */
function dotHash(col: number, row: number): number {
  const s = Math.sin(col * 12.9898 + row * 78.233) * 43_758.5453;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export type ButtonHalftoneDiscOptions = {
  gridSpacing: number;
  dotMin: number;
  dotMax: number;
  /** Normalized radius where the interior reads as a solid fill */
  solidInner: number;
  /** Normalized radius where halftone thinning begins */
  edgeStart: number;
};

const DEFAULT_OPTIONS: ButtonHalftoneDiscOptions = {
  gridSpacing: 4.5,
  dotMin: 0.42,
  dotMax: 1.18,
  solidInner: 0.74,
  edgeStart: 0.8,
};

/**
 * Paint a circular color wipe with a halftone dissolve at the perimeter —
 * dense dots read as solid fill; the leading edge breaks into the hero-style grid.
 */
export function paintHalftoneDisc(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  options: Partial<ButtonHalftoneDiscOptions> = {},
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { gridSpacing, dotMin, dotMax, solidInner, edgeStart } = opts;

  ctx.clearRect(0, 0, width, height);
  if (width <= 0 || height <= 0) return;

  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.5;

  const cols = Math.ceil(width / gridSpacing) + 2;
  const rows = Math.ceil(height / gridSpacing) + 2;

  ctx.fillStyle = color;

  for (let row = 0; row < rows; row++) {
    const offsetX = row % 2 === 0 ? 0 : gridSpacing * 0.5;

    for (let col = 0; col < cols; col++) {
      const x = col * gridSpacing + offsetX - gridSpacing * 0.5;
      const y = row * gridSpacing - gridSpacing * 0.5;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;

      const t = dist / radius;
      const hash = dotHash(col, row);
      const jitter = 0.78 + hash * 0.44;

      if (t > edgeStart) {
        const edgeT = smoothstep(edgeStart, 1, t);
        const keep = hash > edgeT * 0.92;
        if (!keep) continue;
      }

      const crest = smoothstep(solidInner, 1, t);
      const sizeMix = 1 - crest * 0.22;
      const dotRadius =
        (dotMin + sizeMix * (dotMax - dotMin)) * jitter * (1 + crest * 0.18);
      const alpha = t < solidInner ? 1 : 1 - smoothstep(edgeStart, 1, t) * 0.35;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}
