import { cn } from "@/lib/cn";
import { parseEmphasis } from "@/lib/parseEmphasis";
import {
  eyebrowClassName,
  bodyLgClassName,
  bodyXlClassName,
  sectionH1ClassName,
  sectionH2ClassName,
  sectionMetricSubheadingClassName,
} from "@/lib/typography";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { SlotMachineNumber } from "@/components/ui/SlotMachineNumber";
import { Button } from "./Button";

function MetricNumber({ value }: { value: string }) {
  return (
    <SlotMachineNumber
      value={value}
      className="text-[var(--section-emphasis)]"
    />
  );
}

export interface TextSectionProps {
  eyebrow?: string;
  /** Large display numeral shown above the heading */
  metric?: string;
  heading?: string;
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
  /** Blur-in or word-by-word heading entrance — `animateHeading` is shorthand for `"words"` */
  headingAnimation?: "words" | "blur";
  /** When false, *asterisk* spans render as plain text */
  emphasis?: boolean;
  /** Card layout — secondary CTA keeps rest color on hover */
  isCard?: boolean;
  className?: string;
}

const headingClasses = {
  h1: sectionH1ClassName,
  h2: sectionH2ClassName,
};

function resolveHeadingClassName(headingSize: "h1" | "h2", hasMetric: boolean): string {
  if (!hasMetric) return headingClasses[headingSize];
  return headingSize === "h1" ? sectionH2ClassName : sectionMetricSubheadingClassName;
}

const bodyClasses = {
  xl: bodyXlClassName,
  lg: bodyLgClassName,
  md: "text-sm leading-[1.4] lg:text-base",
};

export function TextSection({
  eyebrow,
  metric,
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
  headingAnimation,
  emphasis = true,
  isCard = false,
  className,
}: TextSectionProps) {
  const hasCtas = primaryCta || secondaryCta;
  const isCentered = align === "center";

  const scheme = buttonScheme === "dark" ? "dark" : "light";
  const headingClassName = resolveHeadingClassName(headingSize, Boolean(metric));
  const resolvedHeadingAnimation =
    headingAnimation ?? (animateHeading ? "words" : undefined);
  const headingTextClassName = cn(
    headingClassName,
    "text-pretty whitespace-pre-line text-[var(--section-text,#003619)]",
  );

  const headingEl = heading ? (
    resolvedHeadingAnimation === "words" ? (
      <AnimatedHeroHeading
        title={heading}
        as="p"
        emphasis={emphasis}
        className={cn(headingClassName, "text-[var(--section-text,#003619)]")}
      />
    ) : resolvedHeadingAnimation === "blur" ? (
      <AnimatedHeroHeading
        title={heading}
        as="p"
        emphasis={emphasis}
        reveal="blur"
        trigger="inView"
        className={cn(headingClassName, "text-[var(--section-text,#003619)]")}
      />
    ) : (
      <p className={headingTextClassName}>
        {parseEmphasis(heading, emphasis)}
      </p>
    )
  ) : null;

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
          {(metric || headingEl) && (
            <div className={cn("flex w-full flex-col lg:flex-1", metric ? "gap-4 lg:gap-5" : "gap-2")}>
              {metric && <MetricNumber value={metric} />}
              {headingEl}
            </div>
          )}
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
      className={cn(
        "flex flex-col",
        metric ? "gap-6 lg:gap-10" : "gap-4 lg:gap-8",
        isCentered && "items-center text-center",
        className,
      )}
    >
      <div className={cn("flex flex-col", metric ? "gap-4 lg:gap-6" : "gap-2 lg:gap-2.5")}>
        {eyebrow && (
          <p className={cn(eyebrowClassName, "text-[var(--section-text,#003619)]")}>{eyebrow}</p>
        )}
        {metric && <MetricNumber value={metric} />}
        {headingEl}
        {body && (
          <p
            className={cn(
              metric ? "mt-0" : "mt-1 lg:mt-2",
              bodyClasses[bodySize],
              "text-[var(--section-text,#003619)]",
            )}
          >
            {body}
          </p>
        )}
      </div>
      {ctaRow}
    </div>
  );
}

export default TextSection;
