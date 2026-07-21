import { NewsletterSignupForm } from "@/components/forms/NewsletterSignupForm";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";
import { TextInput } from "@/components/ui/TextInput";
import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { FormSectionLayout, FormSectionVariant, SectionContentProps, SectionTheme } from "@/lib/types";
import { SectionLayout } from "./SectionLayout";
import { SectionShell } from "./SectionShell";
import {
  coerceFormSectionThemeAndVariant,
  formCardGlassTone,
  getFormCardDataAttributes,
} from "./formSectionConfig";
import { getSectionCardDataAttributes } from "./sectionCardConfig";
import { useRef, type ReactNode } from "react";

function FormPhotoBackgroundSection({
  id,
  className,
  isCentered,
  backgroundImageSrc,
  backgroundImageAlt,
  card,
}: {
  id?: string;
  className?: string;
  isCentered: boolean;
  backgroundImageSrc: string;
  backgroundImageAlt: string;
  card: ReactNode;
}) {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={scrollRef}
      id={id}
      className={cn(
        "relative overflow-hidden px-6 py-12 lg:px-24 lg:py-[120px]",
        isCentered && "flex flex-col items-center",
        className,
      )}
    >
      <ParallaxBackground
        scrollRef={scrollRef}
        src={backgroundImageSrc}
        alt={backgroundImageAlt}
      />
      <div className={cn("relative mx-auto max-w-6xl", isCentered && "flex justify-center")}>
        <div className={cn("w-full max-w-[776px]", isCentered && "mx-auto")}>{card}</div>
      </div>
    </section>
  );
}

type ResolvedVariant =
  | "brand-green"
  | "kale"
  | "white"
  | "dark-green"
  | "yellow"
  | "orange";

const DARK_CARD_VARIANTS = new Set<ResolvedVariant>(["brand-green", "kale", "dark-green"]);

const variantStyles: Record<
  ResolvedVariant,
  { card: string; inputTheme: "onColor" | "onWhite"; buttonVariant: "primary" | "secondary" }
> = {
  "brand-green": {
    card: "bg-se-green text-white",
    inputTheme: "onColor",
    buttonVariant: "secondary",
  },
  kale: {
    card: "bg-se-green-700 text-white",
    inputTheme: "onColor",
    buttonVariant: "secondary",
  },
  white: {
    card: "bg-neutral-100 text-kale",
    inputTheme: "onColor",
    buttonVariant: "primary",
  },
  "dark-green": {
    card: "bg-se-green-600 text-white",
    inputTheme: "onColor",
    buttonVariant: "secondary",
  },
  yellow: {
    card: "bg-banana text-[var(--section-text)]",
    inputTheme: "onColor",
    buttonVariant: "primary",
  },
  orange: {
    card: "bg-tangerine text-[var(--section-text)]",
    inputTheme: "onColor",
    buttonVariant: "primary",
  },
};

function resolveVariant(variant: FormSectionVariant): ResolvedVariant {
  if (variant === "banana") return "yellow";
  if (variant === "tangerine") return "orange";
  if (variant === "brand-green-glass" || variant === "brand-green") return "brand-green";
  if (variant === "kale-glass" || variant === "glass" || variant === "kale") return "kale";
  if (variant === "light-green" || variant === "white") return "white";
  return variant;
}

type GlassTone = "bright-kelly" | "se-green";

function glassCircleClass(tone: GlassTone, opacity: "12" | "10"): string {
  if (tone === "bright-kelly") {
    return opacity === "12" ? "bg-bright-kelly/12" : "bg-bright-kelly/10";
  }
  return opacity === "12" ? "bg-se-green/12" : "bg-se-green/10";
}

