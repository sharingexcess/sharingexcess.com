export const RIPPLE_COLORS = [
  "#00bc57", // bright-kelly
  "#ffd951", // banana-base
  "#fba62f", // tangerine-base
] as const;

const BASE_DOT_COLOR = "#69b57b"; // se-green-300 — brighter than se-green-base
const BASE_GRID_DOT_RADIUS = 0.62;
const BASE_GRID_ALPHA = 0.24;

/** Draw ripple overlay above this — low enough for density, high enough to spare the base grid */
const WAVE_DRAW_EPSILON = 0.012;

export type HalftoneRippleWave = {
  startTime: number;
  colorIndex: number;
};

export type PreparedWave = {
  colorIndex: number;
  fade: number;
  r1: number;
  r2: number;
  startTime: number;
};

export type HalftoneRippleOptions = {
  gridSpacing: number;
  dotMin: number;
  dotMax: number;
  baseAmp: number;
  waveSpeed: number;
  waveSigma: number;
  wavePeak: number;
  secondaryPeak: number;
  secondarySigmaMul: number;
  rippleLagSec: number;
  /** Ring radius (× viewport width) where fade-out begins */
  fadeStartRadiusMul: number;
  /** Max ring radius (× viewport width) before the wave is removed */
  maxTravelMul: number;
  /** How sharply the wave fades once past fadeStartRadiusMul */
  fadeSharpness: number;
  rippleInterval: number;
  rippleStagger: number;
  ringsPerRipple: number;
};

type GridCell = {
  x: number;
  y: number;
  jitter: number;
  /** (hash - 0.5) — scaled by waveSigma × fan spread when sampling */
  distJitterUnit: number;
};

type RippleOrigin = {
  x: number;
  y: number;
};

export type RippleContentMask = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const CONTENT_MASK_PAD_X = 112;
const CONTENT_MASK_PAD_Y = 148;
/** Extra vertical stretch so the clear oval reads taller than wide */
const CONTENT_MASK_RY_STRETCH = 0.42;
/** Normalized ellipse radius where masking begins to lift (0 = center) */
const CONTENT_MASK_FADE_INNER = 0.1;
/** Normalized ellipse radius where ripples reach full visibility */
const CONTENT_MASK_FADE_OUTER = 1.42;

const DEFAULT_OPTIONS: HalftoneRippleOptions = {
  gridSpacing: 9,
  dotMin: 0.38,
  dotMax: 1.55,
  baseAmp: 0.1,
  waveSpeed: 168,
  waveSigma: 26,
  wavePeak: 0.92,
  secondaryPeak: 0.36,
  secondarySigmaMul: 1.52,
  rippleLagSec: 0.11,
  fadeStartRadiusMul: 0.48,
  maxTravelMul: 0.56,
  fadeSharpness: 1.1,
  rippleInterval: 7200,
  rippleStagger: 1480,
  ringsPerRipple: 3,
};

