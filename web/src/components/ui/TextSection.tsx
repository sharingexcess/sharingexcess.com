import { cn } from "@/lib/cn";
import { parseEmphasis } from "@/lib/parseEmphasis";
import {
  eyebrowClassName,
  bodyLgClassName,
  bodyMdClassName,
  bodyXlClassName,
  sectionH1ClassName,
  sectionH2ClassName,
  sectionMetricSubheadingClassName,
} from "@/lib/typography";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { LiveIndicatorDot } from "@/components/ui/LiveIndicatorDot";
import { SurplusEyebrow } from "@/components/ui/SurplusInfoPopover";
import { SlotMachineNumber } from "@/components/ui/SlotMachineNumber";
import { Button, type ButtonProps } from "./Button";
import type { ReactNode } from "react";

function MetricNumber({
  value,
  numericValue,
  liveTickOffset,
  onRevealComplete,
}: {
  value: string;
  numericValue?: number;
  liveTickOffset?: number;
  onRevealComplete?: () => void;
}) {
  return (
    <SlotMachineNumber
      value={value}
      numericValue={numericValue}
      liveTickOffset={liveTickOffset}
      onRevealComplete={onRevealComplete}
      className="text-[var(--section-emphasis)]"
    />
  );
}

export interface TextSectionProps {
  eyebrow?: string;
  /** Pulsing kelly dot beside the eyebrow — use for live data labels */
  eyebrowLive?: boolean;
  /** Split eyebrow at "Surplus" — word + info icon open the product popover */
  eyebrowSurplusInfo?: boolean;
  /** Large display numeral shown above the heading */
  metric?: string;
  /** Live target for metric slot animation — enables tick-up after reveal */
  metricNumericValue?: number;
  metricLiveTickOffset?: number;
  onMetricRevealComplete?: () => void;
  heading?: string;
  headingSize?: "h1" | "h2";
  body?: string;
  /** Bold emphasis line rendered below body in the same paragraph block */
  bodyEmphasis?: string;
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
  /** Rendered below body copy — e.g. an inline donation form */
  bodyFooter?: ReactNode;
  /** CTA button row layout — `responsive` stacks on narrow viewports */
  ctaLayout?: "row" | "responsive";
  ctaSize?: ButtonProps["size"];
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
  md: bodyMdClassName,
};

function renderBodyCopy({
  body,
  bodyEmphasis,
  bodySize,
  metric,
  emphasis = true,
  textClassName = "text-[var(--section-text,#003619)]",
}: {
  body: string;
  bodyEmphasis?: string;
  bodySize: "xl" | "lg" | "md";
  metric?: string;
  emphasis?: boolean;
  textClassName?: string;
}) {
  const paragraphClassName = cn(
    metric ? "mt-0" : "mt-1 lg:mt-2",
    bodyClasses[bodySize],
    textClassName,
  );

  if (bodyEmphasis) {
    return (
      <div
        className={cn(
          metric ? "mt-0" : "mt-1 lg:mt-2",
          "flex flex-col gap-3 lg:gap-4",
        )}
      >
        <p className={cn(bodyClasses[bodySize], textClassName)}>
          {parseEmphasis(body, emphasis, "paragraph")}
        </p>
        <p
          className={cn(
            bodyClasses[bodySize],
            "font-bold text-[var(--section-emphasis)]",
          )}
        >
          {parseEmphasis(bodyEmphasis, emphasis, "paragraph")}
        </p>
      </div>
    );
  }

  return (
    <p className={paragraphClassName}>
      {parseEmphasis(body, emphasis, "paragraph")}
    </p>
  );
}

function EyebrowRow({
  eyebrow,
  live,
  centered,
  surplusInfo,
}: {
  eyebrow: string;
  live?: boolean;
  centered?: boolean;
  surplusInfo?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", centered && "justify-center")}>
      {live && <LiveIndicatorDot />}
      {surplusInfo ? (
        <SurplusEyebrow label={eyebrow} />
      ) : (
        <p className={cn(eyebrowClassName, "text-[var(--section-text,#003619)]")}>{eyebrow}</p>
      )}
    </div>
  );
}

export function TextSection({
  eyebrow,
  eyebrowLive,
  eyebrowSurplusInfo,
  metric,
  metricNumericValue,
  metricLiveTickOffset,
  onMetricRevealComplete,
  heading,
  headingSize = "h1",
  body,
  bodyEmphasis,
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
  bodyFooter,
  ctaLayout = "responsive",
  ctaSize = "lg",
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
      className={cn(
        "flex w-full min-w-0 gap-2",
        ctaLayout === "row"
          ? "flex-row flex-nowrap items-stretch"
          : "flex-col gap-3 sm:flex-row sm:flex-wrap lg:gap-4",
        isCentered && "items-stretch sm:items-center sm:justify-center",
      )}
    >
      {primaryCta && (
        <Button
          variant="primary"
          colorScheme={scheme}
          size={ctaSize}
          href={primaryCtaHref}
          className={cn(
            ctaLayout === "row" && "min-w-0 flex-1 whitespace-nowrap",
            isCentered && ctaLayout !== "row" && "w-full sm:w-auto",
          )}
        >
          {primaryCta}
        </Button>
      )}
      {secondaryCta && (
        <Button
          variant="secondary"
          colorScheme={scheme}
          size={ctaSize}
          href={secondaryCtaHref}
          className={cn(
            ctaLayout === "row" && "min-w-0 flex-1 whitespace-nowrap",
            isCentered && ctaLayout !== "row" && "w-full sm:w-auto",
          )}
        >
          {secondaryCta}
        </Button>
      )}
    </div>
  );

  if (layout === "horizontal") {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {eyebrow && (
          <EyebrowRow
            eyebrow={eyebrow}
            live={eyebrowLive}
            centered={isCentered}
            surplusInfo={eyebrowSurplusInfo}
          />
        )}
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-8">
          {(metric || headingEl) && (
            <div className={cn("flex w-full flex-col lg:flex-1", metric ? "gap-4 lg:gap-5" : "gap-2")}>
              {metric && (
                <MetricNumber
                  value={metric}
                  numericValue={metricNumericValue}
                  liveTickOffset={metricLiveTickOffset}
                  onRevealComplete={onMetricRevealComplete}
                />
              )}
              {headingEl}
            </div>
          )}
          <div className="flex w-full flex-col gap-4 lg:flex-1">
            {body &&
              renderBodyCopy({ body, bodyEmphasis, bodySize, metric, emphasis })}
            {bodyFooter}
            {ctaRow}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col",
        metric ? "gap-6 lg:gap-10" : "gap-4 lg:gap-8",
        isCentered && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col",
          metric ? "gap-4 lg:gap-6" : "gap-3 lg:gap-4",
          isCentered && "items-center",
        )}
      >
        {eyebrow && (
          <EyebrowRow
            eyebrow={eyebrow}
            live={eyebrowLive}
            centered={isCentered}
            surplusInfo={eyebrowSurplusInfo}
          />
        )}
        {metric && (
          <div className="max-sm:w-full max-sm:min-w-0">
            <MetricNumber
              value={metric}
              numericValue={metricNumericValue}
              liveTickOffset={metricLiveTickOffset}
              onRevealComplete={onMetricRevealComplete}
            />
          </div>
        )}
        {headingEl && (
          <div className="w-full min-w-0 max-w-full">{headingEl}</div>
        )}
        {body &&
          renderBodyCopy({ body, bodyEmphasis, bodySize, metric, emphasis })}
        {bodyFooter}
      </div>
      {ctaRow}
    </div>
  );
}

export default TextSection;
