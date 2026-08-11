import { TextSection } from "@/components/ui/TextSection";
import { captionClassName } from "@/lib/typography";
import { DeferredInteractiveMap } from "@/components/map/DeferredInteractiveMap";
import type { MapVariant, MapHub, MapMacroRegion } from "@/components/map/types";
import { cn } from "@/lib/cn";
import { resolveLiveTotalLbsTitle, splitLiveTotalLbsTitle } from "@/lib/resolveLiveTotalLbsTitle";
import type { ImagePosition, SectionContentProps } from "@/lib/types";
import { useLiveDonatedWeight } from "@/lib/useLiveDonatedWeight";
import { RoundBleedLayout } from "./RoundBleedLayout";
import { SectionShell } from "./SectionShell";
import { SectionLayout } from "./SectionLayout";
import {
  coerceSectionCardColor,
  getSectionCardClassName,
  getSectionCardDataAttributes,
  getSectionCardInteriorTheme,
  sectionMediaRadiusClass,
  SECTION_CARD_SHELL_CLASS,
  sectionCardContentIsDark,
} from "./sectionCardConfig";

export type MapLayout = "horizontal" | "stack-centered";
export type MapContainerShape = "rounded" | "circle";

export interface MapSectionProps extends Omit<SectionContentProps, "imageSrc" | "imageAlt"> {
  /** Vertical stack with centered text (like TextImage stack-centered) or side-by-side */
  layout?: MapLayout;
  /** Which side the map appears on at lg+ — mirrors TextImage imagePosition */
  mapPosition?: ImagePosition;
  /** Map frame — rounded square (default) or circle with bleed layout like Round Image */
  mapContainerShape?: MapContainerShape;
  /** How the embedded map behaves */
  mapVariant?: MapVariant;
  /** Optional caption below the map (archive site shows distribution stats here) */
  mapCaption?: string;
  /** Hub-markers — defaults to Philadelphia, Hunts Point, Chicago, Detroit */
  hubs?: MapHub[];
  /** Region-highlights — defaults to macro US regions with state outlines */
  regions?: MapMacroRegion[];
  /**
   * Add clearance at the bottom so the rising arch on the next section does
   * not overlap this section's content.
   */
  archBottom?: boolean;
  /** Info popover beside the eyebrow — Surplus product overview */
  surplusInfo?: boolean;
}

export function MapSection({
  theme = "light",
  isCard = false,
  cardColor = "surface",
  title,
  headingSize = "h1",
  body,
  bodySize = "lg",
  eyebrow,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  layout = "horizontal",
  mapPosition = "right",
  mapContainerShape = "rounded",
  mapVariant = "impact-clusters",
  mapCaption,
  hubs,
  regions,
  className,
  id,
  flushTop = false,
  flushBottom = false,
  transparentBg = false,
  archBottom = false,
  surplusInfo = false,
}: MapSectionProps) {
  const donatedWeightLbs = useLiveDonatedWeight();
  const liveTitleSplit = splitLiveTotalLbsTitle(title, donatedWeightLbs);
  const resolvedTitle = liveTitleSplit
    ? liveTitleSplit.heading
    : resolveLiveTotalLbsTitle(title, donatedWeightLbs);
  const metric = liveTitleSplit?.metric;
  const metricNumericValue = liveTitleSplit ? donatedWeightLbs : undefined;
  const metricLiveTickOffset = liveTitleSplit ? 5 : undefined;
  const shellProps = { flushTop, flushBottom, transparentBg, id, archBottom };
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
  const isCircle = mapContainerShape === "circle";
  const mapRadius = sectionMediaRadiusClass(isCard);

  const textSection = (
    <TextSection
      eyebrow={eyebrow}
      eyebrowLive={Boolean(liveTitleSplit)}
      eyebrowSurplusInfo={surplusInfo}
      metric={metric}
      metricNumericValue={metricNumericValue}
      metricLiveTickOffset={metricLiveTickOffset}
      heading={resolvedTitle}
      headingSize={headingSize}
      body={body}
      bodySize={bodySize}
      primaryCta={primaryCta}
      primaryCtaHref={primaryCtaHref}
      secondaryCta={secondaryCta}
      secondaryCtaHref={secondaryCtaHref}
      buttonScheme={isDark ? "dark" : "light"}
      emphasis={!isCard}
      isCard={isCard}
    />
  );

  const mapProps = {
    variant: mapVariant,
    hubs,
    regions,
    showLoadingLogo: mapVariant === "impact-clusters",
  } as const;

  const mapFrameInner = (className: string) => (
    <DeferredInteractiveMap className={className} {...mapProps} />
  );

  const mapMedia = mapFrameInner("size-full");

  const fullWidthMap = (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div
        className={cn(
          "relative mx-auto aspect-square w-full max-w-md overflow-hidden sm:max-w-none sm:aspect-video",
          mapRadius,
        )}
      >
        {mapFrameInner("absolute inset-0")}
      </div>
      {mapCaption && (
        <p className={cn("text-center text-[var(--section-text)]", captionClassName)}>
          {mapCaption}
        </p>
      )}
    </div>
  );

  if (layout === "stack-centered") {
    return (
      <SectionShell theme={theme} className={className} {...shellProps}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          centered
          textSlotClassName="w-full min-w-0 max-w-3xl"
          textSlot={
            <TextSection
              eyebrow={eyebrow}
              eyebrowLive={Boolean(liveTitleSplit)}
              eyebrowSurplusInfo={surplusInfo}
              metric={metric}
              metricNumericValue={metricNumericValue}
              metricLiveTickOffset={metricLiveTickOffset}
              heading={resolvedTitle}
              headingSize={headingSize}
              body={body}
              bodySize={bodySize}
              primaryCta={primaryCta}
              primaryCtaHref={primaryCtaHref}
              secondaryCta={secondaryCta}
              secondaryCtaHref={secondaryCtaHref}
              buttonScheme={isDark ? "dark" : "light"}
              emphasis={!isCard}
              isCard={isCard}
              align="center"
            />
          }
          contentSlot={fullWidthMap}
        />
      </SectionShell>
    );
  }

  if (isCircle) {
    const roundBody = (
      <RoundBleedLayout
        position={mapPosition}
        textSection={textSection}
        interactive
        glideMode="bleed"
      >
        {mapMedia}
      </RoundBleedLayout>
    );

    if (isCard) {
      const resolvedColor = coerceSectionCardColor(theme, cardColor);
      const interiorTheme = getSectionCardInteriorTheme(resolvedColor, theme);
      return (
        <SectionShell theme={theme} className={className} roundImageSection>
          <div
            data-section-card
            data-theme={interiorTheme}
            {...getSectionCardDataAttributes(resolvedColor)}
            className={cn(
              "relative",
              SECTION_CARD_SHELL_CLASS,
              getSectionCardClassName(resolvedColor),
            )}
          >
            {roundBody}
          </div>
        </SectionShell>
      );
    }

    return (
      <SectionShell theme={theme} className={className} roundImageSection>
        {roundBody}
      </SectionShell>
    );
  }

  const mapSlot = (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden",
          mapRadius,
        )}
      >
        {mapFrameInner("absolute inset-0")}
      </div>
      {mapCaption && (
        <p className={cn("text-center text-[var(--section-text)]", captionClassName)}>
          {mapCaption}
        </p>
      )}
    </div>
  );

  return (
    <SectionShell theme={theme} className={className} {...shellProps}>
      <SectionLayout
        layout="horizontal"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        reverse={mapPosition === "left"}
        textSlot={<div>{textSection}</div>}
        contentSlot={mapSlot}
      />
    </SectionShell>
  );
}

export default MapSection;
