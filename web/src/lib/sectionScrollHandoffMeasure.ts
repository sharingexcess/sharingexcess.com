import { measureDepthFadeProgress } from "@/lib/sectionScrollFade";

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function resolveHandoffFadeProgress(
  scrollDepth: number,
  totalHeight: number,
  start: number | undefined,
  end: number | undefined,
  startVh: number | undefined,
  endVh: number | undefined,
  vhPx: number,
): number {
  const startRatio =
    startVh != null ? (startVh * vhPx) / totalHeight : (start ?? 0);
  const endRatio = endVh != null ? (endVh * vhPx) / totalHeight : (end ?? 1);
  return measureDepthFadeProgress(scrollDepth, totalHeight, startRatio, endRatio);
}

function measureFadePhaseComplete(
  handoff: HTMLElement,
  phase: "primary" | "secondary",
): boolean {
  const fadeFrom =
    phase === "primary" ? handoff.dataset.fadeFrom : handoff.dataset.secondFadeFrom;
  const fadeTo =
    phase === "primary" ? handoff.dataset.fadeTo : handoff.dataset.secondFadeTo;

  if (!fadeFrom || !fadeTo || fadeFrom === fadeTo) return true;

  const rect = handoff.getBoundingClientRect();
  const scrollDepth = Math.max(0, -rect.top);
  const vhPx = window.innerHeight / 100;
  const progress = resolveHandoffFadeProgress(
    scrollDepth,
    rect.height,
    parseOptionalNumber(
      phase === "primary" ? handoff.dataset.fadeStart : handoff.dataset.secondFadeStart,
    ),
    parseOptionalNumber(
      phase === "primary" ? handoff.dataset.fadeEnd : handoff.dataset.secondFadeEnd,
    ),
    parseOptionalNumber(
      phase === "primary" ? handoff.dataset.fadeStartVh : handoff.dataset.secondFadeStartVh,
    ),
    parseOptionalNumber(
      phase === "primary" ? handoff.dataset.fadeEndVh : handoff.dataset.secondFadeEndVh,
    ),
    vhPx,
  );

  return progress >= 1;
}

/** True when every enabled scroll-handoff overlay on the wrapper has reached 100% opacity. */
export function measureHandoffBackgroundFadeComplete(handoff: HTMLElement): boolean {
  if (!measureFadePhaseComplete(handoff, "primary")) return false;
  if (handoff.dataset.hasSecondFade === "true") {
    return measureFadePhaseComplete(handoff, "secondary");
  }
  return true;
}

export const SECTION_SCROLL_HANDOFF_SELECTOR = "[data-section-scroll-handoff]";
