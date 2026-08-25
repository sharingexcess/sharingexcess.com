import { TextSection } from "@/components/ui/TextSection";
import { useParallaxScrollStyle } from "@/components/ui/ParallaxBackground";
import { useScrollInteractionsEnabled } from "@/components/providers/AppProviders";
import { DeferredInteractiveMap } from "@/components/map/DeferredInteractiveMap";
import type { InteractiveMapProps, MapVariant, MapHub, MapMacroRegion } from "@/components/map/types";
import { mapCaptionClassName } from "@/lib/typography";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useScroll, useTransform } from "@/lib/motion";
import { resolveLiveTotalLbsTitle, splitLiveTotalLbsTitle } from "@/lib/resolveLiveTotalLbsTitle";
import type { ImagePosition, SectionContentProps } from "@/lib/types";
import { useLiveDonatedWeight } from "@/lib/useLiveDonatedWeight";
import { useRef, type ReactNode } from "react";
import { useMapStageScrollSnap, MAP_STAGE_LINGER_SVH } from "@/lib/useMapStageScrollSnap";
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

const MAP_REVEAL_CONTENT_CLASS = "mx-auto w-full max-w-[1320px] px-4 lg:px-8";
const MAP_PARALLAX_TRAVEL = 12;
const MAP_INTRO_PARALLAX_Y = 28;

interface MapScrollExpandSectionProps {
  theme: MapSectionProps["theme"];
  id?: string;
  className?: string;
  intro: ReactNode;
  mapCaption?: string;
  mapProps: InteractiveMapProps;
}

function MapScrollExpandSection({
  theme,
  id,
  className,
  intro,
  mapCaption,
  mapProps,
}: MapScrollExpandSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scrollInteractions = useScrollInteractionsEnabled();
  const parallaxEnabled = scrollInteractions && !reduceMotion;
  const stickyEnabled = parallaxEnabled;

  useMapStageScrollSnap(pinRef, stageRef, stickyEnabled);

  const { style: mapParallaxStyle } = useParallaxScrollStyle(stageRef, {
    travel: MAP_PARALLAX_TRAVEL,
    offset: ["start end", "end start"],
    smooth: true,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start center"],
  });
  const introY = useTransform(
    scrollYProgress,
    [0, 1],
    parallaxEnabled ? [MAP_INTRO_PARALLAX_Y, 0] : [0, 0],
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section=""
      data-theme={theme}
      className={cn("impact-map-reveal relative z-0 bg-transparent", className)}
    >
      <motion.div
        style={{ y: introY }}
        className="will-change-transform pt-12 pb-10 lg:pt-[var(--spacing-xxl)] lg:pb-16"
      >
        <div className={MAP_REVEAL_CONTENT_CLASS}>
          <div className="mx-auto w-full min-w-0 max-w-3xl">{intro}</div>
        </div>
      </motion.div>

      <div
        ref={pinRef}
        data-map-stage-pin=""
        className="relative left-1/2 w-screen max-w-none -translate-x-1/2"
        style={
          stickyEnabled
            ? ({ height: `calc(100svh + ${MAP_STAGE_LINGER_SVH}svh)` } as const)
            : undefined
        }
      >
        <div
          ref={stageRef}
          className={cn(
            "h-[100svh] min-h-[28rem] w-full overflow-hidden bg-[var(--section-surface)]",
            stickyEnabled && "sticky top-0",
          )}
        >
          <motion.div
            style={parallaxEnabled ? mapParallaxStyle : undefined}
            className={cn(
              "absolute left-0 w-full",
              !parallaxEnabled && "inset-0 size-full",
              parallaxEnabled && "h-full",
            )}
          >
            <DeferredInteractiveMap className="size-full" {...mapProps} />
          </motion.div>
        </div>
      </div>

      {mapCaption && (
        <p
          className={cn(
            "pb-12 pt-4 text-center text-[var(--section-text)] lg:pb-[var(--spacing-xxl)]",
            mapCaptionClassName,
          )}
        >
          {mapCaption}
        </p>
      )}
    </section>
  );
}

export type MapLayout = "horizontal" | "stack-centered" | "scroll-expand";
export type MapContainerShape = "rounded" | "circle";

export interface MapSectionProps extends Omit<SectionContentProps, "imageSrc" | "imageAlt"> {
  /** Full-bleed impact map with intro copy above — home page layout */
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
      metricEquivalentLbs={metricNumericValue}
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
        <p className={cn("text-center text-[var(--section-text)]", mapCaptionClassName)}>
          {mapCaption}
        </p>
      )}
    </div>
  );

  const centeredTextSection = (
    <TextSection
      eyebrow={eyebrow}
      eyebrowLive={Boolean(liveTitleSplit)}
      eyebrowSurplusInfo={surplusInfo}
      metric={metric}
      metricNumericValue={metricNumericValue}
      metricLiveTickOffset={metricLiveTickOffset}
      metricEquivalentLbs={metricNumericValue}
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
  );

  if (layout === "scroll-expand") {
    return (
      <MapScrollExpandSection
        theme={theme}
        id={id}
        className={className}
        intro={centeredTextSection}
        mapCaption={mapCaption}
        mapProps={{ ...mapProps, viewportFit: "fill" }}
      />
    );
  }

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
          textSlot={centeredTextSection}
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
        <p className={cn("text-center text-[var(--section-text)]", mapCaptionClassName)}>
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
