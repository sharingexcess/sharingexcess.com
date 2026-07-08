import { TextSection } from "@/components/ui/TextSection";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import type { MapVariant, MapHub, MapMacroRegion } from "@/components/map/types";
import { cn } from "@/lib/cn";
import type { ImagePosition, SectionContentProps } from "@/lib/types";
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

export type MapContainerShape = "rounded" | "circle";

export interface MapSectionProps extends Omit<SectionContentProps, "imageSrc" | "imageAlt"> {
  body: string;
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
  mapPosition = "right",
  mapContainerShape = "rounded",
  mapVariant = "impact-clusters",
  mapCaption,
  hubs,
  regions,
  className,
}: MapSectionProps) {
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
  const isCircle = mapContainerShape === "circle";
  const mapRadius = isCard
    ? SECTION_CARD_IMAGE_RADIUS_CLASS
    : "rounded-[var(--radius-md)]";

  const textSection = (
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
      emphasis={!isCard}
      isCard={isCard}
    />
  );

  const mapMedia = (
    <InteractiveMap
      className="size-full"
      variant={mapVariant}
      hubs={hubs}
      regions={regions}
      showLoadingLogo={mapVariant === "impact-clusters"}
    />
  );

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
        <SectionShell theme="light" className={className} roundImageSection>
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
        <InteractiveMap
          className="absolute inset-0"
          variant={mapVariant}
          hubs={hubs}
          regions={regions}
          showLoadingLogo={mapVariant === "impact-clusters"}
        />
      </div>
      {mapCaption && (
        <p className="text-center text-xs italic opacity-64 text-[var(--section-text)]">
          {mapCaption}
        </p>
      )}
    </div>
  );

  return (
    <SectionShell theme={isCard ? "light" : theme} className={className}>
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
