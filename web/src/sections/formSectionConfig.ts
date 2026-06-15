import type { FormSectionLayout, FormSectionVariant, SectionTheme } from "@/lib/types";

/**
 * Horizontal form card color variants.
 * Figma: 1046:2443 brand-green-glass, 1046:2024 kale-glass, 1236:4181 white.
 * Also: dark-green, banana, tangerine.
 */
export const FORM_HORIZONTAL_CARD_VARIANTS = [
  "brand-green",
  "brand-green-glass",
  "kale-glass",
  "white",
  "dark-green",
  "banana",
  "tangerine",
] as const satisfies readonly FormSectionVariant[];

export type FormHorizontalCardVariant = (typeof FORM_HORIZONTAL_CARD_VARIANTS)[number];

export const FORM_HORIZONTAL_CARD_VARIANT_LABELS: Record<FormHorizontalCardVariant, string> = {
  "brand-green": "Brand green",
  "brand-green-glass": "Brand green (glass)",
  "kale-glass": "Kale (glass)",
  white: "White",
  "dark-green": "Dark green",
  banana: "Banana",
  tangerine: "Tangerine",
};

/** Vertical card colors (no photo background). White card is automatic when a photo bg is set. */
export const FORM_VERTICAL_CARD_VARIANTS = [
  "brand-green",
  "dark-green",
  "banana",
  "tangerine",
] as const satisfies readonly FormSectionVariant[];

export type FormVerticalCardVariant = (typeof FORM_VERTICAL_CARD_VARIANTS)[number];

export const FORM_VERTICAL_CARD_VARIANT_LABELS: Record<FormVerticalCardVariant, string> = {
  "brand-green": "Brand green",
  "dark-green": "Dark green",
  banana: "Banana",
  tangerine: "Tangerine",
};

export const FORM_CARD_DARK_THEME_VARIANTS = [
  "brand-green",
  "brand-green-glass",
  "kale-glass",
  "dark-green",
] as const satisfies readonly FormSectionVariant[];

export const FORM_VERTICAL_CARD_DARK_THEME_VARIANTS = [
  "brand-green",
  "dark-green",
] as const satisfies readonly FormSectionVariant[];

export function formCardGlassTone(
  variant: FormSectionVariant,
): "bright-kelly" | "se-green" | null {
  if (variant === "brand-green-glass") return "bright-kelly";
  if (variant === "kale-glass" || variant === "glass") return "se-green";
  return null;
}

const LIGHT_ONLY_VARIANTS = new Set<FormSectionVariant>([
  "white",
  "light-green",
  "banana",
  "tangerine",
  "yellow",
  "orange",
]);

export function isFormCardLightOnlyVariant(variant: FormSectionVariant): boolean {
  return LIGHT_ONLY_VARIANTS.has(variant);
}

export function getFormCardDarkThemeVariants(
  layout: FormSectionLayout,
): readonly FormSectionVariant[] {
  if (layout === "vertical-card") {
    return FORM_VERTICAL_CARD_DARK_THEME_VARIANTS;
  }
  if (layout === "horizontal-card") {
    return FORM_CARD_DARK_THEME_VARIANTS;
  }
  return FORM_CARD_DARK_THEME_VARIANTS;
}

export function getFormCardVariantsForLayout(
  layout: FormSectionLayout,
  theme: SectionTheme,
): FormSectionVariant[] {
  if (layout === "vertical-card") {
    if (theme === "dark") {
      return [...FORM_VERTICAL_CARD_DARK_THEME_VARIANTS];
    }
    return [...FORM_VERTICAL_CARD_VARIANTS];
  }
  if (layout === "horizontal-card") {
    return getFormCardVariantsForTheme(theme);
  }
  return [];
}

export function getFormCardVariantsForTheme(theme: SectionTheme): FormSectionVariant[] {
  if (theme === "dark") {
    return [...FORM_CARD_DARK_THEME_VARIANTS];
  }
  return [...FORM_HORIZONTAL_CARD_VARIANTS];
}

const HORIZONTAL_DARK_THEME_VARIANTS = new Set<FormSectionVariant>(FORM_CARD_DARK_THEME_VARIANTS);
const VERTICAL_DARK_THEME_VARIANTS = new Set<FormSectionVariant>(FORM_VERTICAL_CARD_DARK_THEME_VARIANTS);

/** Banana, tangerine, and white require a light section shell. */
export function coerceFormSectionThemeAndVariant(
  theme: SectionTheme,
  variant: FormSectionVariant,
  layout: FormSectionLayout = "horizontal-card",
): { theme: SectionTheme; variant: FormSectionVariant } {
  let resolvedVariant = variant;

  if (layout === "vertical-card") {
    if (resolvedVariant === "brand-green-glass") resolvedVariant = "brand-green";
    if (resolvedVariant === "kale-glass" || resolvedVariant === "glass") {
      resolvedVariant = "dark-green";
    }
  }

  if (isFormCardLightOnlyVariant(resolvedVariant)) {
    return { theme: "light", variant: resolvedVariant };
  }

  const darkVariants =
    layout === "vertical-card" ? VERTICAL_DARK_THEME_VARIANTS : HORIZONTAL_DARK_THEME_VARIANTS;

  if (theme === "dark" && !darkVariants.has(resolvedVariant)) {
    return { theme: "dark", variant: "brand-green" };
  }

  return { theme, variant: resolvedVariant };
}

/** Vertical card placement — Figma 1236:4213 (center). */
export const FORM_VERTICAL_CARD_ALIGN_VARIANTS = ["left", "center"] as const;

export type FormVerticalCardAlign = (typeof FORM_VERTICAL_CARD_ALIGN_VARIANTS)[number];

export const FORM_VERTICAL_CARD_ALIGN_LABELS: Record<FormVerticalCardAlign, string> = {
  left: "Left aligned",
  center: "Center aligned",
};

export type FormCardTone =
  | "brand-green"
  | "kale"
  | "dark-green"
  | "white"
  | "banana"
  | "tangerine";

/** Resolved FormSection card variant (after `resolveVariant` in FormSection). */
export type FormCardResolvedVariant =
  | "brand-green"
  | "kale"
  | "dark-green"
  | "white"
  | "yellow"
  | "orange";

const FORM_CARD_TONE: Record<FormCardResolvedVariant, FormCardTone> = {
  "brand-green": "brand-green",
  kale: "kale",
  "dark-green": "dark-green",
  white: "white",
  yellow: "banana",
  orange: "tangerine",
};

export function getFormCardDataAttributes(
  resolved: FormCardResolvedVariant,
): { "data-form-card": FormCardTone } {
  return { "data-form-card": FORM_CARD_TONE[resolved] };
}
