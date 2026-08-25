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
import { MetricEquivalentsRotator } from "@/components/ui/MetricEquivalentsRotator";
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

/** Matches eyebrowClassName line box — keeps heading position when eyebrow is omitted */
const EYEBROW_SLOT_MIN_HEIGHT_CLASS = "min-h-[calc(1.125rem*1.1)] lg:min-h-[calc(24px*1.1)]";
/** Centered sections — body reads narrower than the headline (matches TextOnlySection) */
const CENTERED_BODY_MAX_WIDTH_CLASS = "mx-auto w-full max-w-3xl";

export interface TextSectionProps {
  eyebrow?: string;
  /** Reserve the eyebrow line box when `eyebrow` is omitted — subpage heroes */
  reserveEyebrowSpace?: boolean;
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
  /** Live total (lbs) for rotating impact equivalents shown below the metric */
  metricEquivalentLbs?: number;
  heading?: string;
  headingSize?: "h1" | "h2";
  body?: string;
  /** Bold emphasis line rendered below body in the same paragraph block */
  bodyEmphasis?: string;
  bodySize?: "xl" | "lg" | "md";
  /** Body size for `bodyEmphasis` when it should differ from `bodySize` */
  bodyEmphasisSize?: "xl" | "lg" | "md";
  primaryCta?: string;
  primaryCtaHref?: string;
  primaryCtaTarget?: React.HTMLAttributeAnchorTarget;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  secondaryCtaTarget?: React.HTMLAttributeAnchorTarget;
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
  /** When the heading reveal starts — default mount; use inView for below-the-fold sections */
  headingRevealTrigger?: "mount" | "inView";
  /** When false, *asterisk* spans render as plain text */
  emphasis?: boolean;
  /** Card layout — secondary CTA keeps rest color on hover */
  isCard?: boolean;
  /** Rendered below body copy — e.g. an inline donation form */
  bodyFooter?: ReactNode;
  /** CTA button row layout — `responsive` stacks on narrow viewports */
  ctaLayout?: "row" | "responsive";
  ctaSize?: ButtonProps["size"];
  /** Replaces default heading typography when set — e.g. container-scaled hero card title */
  headingClassName?: string;
  /** Heading line wrapping — `balance` distributes lines more evenly across the width */
  headingTextWrap?: "pretty" | "balance";
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
  bodyEmphasisSize,
  metric,
  emphasis = true,
  textClassName = "text-[var(--section-text,#003619)]",
}: {
  body: string;
  bodyEmphasis?: string;
  bodySize: "xl" | "lg" | "md";
  bodyEmphasisSize?: "xl" | "lg" | "md";
  metric?: string;
  emphasis?: boolean;
  textClassName?: string;
}) {
  const bodyParagraphs = body.split("\n\n").filter((paragraph) => paragraph.trim());
  const paragraphClassName = cn(bodyClasses[bodySize], textClassName);
  const blockClassName = cn(
    metric ? "mt-0" : "mt-1 lg:mt-2",
    "flex flex-col gap-3 lg:gap-4",
  );

  if (bodyEmphasis) {
    return (
      <div className={blockClassName}>
        {bodyParagraphs.map((paragraph, index) => (
          <p key={index} className={paragraphClassName}>
            {parseEmphasis(paragraph, emphasis, "paragraph")}
          </p>
        ))}
        <p
          className={cn(
            bodyClasses[bodyEmphasisSize ?? bodySize],
            "font-bold text-[var(--section-emphasis)]",
          )}
        >
          {parseEmphasis(bodyEmphasis, emphasis, "paragraph")}
        </p>
      </div>
    );
  }

  if (bodyParagraphs.length > 1) {
    return (
      <div className={blockClassName}>
        {bodyParagraphs.map((paragraph, index) => (
          <p key={index} className={paragraphClassName}>
            {parseEmphasis(paragraph, emphasis, "paragraph")}
          </p>
        ))}
      </div>
    );
  }

  return (
    <p className={cn(metric ? "mt-0" : "mt-1 lg:mt-2", paragraphClassName)}>
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

function EyebrowSlot({
  eyebrow,
  reserveSpace,
  live,
  centered,
  surplusInfo,
}: {
  eyebrow?: string;
  reserveSpace?: boolean;
  live?: boolean;
  centered?: boolean;
  surplusInfo?: boolean;
}) {
  if (!eyebrow && !reserveSpace) return null;

  return (
    <div className={cn(reserveSpace && EYEBROW_SLOT_MIN_HEIGHT_CLASS)}>
      {eyebrow ? (
        <EyebrowRow
          eyebrow={eyebrow}
          live={live}
          centered={centered}
          surplusInfo={surplusInfo}
        />
      ) : null}
    </div>
  );
}

export function TextSection({
  eyebrow,
  reserveEyebrowSpace = false,
  eyebrowLive,
  eyebrowSurplusInfo,
  metric,
  metricNumericValue,
  metricLiveTickOffset,
  onMetricRevealComplete,
  metricEquivalentLbs,
  heading,
  headingSize = "h1",
  body,
  bodyEmphasis,
  bodySize = "xl",
  bodyEmphasisSize,
  primaryCta,
  primaryCtaHref,
  primaryCtaTarget,
  secondaryCta,
  secondaryCtaHref,
  secondaryCtaTarget,
  buttonScheme = "light",
  layout = "vertical",
  align = "left",
  animateHeading = false,
  headingAnimation,
  headingRevealTrigger = "mount",
  emphasis = true,
  isCard = false,
  bodyFooter,
  ctaLayout = "responsive",
  ctaSize = "lg",
  headingClassName: headingClassNameOverride,
  headingTextWrap = "balance",
  className,
}: TextSectionProps) {
  const isCentered = align === "center";
  const metricEquivalent =
    metric && metricEquivalentLbs != null
      ? (
        <MetricEquivalentsRotator
          totalLbs={metricEquivalentLbs}
          className={isCentered ? "text-center" : undefined}
        />
      )
      : null;
  const hasCtas = primaryCta || secondaryCta;
  const headingEquivalentGapClass = "gap-4 lg:gap-5";
  const sectionCtaGapClass = metricEquivalent
    ? "gap-4 lg:gap-6"
    : metric
      ? "gap-6 lg:gap-10"
      : "gap-4 lg:gap-8";

  const scheme = buttonScheme === "dark" ? "dark" : "light";
  const headingClassName =
    headingClassNameOverride ?? resolveHeadingClassName(headingSize, Boolean(metric));
  const resolvedHeadingAnimation =
    headingAnimation ?? (animateHeading ? "words" : undefined);
  const headingTextClassName = cn(
    headingClassName,
    headingTextWrap === "balance" ? "text-balance" : "text-pretty",
    "whitespace-pre-line text-[var(--section-text,#003619)]",
  );

  const headingEl = heading ? (
    resolvedHeadingAnimation === "words" ? (
      <AnimatedHeroHeading
        title={heading}
        as="p"
        emphasis={emphasis}
        trigger={headingRevealTrigger}
        className={cn(
          headingClassName,
          headingTextWrap === "balance" ? "text-balance" : "text-pretty",
          "text-[var(--section-text,#003619)]",
        )}
      />
    ) : resolvedHeadingAnimation === "blur" ? (
      <AnimatedHeroHeading
        title={heading}
        as="p"
        emphasis={emphasis}
        reveal="blur"
        trigger="inView"
        className={cn(
          headingClassName,
          headingTextWrap === "balance" ? "text-balance" : "text-pretty",
          "text-[var(--section-text,#003619)]",
        )}
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
          target={primaryCtaTarget}
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
          target={secondaryCtaTarget}
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
        <EyebrowSlot
          eyebrow={eyebrow}
          reserveSpace={reserveEyebrowSpace}
          live={eyebrowLive}
          centered={isCentered}
          surplusInfo={eyebrowSurplusInfo}
        />
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
              {(headingEl || metricEquivalent) && (
                <div className={cn("flex flex-col", headingEquivalentGapClass)}>
                  {headingEl}
                  {metricEquivalent}
                </div>
              )}
            </div>
          )}
          <div className="flex w-full flex-col gap-4 lg:flex-1">
            {body && (
              <div className={cn(isCentered && CENTERED_BODY_MAX_WIDTH_CLASS)}>
                {renderBodyCopy({ body, bodyEmphasis, bodySize, bodyEmphasisSize, metric, emphasis })}
              </div>
            )}
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
        sectionCtaGapClass,
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
        <EyebrowSlot
          eyebrow={eyebrow}
          reserveSpace={reserveEyebrowSpace}
          live={eyebrowLive}
          centered={isCentered}
          surplusInfo={eyebrowSurplusInfo}
        />
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
        {(headingEl || metricEquivalent) && (
          <div className={cn("flex w-full min-w-0 max-w-full flex-col", headingEquivalentGapClass)}>
            {headingEl}
            {metricEquivalent}
          </div>
        )}
        {body && (
          <div className={cn(isCentered && CENTERED_BODY_MAX_WIDTH_CLASS)}>
            {renderBodyCopy({ body, bodyEmphasis, bodySize, bodyEmphasisSize, metric, emphasis })}
          </div>
        )}
        {bodyFooter}
      </div>
      {ctaRow}
    </div>
  );
}

export default TextSection;
