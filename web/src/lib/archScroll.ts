/** How far (px) the arch peak rises above the section boundary at the center. */
import { useEffect, useState } from "react";

export const ARCH_RISE = 180;

const ARCH_HOLD_PX_MIN = 280;
const ARCH_HOLD_VH = 0.36;
const ARCH_FLATTEN_PX_MIN = 440;
const ARCH_FLATTEN_VH = 0.62;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function smoothstepRange(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return smoothstep(t);
}

function isArchDesktop(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

/** Match arch scroll/padding behavior to desktop breakpoints. */
export function useArchDesktop() {
  const [desktop, setDesktop] = useState(isArchDesktop);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return desktop;
}

function getArchHoldPx(vh: number): number {
  return isArchDesktop()
    ? Math.max(ARCH_HOLD_PX_MIN, Math.round(vh * ARCH_HOLD_VH))
    : Math.round(vh * 0.35);
}

function getArchFlattenPx(vh: number): number {
  return isArchDesktop()
    ? Math.max(ARCH_FLATTEN_PX_MIN, Math.round(vh * ARCH_FLATTEN_VH))
    : ARCH_RISE;
}

/** Arch rise in px — ARCH_RISE at peak, 0 when fully flat. */
export function computeArchRise(sectionTop: number, vh = window.innerHeight || 800): number {
  const scrolledPast = vh + ARCH_RISE - sectionTop;
  const holdPx = getArchHoldPx(vh);
  const flattenPx = getArchFlattenPx(vh);
  const t = Math.max(0, Math.min(1, (scrolledPast - holdPx) / flattenPx));
  return ARCH_RISE * (1 - smoothstep(t));
}

/** 0 while the arch is peaked, 1 once it has flattened. */
export function computeArchFlattenProgress(
  sectionTop: number,
  vh = window.innerHeight || 800,
): number {
  return 1 - computeArchRise(sectionTop, vh) / ARCH_RISE;
}

/** How much of the viewport the section currently occupies (0–1). */
export function computeSectionViewportFill(rect: DOMRect, vh: number): number {
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  if (visible <= 0 || vh <= 0) return 0;
  return visible / vh;
}

/**
 * Reveal for section edge shimmer — lightweight scroll signal only.
 * Fades in once the section fills the viewport and (on desktop) the arch is flat.
 */
export function computeEdgeShimmerReveal(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight || 800;

  if (rect.bottom < 48 || rect.top > vh) return 0;

  const viewportFill = computeSectionViewportFill(rect, vh);
  const inSection = smoothstepRange(0.56, 0.8, viewportFill);

  if (section.hasAttribute("data-arch-top") && isArchDesktop()) {
    const archFlat = computeArchFlattenProgress(rect.top, vh);
    return inSection * smoothstepRange(0.92, 1, archFlat);
  }

  return smoothstepRange(0.45, 0.72, viewportFill);
}
