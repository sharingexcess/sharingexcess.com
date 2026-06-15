import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef } from "react";
import type { FormSectionLayout, FormSectionVariant, SectionTheme } from "@/lib/types";
import { FormSection } from "./FormSection";
import {
  FORM_CARD_DARK_THEME_VARIANTS,
  FORM_HORIZONTAL_CARD_VARIANTS,
  FORM_HORIZONTAL_CARD_VARIANT_LABELS,
  FORM_VERTICAL_CARD_ALIGN_LABELS,
  FORM_VERTICAL_CARD_ALIGN_VARIANTS,
  FORM_VERTICAL_CARD_DARK_THEME_VARIANTS,
  FORM_VERTICAL_CARD_VARIANTS,
  FORM_VERTICAL_CARD_VARIANT_LABELS,
  coerceFormSectionThemeAndVariant,
  isFormCardLightOnlyVariant,
} from "./formSectionConfig";
import { sectionThemeArgs, sectionThemeArgTypes } from "./sectionStoryControls";

const sharedArgs = {
  title: "Lorem et du el ipsum",
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  submitLabel: "Submit",
};

const horizontalCardVariantLabels = FORM_HORIZONTAL_CARD_VARIANT_LABELS;

function syncFormCardArgs(
  theme: SectionTheme,
  variant: FormSectionVariant,
  prevTheme: SectionTheme,
  layout: FormSectionLayout,
): { theme: SectionTheme; variant: FormSectionVariant } {
  const darkThemeVariants =
    layout === "vertical-card"
      ? FORM_VERTICAL_CARD_DARK_THEME_VARIANTS
      : FORM_CARD_DARK_THEME_VARIANTS;

  if (theme === "dark" && prevTheme !== "dark" && isFormCardLightOnlyVariant(variant)) {
    return { theme: "dark", variant: "brand-green" };
  }

  if (isFormCardLightOnlyVariant(variant)) {
    return { theme: "light", variant };
  }

  if (
    theme === "dark" &&
    !darkThemeVariants.includes(variant as (typeof darkThemeVariants)[number])
  ) {
    return { theme: "dark", variant: "brand-green" };
  }

  return { theme, variant };
}

const withFormCardControls: Decorator = (Story, { args, updateArgs }) => {
  const layout = (args.layout ?? "horizontal-card") as FormSectionLayout;
  const isCardLayout = layout === "horizontal-card" || layout === "vertical-card";

  if (!isCardLayout) {
    return <Story />;
  }

  const theme = (args.theme ?? "light") as SectionTheme;
  const defaultVariant = layout === "vertical-card" ? "brand-green" : "brand-green-glass";
  const variant = (args.variant ?? defaultVariant) as FormSectionVariant;
  const prevTheme = useRef(theme);

  const synced = syncFormCardArgs(theme, variant, prevTheme.current, layout);
  const coerced = coerceFormSectionThemeAndVariant(synced.theme, synced.variant, layout);

  useEffect(() => {
    if (coerced.theme !== theme || coerced.variant !== variant) {
      updateArgs?.({ theme: coerced.theme, variant: coerced.variant });
    }
    prevTheme.current = coerced.theme;
  }, [theme, variant, coerced.theme, coerced.variant, updateArgs]);

  return <Story args={{ ...args, theme: coerced.theme, variant: coerced.variant }} />;
};

const meta = {
  title: "Sections/Form",
  component: FormSection,
  parameters: { layout: "fullscreen" },
  args: {
    ...sectionThemeArgs,
    ...sharedArgs,
    variant: "brand-green-glass",
    layout: "horizontal-card",
    headingSize: "h1",
    bodySize: "lg",
  },
  argTypes: {
    ...sectionThemeArgTypes,
    layout: {
      control: "select",
      options: ["horizontal-card", "vertical-card", "horizontal", "vertical"],
    },
    align: { control: "radio", options: ["left", "center"] },
    headingSize: { control: "radio", options: ["h1", "h2"] },
    bodySize: { control: "radio", options: ["xl", "lg", "md"] },
  },
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalCard: Story = {
  args: { layout: "horizontal-card", variant: "brand-green-glass", theme: "light" },
  decorators: [withFormCardControls],
  argTypes: {
    layout: { control: false },
    variant: {
      control: "select",
      labels: horizontalCardVariantLabels,
      options: [...FORM_HORIZONTAL_CARD_VARIANTS],
    },
  },
};

export const VerticalCard: Story = {
  args: {
    layout: "vertical-card",
    variant: "brand-green",
    theme: "light",
    backgroundImageSrc: "",
    backgroundImageAlt: "",
    align: "left",
  },
  decorators: [withFormCardControls],
  argTypes: {
    layout: { control: false },
    variant: {
      control: "select",
      labels: FORM_VERTICAL_CARD_VARIANT_LABELS,
      options: [...FORM_VERTICAL_CARD_VARIANTS],
      if: { arg: "backgroundImageSrc", eq: "" },
    },
    align: {
      control: "select",
      labels: FORM_VERTICAL_CARD_ALIGN_LABELS,
      options: [...FORM_VERTICAL_CARD_ALIGN_VARIANTS],
    },
    backgroundImageSrc: {
      control: "select",
      options: ["", "/images/peppers.jpg"],
      labels: { "": "None", "/images/peppers.jpg": "Photo background" },
    },
  },
};

export const StandardHorizontal: Story = {
  args: { layout: "horizontal", theme: "light" },
  argTypes: { layout: { control: false }, variant: { control: false } },
};

export const StandardVertical: Story = {
  args: {
    layout: "vertical",
    theme: "light",
    eyebrow: "Section Eyebrow",
    title: "Lorem ipsum dolor sit *conspectus*.",
  },
  argTypes: { layout: { control: false }, variant: { control: false } },
};