/** Figma 1046:2443 (brand-green) uses bright-kelly; 1046:2024 (kale) uses se-green. */
function GlassDecoration({ tone }: { tone: GlassTone }) {
  const outer = glassCircleClass(tone, "12");
  const inner = glassCircleClass(tone, "10");

  return (
    <>
      <div
        aria-hidden
        className={cn("pointer-events-none absolute -left-[1128px] -top-[594px] size-[2281px] rounded-full", outer)}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-[743px] -top-[209px] h-[1512px] w-[1512px] rounded-full",
          tone === "bright-kelly" ? outer : inner,
        )}
      />
      <div
        aria-hidden
        className={cn("pointer-events-none absolute -left-[439px] top-[94px] size-[904px] rounded-full", inner)}
      />
      <div
        aria-hidden
        className={cn("pointer-events-none absolute -left-[189px] top-[344px] size-[404px] rounded-full", inner)}
      />
    </>
  );
}

function ContactFormFields({
  inputTheme,
  submitLabel = "Submit",
  buttonVariant,
  buttonColorScheme = "dark",
}: {
  inputTheme: "onColor" | "onWhite";
  submitLabel?: string;
  buttonVariant: "primary" | "secondary";
  buttonColorScheme?: "light" | "dark";
}) {
  const textareaClass =
    inputTheme === "onWhite"
      ? "border border-neutral-250 bg-neutral-100 text-kale focus:border-se-green"
      : "bg-white text-kale focus:ring-2 focus:ring-white/40";

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput theme={inputTheme} placeholder="First Name" aria-label="First Name" />
        <TextInput theme={inputTheme} placeholder="Last Name" aria-label="Last Name" />
      </div>
      <TextInput theme={inputTheme} placeholder="Email" aria-label="Email" type="email" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput theme={inputTheme} placeholder="Phone Number (Optional)" aria-label="Phone Number" />
        <TextInput theme={inputTheme} placeholder="Organization Name" aria-label="Organization Name" />
      </div>
      <textarea
        placeholder="How can we help?"
        aria-label="Message"
        rows={5}
        className={cn(
          "w-full resize-none rounded-3xl px-4 py-3 text-base leading-[1.4] placeholder:text-neutral-400 outline-none transition-colors",
          textareaClass,
        )}
      />
      <div>
        <Button
          type="submit"
          variant={buttonVariant}
          colorScheme={buttonColorScheme}
          size="md"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export interface FormSectionProps extends Pick<
  SectionContentProps,
  | "eyebrow"
  | "title"
  | "headingSize"
  | "body"
  | "bodySize"
  | "className"
> {
  variant?: FormSectionVariant;
  layout?: FormSectionLayout;
  submitLabel?: string;
  /** Used with `layout="vertical-card"` — full-bleed background behind the card */
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
  /** Vertical card only — centers the card on the page over the background image (Figma 1236:4213) */
  align?: "left" | "center";
  theme?: SectionTheme;
  /** Built-in form preset — ignored when `children` is provided */
  formKind?: "contact" | "newsletter";
  children?: React.ReactNode;
  id?: string;
}

export function FormSection({
  variant = "brand-green-glass",
  layout = "horizontal-card",
  eyebrow,
  title,
  headingSize = "h1",
  body,
  bodySize = "lg",
  submitLabel = "Submit",
  backgroundImageSrc,
  backgroundImageAlt = "",
  align = "left",
  theme = "light",
  formKind = "contact",
  children,
  className,
  id,
}: FormSectionProps) {
  const isStandardLayout = layout === "horizontal" || layout === "vertical";
  const { theme: sectionTheme, variant: sectionVariant } = isStandardLayout
    ? { theme, variant }
    : coerceFormSectionThemeAndVariant(theme, variant, layout);
  const resolved = resolveVariant(sectionVariant);
  const isVerticalCard = layout === "vertical-card";
  const hasBackgroundImage = Boolean(backgroundImageSrc);
  const isVerticalCardOnPhoto = isVerticalCard && hasBackgroundImage;
  const cardResolved =
    isVerticalCardOnPhoto ? "white" : isVerticalCard && resolved === "white" ? "brand-green" : resolved;
  const styles = variantStyles[cardResolved];
  const photoCardStyles = {
    card: "bg-white text-kale",
    inputTheme: "onWhite" as const,
    buttonVariant: "primary" as const,
  };
  const activeStyles = isVerticalCardOnPhoto ? photoCardStyles : styles;
  const glassTone = layout === "horizontal-card" ? formCardGlassTone(sectionVariant) : null;
  const isCentered = isVerticalCard && align === "center";
  const isDarkSection = sectionTheme === "dark";
  const isWarmCard = cardResolved === "yellow" || cardResolved === "orange";
  const isLightCard = cardResolved === "white" || isWarmCard;
  const formCardAttrs = getFormCardDataAttributes(cardResolved);
  const warmCardAttrs = isWarmCard
    ? getSectionCardDataAttributes(cardResolved === "yellow" ? "banana" : "tangerine")
    : {};
  const cardButtonColorScheme = isVerticalCardOnPhoto
    ? "light"
    : isWarmCard
      ? "light"
      : DARK_CARD_VARIANTS.has(cardResolved)
        ? "dark"
        : "light";
  const cardInputTheme = isStandardLayout ? "onWhite" : activeStyles.inputTheme;

  const textSection = (
    <TextSection
      eyebrow={eyebrow}
      heading={title}
      headingSize={headingSize}
      body={body}
      bodySize={bodySize}
      buttonScheme={
        isStandardLayout
          ? isDarkSection
            ? "dark"
            : "light"
          : isVerticalCardOnPhoto
            ? "light"
            : isLightCard
              ? "light"
              : activeStyles.inputTheme === "onColor"
                ? "dark"
                : "light"
      }
      align="left"
    />
  );

  const formFieldProps = {
    inputTheme: cardInputTheme,
    submitLabel,
    buttonVariant: (isStandardLayout ? "primary" : activeStyles.buttonVariant) as "primary" | "secondary",
    buttonColorScheme: (isStandardLayout
      ? isDarkSection
        ? "dark"
        : "light"
      : cardButtonColorScheme) as "light" | "dark",
  };

  const formFields =
    children ??
    (formKind === "newsletter" ? (
      <NewsletterSignupForm {...formFieldProps} />
    ) : (
      <ContactFormFields {...formFieldProps} />
    ));

  const cardInner =
    layout === "vertical-card" ? (
      <div className="flex flex-col gap-16">
        {textSection}
        <div className="w-full max-w-[648px]">{formFields}</div>
      </div>
    ) : (
      <SectionLayout layout="horizontal" textSlot={textSection} contentSlot={formFields} />
    );

  const card = (
    <div
      data-theme={isVerticalCardOnPhoto || !DARK_CARD_VARIANTS.has(cardResolved) ? "light" : "dark"}
      {...formCardAttrs}
      {...warmCardAttrs}
      className={cn(
        "rounded-[var(--radius-lg)] p-16",
        activeStyles.card,
        glassTone && "relative overflow-hidden",
      )}
    >
      {glassTone && <GlassDecoration tone={glassTone} />}
      <div className="relative">{cardInner}</div>
    </div>
  );

  if (layout === "horizontal") {
    return (
      <SectionShell theme={sectionTheme} className={className} id={id}>
        <SectionLayout layout="horizontal" textSlot={textSection} contentSlot={formFields} />
      </SectionShell>
    );
  }

  if (layout === "vertical") {
    return (
      <SectionShell theme={sectionTheme} className={className} id={id}>
        <div className="mx-auto flex w-full max-w-[915px] flex-col gap-16">
          {textSection}
          {formFields}
        </div>
      </SectionShell>
    );
  }

  if (backgroundImageSrc) {
    return (
      <FormPhotoBackgroundSection
        id={id}
        className={className}
        isCentered={isCentered}
        backgroundImageSrc={backgroundImageSrc}
        backgroundImageAlt={backgroundImageAlt}
        card={card}
      />
    );
  }

  return (
    <SectionShell theme={sectionTheme} className={className} id={id}>
      {layout === "vertical-card" ? (
        <div className={cn(isCentered && "flex flex-col items-center")}>
          <div className="w-full max-w-[776px]">{card}</div>
        </div>
      ) : (
        card
      )}
    </SectionShell>
  );
}

export default FormSection;