/** Stable per-dot jitter — GLSL-style hash (Antimetal reference). */
function dotHash(col: number, row: number): number {
  const s = Math.sin(col * 12.9898 + row * 78.233) * 43_758.5453;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Fast burst at spawn, then decelerates — firework-style expansion */
function waveRadiusFromAge(ageSec: number, maxR: number, waveSpeed: number): number {
  const linearDuration = maxR / Math.max(waveSpeed, 1);
  const t = Math.min(1, Math.max(0, ageSec / linearDuration));
  const eased = 1 - Math.pow(1 - t, 3.4);
  return eased * maxR;
}

/** Tight core for a condensed leading edge + soft tail for fan-out. */
function gaussianRing(
  dist: number,
  ringR: number,
  sigma: number,
  peak: number,
): number {
  if (peak <= 0 || sigma < 1e-6) return 0;
  const d = Math.abs(dist - ringR);
  const coreSigma = sigma * 0.5;
  const tailSigma = sigma * 2.5;
  const core = Math.exp(-(d * d) / (2 * coreSigma * coreSigma));
  const tail = Math.exp(-(d * d) / (2 * tailSigma * tailSigma));
  return (core * 0.84 + tail * 0.16) * peak;
}

/** Subtle outer ring — soft wide band lagging behind the primary */
function gaussianOuterRing(
  dist: number,
  ringR: number,
  sigma: number,
  peak: number,
): number {
  if (peak <= 0 || sigma < 1e-6) return 0;
  const d = Math.abs(dist - ringR);
  const outerSigma = sigma * 1.65;
  return Math.exp(-(d * d) / (2 * outerSigma * outerSigma)) * peak;
}

/** Soft diffuse shoulder — no tight core, for seamless trailing falloff. */
function gaussianShoulder(
  dist: number,
  ringR: number,
  sigma: number,
  peak: number,
): number {
  if (peak <= 0 || sigma < 1e-6) return 0;
  const d = dist - ringR;
  return Math.exp(-(d * d) / (2 * sigma * sigma)) * peak;
}

/** Map raw wave amplitude to visual size/opacity. */
function visualWaveAmp(waveAmp: number): number {
  const clamped = Math.min(1, Math.max(0, waveAmp));
  return smoothstep(0.02, 0.86, Math.pow(clamped, 0.54));
}

/** Soft outward fade near viewport edges (centered origin). */
function radialViewportFade(x: number, y: number, width: number, height: number): number {
  const edge = Math.min(x, width - x, y * 0.85, (height - y) * 0.65);
  return smoothstep(18, 56, edge);
}

/** Single origin — centered on hero text; rings expand outward from the copy block. */
function resolveOrigins(
  width: number,
  height: number,
  mask: RippleContentMask | null,
): RippleOrigin[] {
  if (mask) {
    const { cx, cy } = resolveContentMaskEllipse(mask);
    return [{ x: cx, y: cy }];
  }

  return [{ x: width / 2, y: height * 0.38 }];
}

function resolveContentMaskEllipse(mask: RippleContentMask): {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
} {
  const cx = (mask.left + mask.right) * 0.5;
  const cy = (mask.top + mask.bottom) * 0.5;
  const halfW = (mask.right - mask.left) * 0.5;
  const halfH = (mask.bottom - mask.top) * 0.5;

  return {
    cx,
    cy,
    rx: halfW + CONTENT_MASK_PAD_X,
    ry: halfH + CONTENT_MASK_PAD_Y + halfH * CONTENT_MASK_RY_STRETCH,
  };
}

/**
 * Soft oval mask — 0 at center (ripples hidden), 1 outside the fade (full ripples).
 * Uses normalized ellipse distance for a smooth radial gradient at the edges.
 */
function contentMaskRippleVisibility(
  x: number,
  y: number,
  mask: RippleContentMask | null,
): number {
  if (!mask) return 1;

  const { cx, cy, rx, ry } = resolveContentMaskEllipse(mask);
  if (rx <= 0 || ry <= 0) return 1;

  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  const t = Math.hypot(nx, ny);
  const fade = smoothstep(CONTENT_MASK_FADE_INNER, CONTENT_MASK_FADE_OUTER, t);
  // Smootherstep — gentler ramp through the fade band
  return fade * fade * (3 - 2 * fade);
}

function maxReachFromOrigin(origin: RippleOrigin, width: number, height: number): number {
  return Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(origin.x - width, origin.y),
    Math.hypot(origin.x, origin.y - height),
    Math.hypot(origin.x - width, origin.y - height),
  );
}

/** Fade by how far the ring has traveled — not spawn age — so off-screen origins stay visible. */
function computeWaveFade(
  ageSec: number,
  r1: number,
  width: number,
  fadeStartRadiusMul: number,
  maxTravelMul: number,
  fadeSharpness: number,
): number {
  const softenStart = 0.64 + 0.36 * smoothstep(0, 0.2, ageSec);
  const entranceBoost = 1 + 0.22 * Math.exp(-ageSec * 1.6);
  const popBoost = 1 + 0.3 * Math.exp(-ageSec * 5.5);
  const tailFade = Math.exp(-Math.max(0, ageSec - 1.35) * 0.55);
  const fadeStartR = width * fadeStartRadiusMul;
  const maxR = width * maxTravelMul;

  if (r1 <= fadeStartR) {
    return softenStart * entranceBoost * popBoost * tailFade;
  }

  const travelT = smoothstep(fadeStartR, maxR, r1);
  const travelFade = Math.pow(1 - travelT, fadeSharpness);
  return softenStart * entranceBoost * popBoost * tailFade * travelFade;
}

