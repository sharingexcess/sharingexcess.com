export const RIPPLE_COLORS = [
  "#00bc57", // bright-kelly
  "#ffd951", // banana-base
  "#fba62f", // tangerine-base
] as const;

const BASE_DOT_COLOR = "#69b57b"; // se-green-300 — brighter than se-green-base
const BASE_GRID_DOT_RADIUS = 0.62;
const BASE_GRID_ALPHA = 0.24;

/** Draw ripple overlay above this — low enough for density, high enough to spare the base grid */
const WAVE_DRAW_EPSILON = 0.01;

/** Sparse edge sparkles — one slot per grid cell × color so bands intermingle */
const EDGE_SPARKLE_SPARSE = 0.68;
const EDGE_SPARKLE_MIN_RADIUS = 0.3;
const EDGE_SPARKLE_MAX_RADIUS = 0.48;

type EdgeSparkle = {
  x: number;
  y: number;
  colorIndex: number;
  phase: number;
  twinkleSpeed: number;
  baseRadius: number;
  baseAlpha: number;
};

/** Per-ring peak scale — each band keeps its own color at full strength at the crest */
const RING_PEAK_MUL = [1, 0.86, 0.7] as const;

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
  /** (hash - 0.5) — radial fan when sampling the wave */
  distJitterUnit: number;
  /** (hash - 0.5) — tangential scatter to break up ring shape at the edges */
  tanJitterUnit: number;
};

type RippleOrigin = {
  x: number;
  y: number;
};

export type { RippleOrigin };

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
  dotMax: 1.93,
  baseAmp: 0.055,
  waveSpeed: 118,
  waveSigma: 29,
  wavePeak: 1.14,
  secondaryPeak: 0.44,
  secondarySigmaMul: 1.59,
  rippleLagSec: 0.08,
  fadeStartRadiusMul: 0.47,
  maxTravelMul: 0.54,
  fadeSharpness: 1,
  rippleInterval: 6600,
  rippleStagger: 800,
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
  const coreSigma = sigma * 0.43;
  const tailSigma = sigma * 2.3;
  const core = Math.exp(-(d * d) / (2 * coreSigma * coreSigma));
  const tail = Math.exp(-(d * d) / (2 * tailSigma * tailSigma));
  return (core * 0.83 + tail * 0.17) * peak;
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

/** Used for fan scatter sampling. */
function visualWaveAmp(waveAmp: number): number {
  const clamped = Math.min(1.12, Math.max(0, waveAmp));
  return smoothstep(0.02, 0.64, Math.pow(clamped, 0.48));
}

/**
 * Radial variation within each band — strong crest, but outer edge stays readable.
 */
function ringRadialProfile(waveAmp: number): {
  size: number;
  opacity: number;
  colorMix: number;
} {
  const a = Math.min(1.08, Math.max(0, waveAmp));
  const band = visualWaveAmp(a);
  const crest = smoothstep(0.38, 0.92, a);
  return {
    size: Math.pow(band, 1.06 + crest * 0.22),
    opacity: 0.24 * a + 0.76 * Math.pow(a, 1.58),
    colorMix: smoothstep(0.04, 0.28, a) * (0.82 + crest * 0.18),
  };
}

/** Gentle fade behind the ring front. */
function ringTrailFade(dist: number, ringR: number, sigma: number): number {
  const behind = ringR - dist;
  if (behind <= 0) return 1;
  return 1 - smoothstep(0, sigma * 4.05, behind) * 0.47;
}

/** Soft outward fade near viewport edges (centered origin). */
function radialViewportFade(x: number, y: number, width: number, height: number): number {
  const edge = Math.min(x, width - x, y * 0.85, (height - y) * 0.65);
  return smoothstep(18, 56, edge);
}

/** Mobile home hero — ripples fill the full viewport height. */
function radialViewportFadeMobileHero(
  x: number,
  y: number,
  width: number,
  height: number,
): number {
  const edge = Math.min(x, width - x, y, height - y);
  return smoothstep(8, 32, edge);
}

