import { DonationForm } from "@/components/donation/DonationForm";
import { TextSection } from "@/components/ui/TextSection";
import type { ImagePosition, SectionContentProps } from "@/lib/types";
import type { ReactNode } from "react";
import { SectionLayout } from "./SectionLayout";
import { SectionShell } from "./SectionShell";
import { sectionCardContentIsDark, coerceSectionCardColor, getSectionCardInteriorTheme } from "./sectionCardConfig";

export interface DonationSectionProps extends Omit<SectionContentProps, "primaryCta" | "secondaryCta"> {
  body: string;
  /** Which side the donation form appears on at lg+ — mirrors TextImage imagePosition */
  formPosition?: ImagePosition;
  submitLabel?: string;
  /** Replace the built-in form UI — e.g. Classy embed */
  children?: ReactNode;
  /** Reserve space below for an arch transition on the next section */
  archBottom?: boolean;
}

export function DonationSection({
  theme = "dark",
  isCard = false,
  cardColor = "surface",
  title,
  headingSize = "h2",
  body,
  bodySize = "lg",
  eyebrow,
  formPosition = "left",
  submitLabel = "Make a donation",
  children,
  className,
  id,
  archBottom,
  transparentBg,
}: DonationSectionProps) {
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);

  const textSection = (
    <TextSection
      eyebrow={eyebrow}
      heading={title}
      headingSize={headingSize}
      body={body}
      bodySize={bodySize}
      buttonScheme={isDark ? "dark" : "light"}
      emphasis={!isCard || isDark}
      isCard={isCard}
    />
  );

  const resolvedCardColor = coerceSectionCardColor(theme, cardColor);
  const formSectionTheme = isCard
    ? getSectionCardInteriorTheme(resolvedCardColor, theme)
    : theme;
  const formSlot = children ?? (
    <DonationForm submitLabel={submitLabel} sectionTheme={formSectionTheme} inCard={isCard} />
  );

  return (
    <SectionShell theme={theme} archBottom={archBottom} transparentBg={transparentBg} className={className} id={id}>
      <SectionLayout
        layout="horizontal"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        reverse={formPosition === "left"}
        textSlot={<div>{textSection}</div>}
        contentSlot={formSlot}
      />
    </SectionShell>
  );
}

export default DonationSection;
