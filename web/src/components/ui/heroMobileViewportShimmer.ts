import {
  RIPPLE_COLORS,
  contentMaskRippleVisibility,
  type RippleContentMask,
} from "./heroHalftoneRipple";

const BASE_DOT_COLOR = "#69b57b";
const BASE_GRID_DOT_RADIUS = 0.62;
const BASE_GRID_ALPHA = 0.24;

/** Seconds for green → yellow → orange → green */
const COLOR_CYCLE_SEC = 6;
const VIEWPORT_EDGE_BAND = 96;
const ANGULAR_WAVE_SPEED = 2.6;
const ANGULAR_WAVE_PEAKS = 4;

type GridCell = {
  x: number;
  y: number;
  jitter: number;
  phase: number;
  twinkleSpeed: number;
};

function dotHash(col: number, row: number): number {
  const s = Math.sin(col * 12.9898 + row * 78.233) * 43_758.5453;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/** Green → yellow → orange → green */
export function sampleViewportShimmerColor(tSec: number): string {
  const phase = (tSec % COLOR_CYCLE_SEC) / COLOR_CYCLE_SEC;
  const segment = phase * 3;
  const index = Math.floor(segment) % 3;
  const t = segment - Math.floor(segment);
  const from = RIPPLE_COLORS[index] ?? RIPPLE_COLORS[0];
  const to = RIPPLE_COLORS[(index + 1) % RIPPLE_COLORS.length] ?? RIPPLE_COLORS[0];
  return lerpHex(from, to, t);
}

function viewportEdgeWeight(
  x: number,
  y: number,
  width: number,
  height: number,
  bandDepth = VIEWPORT_EDGE_BAND,
): number {
  const edgeDist = Math.min(x, width - x, y, height - y);
  return 1 - smoothstep(0, bandDepth, edgeDist);
}

function perimeterTravel(
  x: number,
  y: number,
  width: number,
  height: number,
  tSec: number,
  phase: number,
): number {
  const angle = Math.atan2(y - height / 2, x - width / 2);
  return (
    0.5 +
    0.5 * Math.sin(angle * ANGULAR_WAVE_PEAKS + tSec * ANGULAR_WAVE_SPEED + phase * 0.35)
  );
}

export class HeroMobileViewportShimmerEngine {
  private readonly grid: GridCell[] = [];
  private baseCanvas: HTMLCanvasElement | null = null;
  private contentMask: RippleContentMask | null = null;
  private logicalWidth = 0;
  private logicalHeight = 0;
  private dpr = 1;
  private readonly gridSpacing = 7;
  private readonly dotMin = 0.38;
  private readonly dotMax = 2.08;

  setContentMask(mask: RippleContentMask | null) {
    if (
      this.contentMask &&
      mask &&
      this.contentMask.left === mask.left &&
      this.contentMask.top === mask.top &&
      this.contentMask.right === mask.right &&
      this.contentMask.bottom === mask.bottom
    ) {
      return;
    }
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

  private maskVisibility(x: number, y: number): number {
    return contentMaskRippleVisibility(x, y, this.contentMask, "mobile-hero");
  }

  private rebuildGrid() {
    const { logicalWidth: width, logicalHeight: height, gridSpacing } = this;
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
          phase: hashP * Math.PI * 2,
          twinkleSpeed: 2.4 + hashS * 3.4,
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

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BASE_DOT_COLOR;

    for (const cell of this.grid) {
      const maskVis = this.maskVisibility(cell.x, cell.y);
      if (maskVis < 0.008) continue;

      const radius = BASE_GRID_DOT_RADIUS * cell.jitter;
      ctx.globalAlpha = BASE_GRID_ALPHA * maskVis;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  drawStatic(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
    if (this.baseCanvas) {
      ctx.drawImage(this.baseCanvas, 0, 0, width, height);
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nowMs: number,
    shimmerActive = true,
  ) {
    ctx.clearRect(0, 0, width, height);

    if (this.baseCanvas) {
      ctx.drawImage(this.baseCanvas, 0, 0, width, height);
    }

    if (!shimmerActive) return;

    const tSec = nowMs / 1000;
    const shimmerColor = sampleViewportShimmerColor(tSec);

    for (const cell of this.grid) {
      const maskVis = this.maskVisibility(cell.x, cell.y);
      if (maskVis < 0.008) continue;

      const edge = viewportEdgeWeight(cell.x, cell.y, width, height);
      if (edge < 0.04) continue;

      const travel = perimeterTravel(cell.x, cell.y, width, height, tSec, cell.phase);
      const twinkle = 0.46 + 0.54 * Math.sin(tSec * cell.twinkleSpeed + cell.phase);
      const amp = edge * twinkle * (0.5 + 0.5 * travel) * maskVis;
      if (amp < 0.05) continue;

      const sizeT = Math.min(1, amp * 1.12);
      const radius =
        (this.dotMin + sizeT * (this.dotMax - this.dotMin)) * cell.jitter * (0.9 + amp * 0.18);
      const alpha = 0.3 + amp * 0.58;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = shimmerColor;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
