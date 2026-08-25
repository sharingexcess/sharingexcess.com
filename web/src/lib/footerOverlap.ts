/**
 * Footer pulls up only onto the rounded corner strip of the last section's color
 * bridge. `--section-footer-gap` (global.css) extends section color below
 * content; that gap stays fully visible above the footer.
 */
export const FOOTER_BRIDGE_OVERLAP_CLASS =
  "-mt-[var(--radius-xl)] lg:-mt-[var(--radius-2xl)]";

/** Applied to the last page section via SiteFooter — see global.css */
export const PAGE_LAST_SECTION_CLASS = "page-last-section";

/** Selectors for the last block before the footer (used when marking the bridge). */
export const PAGE_LAST_SECTION_SELECTOR =
  "[data-section], [data-section-scroll-handoff], main > article";
