const GRID_SPACING = 20;
const DOT_RADIUS = 1.5;
const DOT_ALPHA = 0.1;
const DOT_COLOR = "#003619";
const MIN_ANIMATED_SCALE = 0.82;
const SPEED_MIN = 1.6;
const SPEED_MAX = 5.8;

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

      dots.push({
        x: col * GRID_SPACING,
        y: row * GRID_SPACING,
        phase: hashP * Math.PI * 2,
        alphaPhase: hashA * Math.PI * 2,
        speed: SPEED_MIN + hashS * (SPEED_MAX - SPEED_MIN),
        linger: 0.55 + hashL * 0.45,
      });
    }
  }

  return dots;
}

/** Hold longer near bright/dim extremes — higher linger = slower-feeling twinkle */
function applyLinger(wave: number, linger: number): number {
  const hold = Math.min(linger * 0.68, 0.58);
  if (wave <= hold) return 0;
  if (wave >= 1 - hold) return 1;
  return (wave - hold) / (1 - 2 * hold);
}

function biasBright(shimmer: number): number {
  return Math.pow(shimmer, 0.48);
}

function shimmerWave(tSec: number, dot: SurplusDot, phaseOffset = 0, speedMul = 1): number {
  const wave = 0.5 + 0.5 * Math.sin(tSec * dot.speed * speedMul + dot.phase + phaseOffset);
  return applyLinger(wave, dot.linger);
}

function animatedScale(tSec: number, dot: SurplusDot): number {
  const shimmer = biasBright(shimmerWave(tSec, dot));
  return MIN_ANIMATED_SCALE + (1 - MIN_ANIMATED_SCALE) * shimmer;
}

function animatedAlpha(tSec: number, dot: SurplusDot): number {
  const shimmer = biasBright(shimmerWave(tSec, dot, dot.alphaPhase, 1.12));
  return DOT_ALPHA * (0.84 + 0.16 * shimmer);
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
