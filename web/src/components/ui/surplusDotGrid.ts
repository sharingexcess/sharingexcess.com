const GRID_SPACING = 20;
const DOT_RADIUS = 1.5;
const DOT_ALPHA = 0.1;
const DOT_COLOR = "#003619";
const MIN_ANIMATED_SCALE = 0.94;
const MAX_BRIGHT_ALPHA_MUL = 1.35;
const MIN_DIM_ALPHA_MUL = 0.28;
const SPEED_MIN = 1.1;
const SPEED_MAX = 4.8;

type SurplusDot = {
  x: number;
  y: number;
  phase: number;
  alphaPhase: number;
  speed: number;
  linger: number;
};

function dotHash(col: number, row: number): number {
  const s = Math.sin(col * 12.9898 + row * 78.233) * 43_758.5453;
  return s - Math.floor(s);
}

function buildGrid(width: number, height: number): SurplusDot[] {
  const dots: SurplusDot[] = [];
  const cols = Math.ceil(width / GRID_SPACING) + 1;
  const rows = Math.ceil(height / GRID_SPACING) + 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const hashP = dotHash(col + 11, row + 17);
      const hashS = dotHash(col + 29, row + 5);
      const hashL = dotHash(col + 3, row + 41);
      const hashA = dotHash(col + 53, row + 7);
      const speedT = Math.pow(hashS, 2.1);

      dots.push({
        x: col * GRID_SPACING,
        y: row * GRID_SPACING,
        phase: hashP * Math.PI * 2,
        alphaPhase: hashA * Math.PI * 2,
        speed: SPEED_MIN + speedT * (SPEED_MAX - SPEED_MIN),
        linger: 0.42 + hashL * 0.48,
      });
    }
  }

  return dots;
}

function applyLinger(wave: number, linger: number): number {
  const hold = Math.min(linger * 0.55, 0.42);
  if (wave <= hold) return 0;
  if (wave >= 1 - hold) return 1;
  return (wave - hold) / (1 - 2 * hold);
}

function shimmerWave(tSec: number, dot: SurplusDot, phaseOffset = 0, speedMul = 1): number {
  const wave = 0.5 + 0.5 * Math.sin(tSec * dot.speed * speedMul + dot.phase + phaseOffset);
  return applyLinger(wave, dot.linger);
}

/** Layered waves for opacity twinkle — size stays nearly fixed to avoid grid gaps */
function twinkleAlpha(tSec: number, dot: SurplusDot): number {
  const primary = shimmerWave(tSec, dot, dot.alphaPhase, 1);
  const harmonic =
    0.5 +
    0.5 * Math.sin(tSec * dot.speed * 2.15 + dot.phase * 1.4 + dot.alphaPhase + 0.9);
  const slow =
    0.5 + 0.5 * Math.sin(tSec * dot.speed * 0.72 + dot.phase * 0.55 + dot.alphaPhase * 0.3);
  return Math.min(1, Math.max(0, primary * 0.42 + harmonic * 0.38 + slow * 0.2));
}

function animatedScale(tSec: number, dot: SurplusDot): number {
  const twinkle = twinkleAlpha(tSec, dot);
  return MIN_ANIMATED_SCALE + (1 - MIN_ANIMATED_SCALE) * twinkle;
}

function animatedAlpha(tSec: number, dot: SurplusDot): number {
  const twinkle = twinkleAlpha(tSec, dot);
  const dim = MIN_DIM_ALPHA_MUL;
  const bright = MAX_BRIGHT_ALPHA_MUL;
  const alphaMul = dim + (bright - dim) * twinkle;
  return DOT_ALPHA * alphaMul;
}

export class SurplusDotGridEngine {
  private dots: SurplusDot[] = [];

  rebuild(width: number, height: number) {
    this.dots = buildGrid(width, height);
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, nowMs: number) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = DOT_COLOR;

    const tSec = nowMs / 1000;

    for (const dot of this.dots) {
      const radius = DOT_RADIUS * animatedScale(tSec, dot);

      ctx.globalAlpha = animatedAlpha(tSec, dot);
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
