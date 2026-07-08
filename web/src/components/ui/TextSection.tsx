import { cn } from "@/lib/cn";
import { parseEmphasis } from "@/lib/parseEmphasis";
import { eyebrowClassName } from "@/lib/typography";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { Button } from "./Button";

export interface TextSectionProps {
  eyebrow?: string;
  heading: string;
  headingSize?: "h1" | "h2";
  body?: string;
  bodySize?: "xl" | "lg" | "md";
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  /**
   * Controls CTA button colors on the section surface.
   * "light" (default): primary + secondary (light tokens)
   * "dark": primary + secondary (dark tokens) on dark/green/card backgrounds
   */
  buttonScheme?: "light" | "dark";
  layout?: "vertical" | "horizontal";
  align?: "left" | "center";
  /** Word-by-word entrance animation for hero headings */
  animateHeading?: boolean;
  /** When false, *asterisk* spans render as plain text */
  emphasis?: boolean;
  /** Card layout — secondary CTA keeps rest color on hover */
  isCard?: boolean;
  className?: string;
}

const headingClasses = {
  h1: "text-[clamp(40px,9vw,96px)] font-medium leading-[1.06] tracking-[-0.04em] lg:text-[clamp(48px,6.35cqw,96px)]",
  h2: "text-[clamp(32px,7.5vw,72px)] font-medium leading-[1.06] tracking-[-0.04em] lg:text-[clamp(36px,4.76cqw,72px)]",
};

const bodyClasses = {
  xl: "text-sm leading-[1.4] lg:text-[20px]",
  lg: "text-sm leading-[1.4] lg:text-[18px]",
  md: "text-sm leading-[1.4] lg:text-base",
};

export function TextSection({
  eyebrow,
  heading,
  headingSize = "h1",
  body,
  bodySize = "xl",
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  buttonScheme = "light",
  layout = "vertical",
  align = "left",
  animateHeading = false,
  emphasis = true,
  isCard = false,
  className,
}: TextSectionProps) {
  const hasCtas = primaryCta || secondaryCta;
  const isCentered = align === "center";

  const scheme = buttonScheme === "dark" ? "dark" : "light";

  const headingEl = animateHeading ? (
    <AnimatedHeroHeading
      title={heading}
      as="p"
      emphasis={emphasis}
      className={cn(headingClasses[headingSize], "text-[var(--section-text,#003619)]")}
    />
  ) : (
    <p className={cn(headingClasses[headingSize], "text-[var(--section-text,#003619)]")}>
      {parseEmphasis(heading, emphasis)}
    </p>
  );

  const ctaRow = hasCtas && (
    <div
      {...(isCard ? { "data-section-card": true } : {})}
      className={cn("flex flex-wrap gap-2 lg:gap-4", isCentered && "justify-center")}
    >
      {primaryCta && (
        <Button variant="primary" colorScheme={scheme} href={primaryCtaHref}>
          {primaryCta}
        </Button>
      )}
      {secondaryCta && (
        <Button variant="secondary" colorScheme={scheme} href={secondaryCtaHref}>
          {secondaryCta}
        </Button>
      )}
    </div>
  );

  if (layout === "horizontal") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {eyebrow && (
          <p className={cn(eyebrowClassName, "text-[var(--section-text,#003619)]")}>{eyebrow}</p>
        )}
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-8">
          <div className="w-full lg:flex-1">{headingEl}</div>
          <div className="flex w-full flex-col gap-4 lg:flex-1">
            {body && (
              <p className={cn(bodyClasses[bodySize], "text-[var(--section-text,#003619)]")}>
                {body}
              </p>
            )}
            {ctaRow}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-4 lg:gap-8", isCentered && "items-center text-center", className)}
    >
      <div className="flex flex-col gap-2 lg:gap-2.5">
        {eyebrow && (
          <p className={cn(eyebrowClassName, "text-[var(--section-text,#003619)]")}>{eyebrow}</p>
        )}
        {headingEl}
        {body && (
          <p className={cn("mt-1 lg:mt-2", bodyClasses[bodySize], "text-[var(--section-text,#003619)]")}>
            {body}
          </p>
        )}
      </div>
      {ctaRow}
    </div>
  );
}

export default TextSection;
