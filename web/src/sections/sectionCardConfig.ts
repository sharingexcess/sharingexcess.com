import type { SectionCardColor, SectionTheme } from "@/lib/types";

/** Card fill options when the section theme is light. */
export const SECTION_CARD_COLORS_LIGHT = [
  "surface",
  "brand-green",
  "kale",
  "tangerine",
  "banana",
] as const satisfies readonly SectionCardColor[];

/** Card fill options when the section theme is dark. */
export const SECTION_CARD_COLORS_DARK = [
  "surface",
  "brand-green",
] as const satisfies readonly SectionCardColor[];

export const SECTION_CARD_COLOR_LABELS: Record<SectionCardColor, string> = {
  surface: "Surface",
  "brand-green": "Brand green",
  kale: "Kale",
  tangerine: "Tangerine",
  banana: "Banana",
};

export function getSectionCardColorsForTheme(theme: SectionTheme): SectionCardColor[] {
  if (theme === "dark") {
    return [...SECTION_CARD_COLORS_DARK];
  }
  return [...SECTION_CARD_COLORS_LIGHT];
}

export function coerceSectionCardColor(
  theme: SectionTheme,
  cardColor: SectionCardColor,
): SectionCardColor {
  const allowed = getSectionCardColorsForTheme(theme);
  if (allowed.includes(cardColor)) {
    return cardColor;
  }
  return "surface";
}

export function getSectionCardInteriorTheme(
  cardColor: SectionCardColor,
  sectionTheme: SectionTheme,
): SectionTheme {
  if (cardColor === "surface") {
    return sectionTheme;
  }
  if (cardColor === "brand-green" || cardColor === "kale") {
    return "dark";
  }
  return "light";
}

export function sectionCardContentIsDark(
  isCard: boolean,
  cardColor: SectionCardColor,
  theme: SectionTheme,
): boolean {
  if (!isCard) {
    return theme === "dark";
  }
  return getSectionCardInteriorTheme(cardColor, theme) === "dark";
}

export function isWarmSectionCardColor(
  cardColor: SectionCardColor,
): cardColor is "banana" | "tangerine" {
  return cardColor === "banana" || cardColor === "tangerine";
}

/** Sets accessible text tokens via global.css [data-card-color] rules. */
export function getSectionCardDataAttributes(
  cardColor: SectionCardColor,
): { "data-card-color"?: "banana" | "tangerine" } {
  if (isWarmSectionCardColor(cardColor)) {
    return { "data-card-color": cardColor };
  }
  return {};
}

export function getSectionCardClassName(cardColor: SectionCardColor): string {
  switch (cardColor) {
    case "surface":
      return "bg-[var(--section-surface)] text-[var(--section-text)]";
    case "brand-green":
      return "bg-se-green text-white";
    case "kale":
      return "bg-kale text-white";
    case "banana":
      return "bg-banana text-[var(--section-text)]";
    case "tangerine":
      return "bg-tangerine text-[var(--section-text)]";
  }
}

/** Outer section card — radius.md on mobile, radius.lg at desktop */
export const SECTION_CARD_SHELL_CLASS =
  "rounded-[var(--radius-md)] p-6 sm:p-10 lg:rounded-[var(--radius-lg)] lg:p-16";

/** Image corners inside a section card */
export const SECTION_CARD_IMAGE_RADIUS_CLASS =
  "rounded-3xl lg:rounded-[var(--radius-md)]";

/** Nested form/content corners inside a section card — same softer inset as images */
export const SECTION_CARD_NESTED_RADIUS_CLASS = SECTION_CARD_IMAGE_RADIUS_CLASS;
