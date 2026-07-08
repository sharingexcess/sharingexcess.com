/** Round-image section marker — used for scroll lock + reveal. */
export const ROUND_IMAGE_SECTION_ATTR = "data-round-image-section";

export const ROUND_IMAGE_SECTION_SELECTOR = `[${ROUND_IMAGE_SECTION_ATTR}]`;

export const SECTION_ALIGNED_THRESHOLD = 8;

/** Shared viewport frame height for round-image desktop layout. */
export const ROUND_FRAME_HEIGHT = "calc(100dvh - var(--site-header-height))";

export function getSiteHeaderHeight(): number {
  const scrollPadding = parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  if (!Number.isNaN(scrollPadding) && scrollPadding > 0) return scrollPadding;

  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--site-header-height"),
    ) || 0
  );
}

export function getSectionAlignmentDistance(section: HTMLElement): number {
  return Math.abs(section.getBoundingClientRect().top - getSiteHeaderHeight());
}

export function isSectionAligned(section: HTMLElement): boolean {
  return getSectionAlignmentDistance(section) <= SECTION_ALIGNED_THRESHOLD;
}

export function isSectionOnScreen(section: HTMLElement): boolean {
  const { top, bottom } = section.getBoundingClientRect();
  return bottom > 0 && top < window.innerHeight;
}

/** Most of the section sits in the viewport below the header. */
export function isSectionContained(
  section: HTMLElement,
  visibleRatio = 0.55,
): boolean {
  const rect = section.getBoundingClientRect();
  const header = getSiteHeaderHeight();
  const visibleTop = Math.max(rect.top, header);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  const visibleHeight = visibleBottom - visibleTop;

  if (visibleHeight <= 0 || rect.height <= 0) return false;

  return visibleHeight / rect.height >= visibleRatio;
}

export function getMainSections(): HTMLElement[] {
  const main = document.querySelector("main");
  if (!main) return [];

  return Array.from(main.querySelectorAll("section")).filter(
    (section) => section.offsetHeight > 0,
  );
}

export function isRoundImageSection(section: HTMLElement): boolean {
  return section.hasAttribute(ROUND_IMAGE_SECTION_ATTR);
}

/** Viewport-tall round section shell. */
export const ROUND_SECTION_MIN_HEIGHT = "lg:min-h-[var(--round-section-frame-height)]";

/** Figma 1215:2580 — horizontal bleed as fraction of circle width. */
export const ROUND_CIRCLE_BLEED_SHIFT = "58.6%";
