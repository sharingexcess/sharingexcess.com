import { TextSection } from "@/components/ui/TextSection";
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
  SECTION_CARD_IMAGE_RADIUS_CLASS,
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
}: MapSectionProps) {
  const donatedWeightLbs = useLiveDonatedWeight();
  const liveTitleSplit = splitLiveTotalLbsTitle(title, donatedWeightLbs);
  const resolvedTitle = liveTitleSplit
    ? liveTitleSplit.heading
    : resolveLiveTotalLbsTitle(title, donatedWeightLbs);
  const metric = liveTitleSplit?.metric;
  const shellProps = { flushTop, flushBottom, transparentBg, id };
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
  const isCircle = mapContainerShape === "circle";
  const mapRadius = isCard
    ? SECTION_CARD_IMAGE_RADIUS_CLASS
    : "rounded-[var(--radius-md)]";

  const textSection = (
    <TextSection
      eyebrow={eyebrow}
      metric={metric}
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

  const mapMedia = <DeferredInteractiveMap className="size-full" {...mapProps} />;

  const fullWidthMap = (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden",
          mapRadius,
          !isCard && "lg:rounded-[var(--radius-xl)]",
        )}
      >
        <DeferredInteractiveMap className="absolute inset-0" {...mapProps} />
      </div>
      {mapCaption && (
        <p className="text-center text-xs italic opacity-64 text-[var(--section-text)]">
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
          textSlotClassName="w-full max-w-3xl"
          textSlot={
            <TextSection
              eyebrow={eyebrow}
              metric={metric}
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
          !isCard && "lg:rounded-[var(--radius-xl)]",
        )}
      >
        <DeferredInteractiveMap className="absolute inset-0" {...mapProps} />
      </div>
      {mapCaption && (
        <p className="text-center text-xs italic opacity-64 text-[var(--section-text)]">
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
