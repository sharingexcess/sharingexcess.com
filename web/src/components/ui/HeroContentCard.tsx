import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

export interface HeroContentCardProps {
  title: string;
  body?: string;
  bodySize?: "xl" | "lg" | "md";
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  className?: string;
}

/** White overlay card for home hero — matches donate form shell styling. */
export function HeroContentCard({
  title,
  body,
  bodySize = "lg",
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  className,
}: HeroContentCardProps) {
  const bodyLines = body?.split("\n") ?? [];
  const mainBody = bodyLines[0]?.trim();
  const emphasisBody = bodyLines.slice(1).join("\n").trim() || undefined;

  return (
    <div
      data-form-card="white"
      style={
        {
          "--section-text": "var(--color-kale)",
          "--section-emphasis": "var(--color-se-green)",
        } as CSSProperties
      }
      className={cn(
        "@container flex w-full min-w-0 flex-col gap-6 rounded-[var(--radius-lg)] bg-white p-4 text-kale sm:p-6 lg:rounded-[var(--radius-xl)] lg:p-10",
        className,
      )}
    >
      <TextSection
        heading={title}
        headingSize="h2"
        body={mainBody}
        bodyEmphasis={emphasisBody}
        bodySize={bodySize}
        primaryCta={primaryCta}
        primaryCtaHref={primaryCtaHref}
        secondaryCta={secondaryCta}
        secondaryCtaHref={secondaryCtaHref}
        buttonScheme="light"
        layout="vertical"
        ctaLayout="row"
        ctaSize="sm"
        emphasis
      />
    </div>
  );
}

export default HeroContentCard;
