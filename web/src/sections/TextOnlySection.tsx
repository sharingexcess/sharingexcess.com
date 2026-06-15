import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { SectionContentProps, SectionLayoutType } from "@/lib/types";
import { SectionShell } from "./SectionShell";

export interface TextOnlySectionProps extends SectionContentProps {
  align?: "left" | "center";
  layout?: SectionLayoutType;
  /** Optional full-bleed background image behind the section */
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
  id?: string;
}

export function TextOnlySection({
  theme = "light",
  eyebrow,
  title,
  headingSize = "h1",
  body,
  bodySize = "xl",
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  align = "left",
  layout = "vertical",
  backgroundImageSrc,
  backgroundImageAlt = "",
  className,
  id,
}: TextOnlySectionProps) {
  const isDark = theme === "dark";
  const isCentered = align === "center";

  const textBlock = (
    <TextSection
      eyebrow={eyebrow}
      heading={title}
      headingSize={headingSize}
      body={body}
      bodySize={bodySize}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      secondaryCta={secondaryCta}
      secondaryCtaHref={secondaryCtaHref}
      buttonScheme={isDark ? "dark" : "light"}
      layout={layout}
      align={align}
      className={cn(isCentered && "mx-auto max-w-3xl")}
    />
  );

  if (backgroundImageSrc) {
    return (
      <section
        id={id}
        data-theme={theme}
        className={cn("relative overflow-hidden px-6 py-12 lg:px-24 lg:py-[120px]", className)}
      >
        <img
          src={backgroundImageSrc}
          alt={backgroundImageAlt}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="relative mx-auto max-w-6xl">{textBlock}</div>
      </section>
    );
  }

  return (
    <SectionShell theme={theme} className={className} id={id}>
      <div className={cn(!isCentered && "max-w-[915px]")}>{textBlock}</div>
    </SectionShell>
  );
}

export default TextOnlySection;