function resolveDotStyle(
  waveAmp: number,
  colorIndex: number | null,
  dotMin: number,
  dotMax: number,
  baseAmp: number,
  jitter: number,
): { radius: number; color: string; alpha: number } | null {
  const visualAmp = visualWaveAmp(waveAmp);
  const amp = Math.min(1, baseAmp + visualAmp);
  if (amp < 0.018) return null;

  const radius = (dotMin + visualAmp * (dotMax - dotMin)) * jitter;
  const brandMix =
    colorIndex !== null ? smoothstep(0.04, 0.38, waveAmp) : 0;
  const color =
    brandMix > 0
      ? (RIPPLE_COLORS[colorIndex] ?? RIPPLE_COLORS[0])
      : BASE_DOT_COLOR;
  const alpha =
    (0.17 + visualAmp * 0.96 * (brandMix > 0 ? 0.76 + brandMix * 0.24 : 1)) *
    (colorIndex === 1 && brandMix > 0 ? 1.12 : 1);

  return { radius, color, alpha };
}

export class HalftoneRippleEngine {
  private waves: HalftoneRippleWave[] = [];
  private lastRippleTime = 0;
  private active = false;
  private readonly options: HalftoneRippleOptions;
  private readonly prepared: PreparedWave[] = [];
  private readonly grid: GridCell[] = [];

  private baseCanvas: HTMLCanvasElement | null = null;
  private baseCtx: CanvasRenderingContext2D | null = null;

  private logicalWidth = 0;
  private logicalHeight = 0;
  private dpr = 1;
  private origins: RippleOrigin[] = [];
  private contentMask: RippleContentMask | null = null;
  private maxActiveR = 0;
  private waveCullDistSq = 0;