export type HalftoneRippleViewportProfile = "default" | "mobile-hero";

/** Stretch wave fronts vertically on portrait heroes so rings read taller than wide. */
const MOBILE_HERO_RIPPLE_RY_STRETCH = 1.48;

/** 0 while the band is expanding inward; ramps to 1 only near max travel. */
function ringLateTravelT(dist: number, maxR: number): number {
  if (maxR <= 0) return 0;
  return smoothstep(maxR * 0.64, maxR * 0.93, dist);
}

/** Single origin — centered on hero text; rings expand outward from the copy block. */
function resolveOrigins(
  width: number,
  height: number,
  mask: RippleContentMask | null,
  profile: HalftoneRippleViewportProfile = "default",
  originOverride?: RippleOrigin | null,
): RippleOrigin[] {
  if (originOverride) {
    return [originOverride];
  }

  if (mask) {
    const { cx, cy } = resolveContentMaskEllipse(mask, profile);
    return [{ x: cx, y: cy }];
  }

  if (profile === "mobile-hero") {
    return [{ x: width / 2, y: height / 2 }];
  }

  return [{ x: width / 2, y: height * 0.38 }];
}

export function resolveContentMaskEllipse(
  mask: RippleContentMask,
  profile: HalftoneRippleViewportProfile = "default",
): {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
} {
  const cx = (mask.left + mask.right) * 0.5;
  const cy = (mask.top + mask.bottom) * 0.5;
  const halfW = (mask.right - mask.left) * 0.5;
  const halfH = (mask.bottom - mask.top) * 0.5;

  if (profile === "mobile-hero") {
    return {
      cx,
      cy,
      rx: halfW + CONTENT_MASK_PAD_X * 0.36,
      ry: halfH + CONTENT_MASK_PAD_Y * 0.18 + halfH * CONTENT_MASK_RY_STRETCH * 0.14,
    };
  }

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
export function contentMaskRippleVisibility(
  x: number,
  y: number,
  mask: RippleContentMask | null,
  profile: HalftoneRippleViewportProfile = "default",
): number {
  if (!mask) return 1;

  const { cx, cy, rx, ry } = resolveContentMaskEllipse(mask, profile);
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
  const entranceBoost = 1 + 0.26 * Math.exp(-ageSec * 1.6);
  const popBoost = 1 + 0.38 * Math.exp(-ageSec * 5.5);
  const tailFade = Math.exp(-Math.max(0, ageSec - 1.55) * 0.58);
  const fadeStartR = width * fadeStartRadiusMul;
  const maxR = width * maxTravelMul;

  if (r1 <= fadeStartR) {
    return softenStart * entranceBoost * popBoost * tailFade;
  }

  const travelT = smoothstep(fadeStartR, maxR, r1);
  let travelFade = Math.pow(1 - travelT, fadeSharpness);
  // Near max reach, hold a sparse rim instead of fading the band out completely
  if (travelT > 0.72) {
    const edgeHold = (1 - smoothstep(0.72, 1, travelT)) * 0.26;
    travelFade = Math.max(travelFade, edgeHold);
  }
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
  const { size, opacity, colorMix } = ringRadialProfile(waveAmp);
  if (opacity < 0.008) return null;

  const crestBoost = 1 + 0.34 * smoothstep(0.4, 0.9, waveAmp);
  const sizeJitter = 0.73 + jitter * 0.54;
  const radius =
    (dotMin + size * (dotMax - dotMin)) *
    sizeJitter *
    (1 + 0.07 * smoothstep(0.4, 0.9, waveAmp));
  const brandMix = colorIndex !== null ? colorMix : 0;
  const color =
    brandMix > 0
      ? (RIPPLE_COLORS[colorIndex] ?? RIPPLE_COLORS[0])
      : BASE_DOT_COLOR;
  const alpha =
    (0.21 + opacity * 1.32 * (brandMix > 0 ? 0.76 + brandMix * 0.24 : 0.97)) *
    crestBoost *
    (colorIndex === 1 && brandMix > 0 ? 1.08 : 1);

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
  private readonly edgeSparkles: EdgeSparkle[] = [];
  private readonly edgeSparkleKeys = new Set<string>();

  private logicalWidth = 0;
  private logicalHeight = 0;
  private dpr = 1;
  private origins: RippleOrigin[] = [];
  private contentMask: RippleContentMask | null = null;
  private rippleOriginOverride: RippleOrigin | null = null;
  private viewportProfile: HalftoneRippleViewportProfile = "default";
  private maxActiveR = 0;
  private waveCullDistSq = 0;
  /** Edge sparkles persist until the next cycle's rings reach the perimeter again */
  private edgeSparklesAwaitRefresh = false;

  constructor(options: Partial<HalftoneRippleOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  setViewportProfile(profile: HalftoneRippleViewportProfile) {
    if (this.viewportProfile === profile) return;
    this.viewportProfile = profile;
    this.rebuildBaseCanvas();
    this.syncOrigins();
  }

  setRippleOrigin(origin: RippleOrigin | null) {
    if (
      origin?.x === this.rippleOriginOverride?.x &&
      origin?.y === this.rippleOriginOverride?.y
    ) {
      return;
    }
    this.rippleOriginOverride = origin;
    this.syncOrigins();
  }

  private syncOrigins() {
    this.origins = resolveOrigins(
      this.logicalWidth,
      this.logicalHeight,
      this.contentMask,
      this.viewportProfile,
      this.rippleOriginOverride,
    );
  }

  private viewportFade(x: number, y: number, width: number, height: number): number {
    if (this.viewportProfile === "mobile-hero") {
      return radialViewportFadeMobileHero(x, y, width, height);
    }
    return radialViewportFade(x, y, width, height);
  }

  private waveDistance(dx: number, dy: number): number {
    if (this.viewportProfile === "mobile-hero") {
      return Math.hypot(dx, dy / MOBILE_HERO_RIPPLE_RY_STRETCH);
    }
    return Math.hypot(dx, dy);
  }

  private resolveMaxRadius(width: number, height: number): number {
    const { maxTravelMul } = this.options;
    const originReach = Math.max(
      ...this.origins.map((origin) => maxReachFromOrigin(origin, width, height)),
      1,
    );

    if (this.viewportProfile === "mobile-hero") {
      return originReach * 1.06;
    }

    const reachCap = width * maxTravelMul;
    return Math.min(originReach * 1.15, reachCap);
  }

  private maskVisibility(x: number, y: number): number {
    return contentMaskRippleVisibility(
      x,
      y,
      this.contentMask,
      this.viewportProfile,
    );
  }

  setActive(active: boolean) {
    if (active && !this.active) {
      this.lastRippleTime = 0;
      this.waves.length = 0;
    }
    if (!active) {
      this.clearEdgeSparkles();
    }
    this.active = active;
  }

  setContentMask(mask: RippleContentMask | null) {
    this.contentMask = mask;
    this.rebuildBaseCanvas();
    this.syncOrigins();
  }

  /** Rebuild precomputed grid + cached base layer (call on resize). */
  rebuild(width: number, height: number, dpr: number) {
    this.logicalWidth = width;
    this.logicalHeight = height;
    this.dpr = dpr;
    this.syncOrigins();

    this.rebuildGrid();
    this.rebuildBaseCanvas();
    this.clearEdgeSparkles();
  }

  private clearEdgeSparkles() {
    this.edgeSparkles.length = 0;
    this.edgeSparkleKeys.clear();
  }

  private tryAddEdgeSparkle(
    x: number,
    y: number,
    colorIndex: number,
    col: number,
    row: number,
  ) {
    if (this.edgeSparklesAwaitRefresh) {
      this.clearEdgeSparkles();
      this.edgeSparklesAwaitRefresh = false;
    }

    if (dotHash(col, row) < EDGE_SPARKLE_SPARSE) return;

    const key = `${col},${row},${colorIndex}`;
    if (this.edgeSparkleKeys.has(key)) return;

    const hashR = dotHash(col + 3, row + 5);
    const hashA = dotHash(col + 13, row + 17);
    const hashP = dotHash(col + 23, row + 29);

    this.edgeSparkleKeys.add(key);
    this.edgeSparkles.push({
      x,
      y,
      colorIndex,
      phase: hashP * Math.PI * 2,
      twinkleSpeed: 1.6 + hashP * 2.8,
      baseRadius:
        EDGE_SPARKLE_MIN_RADIUS +
        hashR * (EDGE_SPARKLE_MAX_RADIUS - EDGE_SPARKLE_MIN_RADIUS),
      baseAlpha: 0.1 + hashA * 0.14,
    });
  }

  private drawEdgeSparkles(
    ctx: CanvasRenderingContext2D,
    nowMs: number,
  ) {
    if (this.edgeSparkles.length === 0) return;

    const t = nowMs / 1000;

    for (const sparkle of this.edgeSparkles) {
      const pulse = 0.5 + 0.5 * Math.sin(t * sparkle.twinkleSpeed + sparkle.phase);
      const twinkle = 0.38 + 0.62 * pulse;
      const radius = sparkle.baseRadius * (0.68 + 0.32 * pulse);
      const alpha = sparkle.baseAlpha * twinkle;
      const maskVis = this.maskVisibility(sparkle.x, sparkle.y);

      if (alpha * maskVis < 0.02) continue;

      ctx.globalAlpha = alpha * maskVis;
      ctx.fillStyle = RIPPLE_COLORS[sparkle.colorIndex] ?? RIPPLE_COLORS[0];
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
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
        const hashTan = dotHash(col + 19.17, row + 43.61);

        this.grid.push({
          x,
          y,
          jitter: 0.78 + hash * 0.44,
          distJitterUnit: hash - 0.5,
          tanJitterUnit: hashTan - 0.5,
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
      const maskVis = this.maskVisibility(cell.x, cell.y);
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
    this.edgeSparklesAwaitRefresh = this.edgeSparkles.length > 0;
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
      fadeStartRadiusMul,
      fadeSharpness,
    } = this.options;

    const maxR = this.resolveMaxRadius(width, height);
    const travelMul =
      this.viewportProfile === "mobile-hero"
        ? maxR / Math.max(width, 1)
        : this.options.maxTravelMul;
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
        travelMul,
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

    let peakAmp = 0;
    let sumAmp = 0;
    let bestPrimary = 0;
    let colorIndex: number | null = null;
    let colorStartTime = 0;

    for (const wave of this.prepared) {
      const ringPeak = wavePeak * (RING_PEAK_MUL[wave.colorIndex] ?? 0.45);
      const primary = gaussianRing(dist, wave.r1, waveSigma, ringPeak);
      const outer = gaussianOuterRing(
        dist,
        wave.r2,
        waveSigma,
        ringPeak * secondaryPeak,
      );
      const shoulderPeak = ringPeak * secondaryPeak * 0.58;
      const shoulder = gaussianShoulder(
        dist,
        wave.r2,
        waveSigma * secondarySigmaMul,
        shoulderPeak,
      );

      const shoulderWeight = 1 - smoothstep(0, ringPeak * 0.58, primary);
      const waveAmp =
        primary + outer * 0.6 + shoulder * shoulderWeight * 0.46;
      const trailFade = ringTrailFade(dist, wave.r1, waveSigma);
      const contrib = waveAmp * wave.fade * trailFade;

      peakAmp = Math.max(peakAmp, contrib);
      sumAmp += contrib;

      const primaryContrib = primary * wave.fade * trailFade;
      if (
        primaryContrib > bestPrimary ||
        (primaryContrib >= bestPrimary * 0.85 && wave.startTime > colorStartTime)
      ) {
        bestPrimary = primaryContrib;
        colorIndex = wave.colorIndex;
        colorStartTime = wave.startTime;
      }
    }

    const blended = peakAmp * 0.48 + sumAmp * 0.52;
    return { amp: Math.min(1.15, blended), colorIndex };
  }

  /** Static base grid only — use before ripples are active or when animation is paused. */
  drawStatic(ctx: CanvasRenderingContext2D, width: number, height: number, nowMs = 0) {
    ctx.clearRect(0, 0, width, height);
    if (this.baseCanvas) {
      ctx.drawImage(this.baseCanvas, 0, 0, width, height);
    }
    this.drawEdgeSparkles(ctx, nowMs || performance.now());
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    now: number,
  ) {
    ctx.clearRect(0, 0, width, height);

    if (this.baseCanvas) {
      ctx.drawImage(this.baseCanvas, 0, 0, width, height);
    }

    this.drawEdgeSparkles(ctx, now);

    if (!this.active || this.prepared.length === 0) {
      return;
    }

    const { dotMin, dotMax, baseAmp, waveSigma, gridSpacing } = this.options;
    const maxR = this.resolveMaxRadius(width, height);

    for (const cell of this.grid) {
      const maskVis = this.maskVisibility(cell.x, cell.y);
      if (maskVis < 0.008) continue;

      let waveAmp = 0;
      let colorIndex: number | null = null;

      for (const origin of this.origins) {
        const dx = cell.x - origin.x;
        const dy = cell.y - origin.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > this.waveCullDistSq) continue;

        const dist = this.waveDistance(dx, dy);
        const angle = Math.atan2(dy, dx);
        const travelT = ringLateTravelT(dist, maxR);
        const viewportT = (1 - this.viewportFade(cell.x, cell.y, width, height)) * travelT;

        const coreSample = this.sampleWaveAmp(dist, distSq);
        const fanStrength = 0.13 + visualWaveAmp(coreSample.amp) * 0.84;
        const baseRadial = cell.distJitterUnit * waveSigma * fanStrength;
        const extraRadial = baseRadial * (travelT * 2.35 + viewportT * 1.05);
        const tangSpread =
          cell.tanJitterUnit * waveSigma * fanStrength * 0.78 * travelT;

        const pdx = dx - Math.sin(angle) * tangSpread;
        const pdy = dy + Math.cos(angle) * tangSpread;
        const perturbedDist = Math.max(0, Math.hypot(pdx, pdy) + baseRadial + extraRadial);

        const sample = this.sampleWaveAmp(perturbedDist, distSq);
        const viewportFade = this.viewportFade(cell.x, cell.y, width, height);
        const atEdge = travelT > 0.66 || viewportFade < 0.82;
        const edgeSoft = atEdge ? 1 : 1 - travelT * 0.22;
        const effectiveViewportFade = atEdge ? 1 : viewportFade;
        const effectiveAmp = sample.amp * effectiveViewportFade * edgeSoft;
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

      const finalAlpha = style.alpha * maskVis;
      const col = Math.floor(cell.x / gridSpacing);
      const row = Math.floor(cell.y / gridSpacing);
      const viewportFade = this.viewportFade(cell.x, cell.y, width, height);
      const travelT = ringLateTravelT(
        this.waveDistance(
          cell.x - (this.origins[0]?.x ?? width / 2),
          cell.y - (this.origins[0]?.y ?? height / 2),
        ),
        maxR,
      );
      const atEdge = travelT > 0.66 || viewportFade < 0.82;

      if (atEdge && colorIndex !== null) {
        this.tryAddEdgeSparkle(cell.x, cell.y, colorIndex, col, row);
      }

      ctx.globalAlpha = finalAlpha;
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, style.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
