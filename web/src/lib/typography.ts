/** Malila bold label above section headings — Foundations/Typography "Eyebrow" */
export const eyebrowClassName =
  "font-display text-lg font-bold leading-[1.1] lg:text-[24px]";

/** Secondary captions — map footnotes, carousel labels, etc. */
export const captionClassName =
  "text-xs leading-[1.4] italic opacity-64 lg:text-sm";

/** Large stat figures — Foundations/Typography "Metric Number" */
export const metricNumberClassName =
  "font-display text-[40px] font-bold leading-[1.06] tabular-nums lg:text-[clamp(4rem,22vw,8rem)]";

/** Section H1 — primary heading within page sections (TextSection, carousel active item) */
export const sectionH1ClassName =
  "text-[clamp(40px,9vw,96px)] font-medium leading-[1.06] tracking-[-0.04em] lg:text-[clamp(48px,6.35cqw,96px)]";

/** Section H2 — secondary heading within sections (carousel inactive item) */
export const sectionH2ClassName =
  "text-[clamp(32px,7.5vw,72px)] font-medium leading-[1.06] tracking-[-0.04em] lg:text-[clamp(36px,4.76cqw,72px)]";

/** Home hero overlay card — scales with card width so the heading fills mobile */
export const heroContentCardHeadingClassName =
  "text-[clamp(34px,12cqw,48px)] font-medium leading-[1.06] tracking-[-0.04em] lg:text-[clamp(36px,4.76cqw,72px)]";

/** Section H3 — tertiary heading within sections */
export const sectionH3ClassName =
  "text-[clamp(22px,4.5vw,40px)] font-medium leading-[1.06] tracking-[-0.04em] lg:text-[clamp(24px,2.65cqw,40px)]";

/** Subheading below a metric number — one step below Section H2 */
export const sectionMetricSubheadingClassName =
  "text-[clamp(24px,5vw,48px)] font-medium leading-[1.2] tracking-[-0.04em] lg:text-[clamp(28px,3.2cqw,48px)]";

/** Section body copy — matches TextSection `bodySize` tokens */
export const bodyXlClassName = "text-base leading-[1.6] lg:text-[20px]";
export const bodyLgClassName = "text-base leading-[1.4] lg:text-[18px]";
export const bodyMdClassName = "text-sm leading-[1.4] lg:text-base";

/** Inline *asterisk* emphasis in headings — color only; weight comes from the heading */
export const headingEmphasisClassName = "not-italic text-[var(--section-emphasis)]";

/** Inline *asterisk* emphasis in body paragraphs — bold + color; inherits size/tracking from parent */
export const paragraphEmphasisClassName =
  "not-italic font-bold text-[var(--section-emphasis)]";

/** Stat card text variant — scales with card width; wraps at container edge */
export const statCardTextHeaderClassName =
  "font-display text-[clamp(24px,10.8cqw,48px)] font-bold leading-[1.06] tracking-[-0.04em]";