  constructor(options: Partial<HalftoneRippleOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  setActive(active: boolean) {
    if (active && !this.active) {
      this.lastRippleTime = 0;
      this.waves.length = 0;
    }
    this.active = active;
  }

  setContentMask(mask: RippleContentMask | null) {
    this.contentMask = mask;
    this.origins = resolveOrigins(this.logicalWidth, this.logicalHeight, mask);
    this.rebuildBaseCanvas();
  }

  /** Rebuild precomputed grid + cached base layer (call on resize). */
  rebuild(width: number, height: number, dpr: number) {
    this.logicalWidth = width;
    this.logicalHeight = height;
    this.dpr = dpr;
    this.origins = resolveOrigins(width, height, this.contentMask);

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

        this.grid.push({
          x,
          y,
          jitter: 0.78 + hash * 0.44,
          distJitterUnit: hash - 0.5,
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
      if (BASE_GRID_ALPHA < 0.018) continue;

      ctx.globalAlpha = BASE_GRID_ALPHA * maskVis;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  spawnRipple(now: number) {
    for (let i = 0; i < this.options.ringsPerRipple; i++) {
      this.waves.push({
        startTime: now + i * this.options.rippleStagger,
        colorIndex: i,
      });
    }
    this.lastRippleTime = now;
  }

  private prepareWaves(now: number, width: number, height: number) {
    const {
      waveSpeed,
      rippleLagSec,
      rippleStagger,
      waveSigma,
      maxTravelMul,
      fadeStartRadiusMul,
      fadeSharpness,
    } = this.options;

    const reachCap = width * maxTravelMul;
    const maxR =
      Math.min(
        Math.max(
          ...this.origins.map((origin) => maxReachFromOrigin(origin, width, height)),
          1,
        ) * 1.15,
        reachCap,
      );
    const maxAgeMs =
      (maxR / waveSpeed) * 1000 * 1.15 +
      rippleStagger * this.options.ringsPerRipple +
      200;

    this.waves = this.waves.filter((wave) => now - wave.startTime < maxAgeMs);

    this.prepared.length = 0;
    this.maxActiveR = 0;

    for (const wave of this.waves) {
      const ageSec = (now - wave.startTime) / 1000;
      if (ageSec < 0) continue;

      const r1 = waveRadiusFromAge(ageSec, maxR, waveSpeed);
      const r2 = waveRadiusFromAge(Math.max(0, ageSec - rippleLagSec), maxR, waveSpeed);

      const fade = computeWaveFade(
        ageSec,
        r1,
        width,
        fadeStartRadiusMul,
        maxTravelMul,
        fadeSharpness,
      );
      if (fade < 0.005) continue;

      this.maxActiveR = Math.max(this.maxActiveR, r1, r2);

      this.prepared.push({
        colorIndex: wave.colorIndex,
        fade,
        r1,
        r2,
        startTime: wave.startTime,
      });
    }

    const cullMargin = this.maxActiveR + waveSigma * 8;
    this.waveCullDistSq = cullMargin * cullMargin;
  }

  tick(now: number, width: number, height: number) {
    if (!this.active) {
      this.prepared.length = 0;
      this.maxActiveR = 0;
      this.waveCullDistSq = 0;
      return;
    }

    if (this.lastRippleTime === 0) {
      this.spawnRipple(now);
    }

    if (now - this.lastRippleTime >= this.options.rippleInterval) {
      this.spawnRipple(now);
    }

    this.prepareWaves(now, width, height);
  }

  private sampleWaveAmp(
    dist: number,
    distSq: number,
  ): { amp: number; colorIndex: number | null } {
    const { waveSigma, wavePeak, secondaryPeak, secondarySigmaMul } = this.options;

    if (this.prepared.length === 0 || distSq > this.waveCullDistSq) {
      return { amp: 0, colorIndex: null };
    }

    let sum = 0;
    let bestPrimary = 0;
    let colorIndex: number | null = null;
    let colorStartTime = 0;

    for (const wave of this.prepared) {
      const primary = gaussianRing(dist, wave.r1, waveSigma, wavePeak);
      const outer = gaussianOuterRing(
        dist,
        wave.r2,
        waveSigma,
        wavePeak * secondaryPeak,
      );
      const shoulderPeak = wavePeak * secondaryPeak * 0.55;
      const shoulder = gaussianShoulder(
        dist,
        wave.r2,
        waveSigma * secondarySigmaMul,
        shoulderPeak,
      );

      const shoulderWeight = 1 - smoothstep(0, wavePeak * 0.68, primary);
      const waveAmp = primary + outer + shoulder * shoulderWeight * 0.45;
      const contrib = waveAmp * wave.fade;
      sum += contrib;

      const primaryContrib = primary * wave.fade;
      if (
        primaryContrib > bestPrimary ||
        (primaryContrib >= bestPrimary * 0.85 && wave.startTime > colorStartTime)
      ) {
        bestPrimary = primaryContrib;
        colorIndex = wave.colorIndex;
        colorStartTime = wave.startTime;
      }
    }

    return { amp: Math.min(1, sum), colorIndex };
  }

  /** Static base grid only — use before ripples are active or when animation is paused. */
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
    _now: number,
  ) {
    ctx.clearRect(0, 0, width, height);

    if (this.baseCanvas) {
      ctx.drawImage(this.baseCanvas, 0, 0, width, height);
    }

    if (!this.active || this.prepared.length === 0) {
      return;
    }

    const { dotMin, dotMax, baseAmp, waveSigma } = this.options;

    for (const cell of this.grid) {
      const maskVis = contentMaskRippleVisibility(cell.x, cell.y, this.contentMask);
      if (maskVis < 0.008) continue;

      let waveAmp = 0;
      let colorIndex: number | null = null;

      for (const origin of this.origins) {
        const dx = cell.x - origin.x;
        const dy = cell.y - origin.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > this.waveCullDistSq) continue;

        const dist = Math.hypot(dx, dy);

        // Tight sample first (condensed core), then fan scatter grows with amplitude
        const coreSample = this.sampleWaveAmp(dist, distSq);
        const fanSpread =
          cell.distJitterUnit * waveSigma * (0.18 + visualWaveAmp(coreSample.amp) * 1.05);
        const distSample = Math.max(0, dist + fanSpread);

        const sample = this.sampleWaveAmp(distSample, distSq);
        const effectiveAmp =
          sample.amp * radialViewportFade(cell.x, cell.y, width, height);
        if (effectiveAmp > waveAmp) {
          waveAmp = effectiveAmp;
          colorIndex = sample.colorIndex;
        }
      }

      if (waveAmp < WAVE_DRAW_EPSILON) continue;

      const style = resolveDotStyle(
        waveAmp,
        colorIndex,
        dotMin,
        dotMax,
        baseAmp,
        cell.jitter,
      );
      if (!style) continue;

      ctx.globalAlpha = style.alpha * maskVis;
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, style.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
