import type { ArgTypes, Decorator } from "@storybook/react";
import { useEffect } from "react";
import type { SectionCardColor, SectionTheme } from "@/lib/types";
import {
  SECTION_CARD_COLOR_LABELS,
  SECTION_CARD_COLORS_LIGHT,
  coerceSectionCardColor,
} from "./sectionCardConfig";

/**
 * Shared Storybook controls for section stories.
 *
 * Add `decorators`, `args`, and `argTypes` to each section meta:
 *
 *   decorators: [withSectionControls],
 *   args:       { ...meta.args, ...sectionControlArgs },
 *   argTypes:   { ...meta.argTypes, ...sectionControlArgTypes },
 *
 * Sections without text CTAs can use `sectionThemeArgs` + `sectionThemeArgTypes` only.
 */

export const sectionThemeArgs = {
  theme: "light" as SectionTheme,
};

export const sectionThemeArgTypes: Partial<ArgTypes> = {
  theme: {
    name: "theme",
    control: "radio",
    options: ["light", "dark"],
    table: { category: "Controls" },
  },
};

export const sectionCardControlArgs = {
  cardColor: "surface" as SectionCardColor,
};

export const sectionCardControlArgTypes: Partial<ArgTypes> = {
  cardColor: {
    name: "card color",
    control: "select",
    options: [...SECTION_CARD_COLORS_LIGHT],
    labels: SECTION_CARD_COLOR_LABELS,
    table: { category: "Controls" },
    if: { arg: "isCard", truthy: true },
  },
};

export const sectionControlArgs = {
  ...sectionThemeArgs,
  ...sectionCardControlArgs,
  titleEmphasis: true,
  showButtons: true,
};

export const sectionControlArgTypes: Partial<ArgTypes> = {
  ...sectionThemeArgTypes,
  ...sectionCardControlArgTypes,
  titleEmphasis: {
    name: "title emphasis",
    control: "boolean",
    table: { category: "Controls" },
  },
  showButtons: {
    name: "show buttons",
    control: "boolean",
    table: { category: "Controls" },
  },
};

function syncSectionCardColor(
  theme: SectionTheme,
  cardColor: SectionCardColor,
): SectionCardColor {
  return coerceSectionCardColor(theme, cardColor);
}

export const withSectionControls: Decorator = (Story, { args, updateArgs }) => {
  const {
    titleEmphasis = true,
    showButtons = true,
    theme = "light",
    cardColor = "surface",
    isCard = false,
    ...rest
  } = args as Record<string, unknown>;

  const sectionTheme = theme as SectionTheme;

  const syncedCardColor = isCard
    ? syncSectionCardColor(sectionTheme, cardColor as SectionCardColor)
    : (cardColor as SectionCardColor);

  useEffect(() => {
    if (!isCard) return;
    if (syncedCardColor !== cardColor) {
      updateArgs?.({ cardColor: syncedCardColor });
    }
  }, [sectionTheme, cardColor, syncedCardColor, isCard, updateArgs]);

  const modifiedArgs = {
    ...rest,
    theme: sectionTheme,
    isCard,
    cardColor: syncedCardColor,
    title: titleEmphasis
      ? (rest.title as string)
      : (rest.title as string | undefined)?.replace(/\*([^*]+)\*/g, "$1"),
    ...(!showButtons && {
      primaryCta: undefined,
      primaryCtaHref: undefined,
      secondaryCta: undefined,
      secondaryCtaHref: undefined,
    }),
  };

  return <Story args={modifiedArgs} />;
};

