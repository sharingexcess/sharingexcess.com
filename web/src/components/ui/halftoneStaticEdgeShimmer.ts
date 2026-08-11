import {
  RIPPLE_COLORS,
  contentMaskRippleVisibility,
  resolveContentMaskEllipse,
  type RippleContentMask,
} from "./heroHalftoneRipple";

const BASE_DOT_COLOR = "#69b57b";
const BASE_GRID_DOT_RADIUS = 0.62;
const BASE_GRID_ALPHA = 0.24;

type GridCell = {
  x: number;
  y: number;
  jitter: number;
  colorIndex: number;
  phase: number;
  twinkleSpeed: number;
};

export type HalftoneStaticEdgeShimmerOptions = {
  gridSpacing: number;
  dotMin: number;
  dotMax: number;
  /** Normalized ellipse radius where edge shimmer peaks (~1 = on the oval) */
  edgeBandCenter: number;
  edgeBandSigma: number;
  twinkleSpeedMin: number;
  twinkleSpeedMax: number;
  /** Traveling shimmer around the oval perimeter */
  angularWaveSpeed: number;
  angularWavePeaks: number;
};

const DEFAULT_OPTIONS: HalftoneStaticEdgeShimmerOptions = {
  gridSpacing: 9,
  dotMin: 0.38,
  dotMax: 2.08,
  edgeBandCenter: 0.98,
  edgeBandSigma: 0.16,
  twinkleSpeedMin: 2.4,
  twinkleSpeedMax: 5.8,
  angularWaveSpeed: 3.2,
  angularWavePeaks: 5,
};

function dotHash(col: number, row: number): number {
  const s = Math.sin(col * 12.9898 + row * 78.233) * 43_758.5453;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function normalizedEllipseT(
  x: number,
  y: number,
  mask: RippleContentMask | null,
): number {
  if (!mask) return 1;

  const { cx, cy, rx, ry } = resolveContentMaskEllipse(mask);
  if (rx <= 0 || ry <= 0) return 1;

  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return Math.hypot(nx, ny);
}

function edgeBandWeight(t: number, center: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const d = (t - center) / sigma;
  const gauss = Math.exp(-0.5 * d * d);
  return gauss * smoothstep(0.62, 0.88, t);
}

export class HalftoneStaticEdgeShimmerEngine {
  private readonly options: HalftoneStaticEdgeShimmerOptions;
  private readonly grid: GridCell[] = [];
  private baseCanvas: HTMLCanvasElement | null = null;
  private baseCtx: CanvasRenderingContext2D | null = null;
  private contentMask: RippleContentMask | null = null;
  private logicalWidth = 0;
  private logicalHeight = 0;
  private dpr = 1;

  constructor(options: Partial<HalftoneStaticEdgeShimmerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  setContentMask(mask: RippleContentMask | null) {
    this.contentMask = mask;
    this.rebuildBaseCanvas();
  }

  rebuild(width: number, height: number, dpr: number) {
    this.logicalWidth = width;
    this.logicalHeight = height;
    this.dpr = dpr;
    this.rebuildGrid();
    this.rebuildBaseCanvas();
  }

  private rebuildGrid() {
    const { gridSpacing } = this.options;
    const { logicalWidth: width, logicalHeight: height } = this;
    const cols = Math.ceil(width / gridSpacing) + 2;
    const rows = Math.ceil(height / gridSpacing) + 2;

    this.grid.length = 0;

    for (let row = 0; row < rows; row++) {
      const offsetX = row % 2 === 0 ? 0 : gridSpacing * 0.5;

      for (let col = 0; col < cols; col++) {
        const x = col * gridSpacing + offsetX - gridSpacing * 0.5;
        const y = row * gridSpacing - gridSpacing * 0.5;

        if (x < -gridSpacing || x > width + gridSpacing) continue;
        if (y < -gridSpacing || y > height + gridSpacing) continue;

        const hash = dotHash(col, row);
        const hashP = dotHash(col + 23, row + 29);
        const hashS = dotHash(col + 7, row + 11);

        this.grid.push({
          x,
          y,
          jitter: 0.78 + hash * 0.44,
          colorIndex: Math.floor(hash * RIPPLE_COLORS.length) % RIPPLE_COLORS.length,
          phase: hashP * Math.PI * 2,
          twinkleSpeed:
            this.options.twinkleSpeedMin +
            hashS * (this.options.twinkleSpeedMax - this.options.twinkleSpeedMin),
        });
      }
    }
  }

  private rebuildBaseCanvas() {
    const { logicalWidth: width, logicalHeight: height, dpr } = this;
    if (width <= 0 || height <= 0) return;

    if (!this.baseCanvas) {
      this.baseCanvas = document.createElement("canvas");
    }

    this.baseCanvas.width = Math.round(width * dpr);
    this.baseCanvas.height = Math.round(height * dpr);

    const ctx = this.baseCanvas.getContext("2d");
    if (!ctx) return;

    this.baseCtx = ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BASE_DOT_COLOR;

    for (const cell of this.grid) {
      const maskVis = contentMaskRippleVisibility(cell.x, cell.y, this.contentMask);
      if (maskVis < 0.008) continue;

      const radius = BASE_GRID_DOT_RADIUS * cell.jitter;
      ctx.globalAlpha = BASE_GRID_ALPHA * maskVis;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nowMs: number,
    reveal = 1,
  ) {
    ctx.clearRect(0, 0, width, height);

    if (reveal <= 0.004) return;

    if (this.baseCanvas) {
      ctx.globalAlpha = reveal;
      ctx.drawImage(this.baseCanvas, 0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    const {
      dotMin,
      dotMax,
      edgeBandCenter,
      edgeBandSigma,
      angularWaveSpeed,
      angularWavePeaks,
    } = this.options;
    const tSec = nowMs / 1000;
    const mask = this.contentMask;

    for (const cell of this.grid) {
      const maskVis = contentMaskRippleVisibility(cell.x, cell.y, mask);
      if (maskVis < 0.008) continue;

      const ellipseT = normalizedEllipseT(cell.x, cell.y, mask);
      const band = edgeBandWeight(ellipseT, edgeBandCenter, edgeBandSigma);
      if (band < 0.04 || !mask) continue;

      const { cx, cy, rx, ry } = resolveContentMaskEllipse(mask);
      const nx = (cell.x - cx) / Math.max(rx, 1);
      const ny = (cell.y - cy) / Math.max(ry, 1);
      const angle = Math.atan2(ny, nx);
      const travel =
        0.5 +
        0.5 *
          Math.sin(
            angle * angularWavePeaks + tSec * angularWaveSpeed + cell.phase * 0.35,
          );
      const twinkle = 0.42 + 0.58 * Math.sin(tSec * cell.twinkleSpeed + cell.phase);
      const amp = band * twinkle * (0.55 + 0.45 * travel);
      if (amp < 0.05) continue;

      const sizeT = Math.min(1, amp * 1.15);
      const radius =
        (dotMin + sizeT * (dotMax - dotMin)) * cell.jitter * (0.88 + amp * 0.22);
      const alpha = (0.28 + amp * 0.62) * maskVis * reveal;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = RIPPLE_COLORS[cell.colorIndex] ?? RIPPLE_COLORS[0];
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
