import { ParallaxBackground, ParallaxCover } from "@/components/ui/ParallaxBackground";
import {
  Sticker,
  STICKER_OVERLAP_CARD_TOP_LEFT_CLASS,
  STICKER_OVERLAP_TOP_CENTER_CLASS,
  STICKER_SIZE_SM_CLASS,
  type StickerName,
} from "@/components/ui/Sticker";
import { TextSection } from "@/components/ui/TextSection";
import { VideoPlaceholder } from "@/components/ui/VideoPlaceholder";
import { cn } from "@/lib/cn";
import type { ImageFit, ImagePosition, ImageStyle, SectionContentProps } from "@/lib/types";
import { isEmbeddableVideo } from "@/lib/toVideoEmbedSrc";
import { useRef, type ComponentProps, type CSSProperties, type ReactNode } from "react";
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

export type TextImageLayout =
  | "horizontal"
  | "stack-left"
  | "stack-centered"
  | "full-image"
  | "three-image-caption"
  | "three-image-stat"
  | "four-image-caption"
  | "four-image-stat";

export interface ThreeImageItem {
  src: string;
  alt: string;
  /** Used with "three-image-caption" */
  title?: string;
  body?: string;
  /** Used with "three-image-stat" */
  stat?: string;
  label?: string;
}

export interface TextImageSectionProps extends Omit<SectionContentProps, "body"> {
  layout?: TextImageLayout;
  body: string;
  /** Reserve space below for an arch transition on the next section */
  archBottom?: boolean;
  /** Rounded top edge for parallax handoff over a pinned hero */
  roundedTop?: boolean;
  /** Only applies to `layout="horizontal"` */
  imagePosition?: ImagePosition;
  /** Only applies to `layout="horizontal"` — square, round, or 16:9 video frame */
  imageStyle?: ImageStyle;
  /** Only applies to `layout="horizontal"` with `imageStyle="square"` or `imageStyle="video"` */
  imageFit?: ImageFit;
  /** Overlap a brand sticker on the top-left of the image. */
  sticker?: boolean;
  /** Which sticker to show when `sticker` is true. Defaults to `free-food`. */
  stickerName?: StickerName;
  /** Used with "three-image-caption" and "three-image-stat" layouts */
  images?: ThreeImageItem[];
}

/** Wider gap when multi-card grids stack in a single column on mobile */
const STACKED_CARD_GRID_GAP = "gap-12 sm:gap-6";

function TextImageFullImageLayout({
  className,
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  headingSize,
  body,
  bodySize,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
}: Pick<
  TextImageSectionProps,
  | "className"
  | "imageSrc"
  | "imageAlt"
  | "eyebrow"
  | "title"
  | "headingSize"
  | "body"
  | "bodySize"
  | "primaryCta"
  | "primaryCtaHref"
  | "secondaryCta"
  | "secondaryCtaHref"
>) {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={scrollRef}
      data-theme="dark"
      style={{ "--section-emphasis": "var(--color-neutral-000)" } as CSSProperties}
      className={cn("relative min-h-[112vh]", className)}
    >
      {/* Short sticky tail — enough room for parallax without lingering on exit */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <ParallaxBackground
          scrollRef={scrollRef}
          src={imageSrc!}
          alt={imageAlt}
          travel={32}
          offset={["start end", "end start"]}
          smooth
        />
        {/* row flex + items-end: child sticks to the bottom of the vh frame */}
        <div className="flex h-full items-end">
          {/* gradient is inset-0 relative to THIS wrapper — only darkens the text strip, not the full photo */}
          <div className="relative w-full px-4 py-10 sm:px-6 lg:p-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(27,27,21,0.58)] from-50% to-transparent mix-blend-multiply"
            />
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
              buttonScheme="dark"
              className="relative w-full max-w-full lg:max-w-[60%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TextImageSection({
  theme = "light",
  isCard = false,
  cardColor = "surface",
  layout = "horizontal",
  title,
  headingSize = "h1",
  body,
  bodySize = "lg",
  eyebrow,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  imageSrc,
  imageAlt = "",
  videoSrc,
  imagePosition = "right",
  imageStyle = "square",
  imageFit = "cover",
  sticker = false,
  stickerName = "free-food",
  images = [],
  className,
  id,
  flushTop = false,
  flushBottom = false,
  transparentBg = false,
  archBottom = false,
  roundedTop = false,
}: TextImageSectionProps) {
  const shellProps = { flushTop, flushBottom, transparentBg, archBottom, roundedTop, id };
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
  const isRound = imageStyle === "round";
  const imageRadius = sectionMediaRadiusClass(isCard);

  const makeTextSection = (
    overrides: Partial<ComponentProps<typeof TextSection>> = {},
  ) => (
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
      {...overrides}
    />
  );

  const sharedTextSection = makeTextSection();

  const isPhotoFit = imageFit === "cover";
  const isVideoFrame = imageStyle === "video";

  // Square or 16:9 frame for photos (cover); natural height for diagrams/logos (contain).
  const squareSlot = (
    <div
      className={cn(
        "w-full overflow-hidden",
        isVideoFrame ? "aspect-video" : isPhotoFit ? "aspect-square" : "",
        imageRadius,
      )}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className={cn(
          "w-full",
          isPhotoFit ? "h-full object-cover" : "h-auto object-contain",
        )}
      />
    </div>
  );

  // Round variant — Figma 1215:2580: 1630px circle bleeds off section edges.
  // Circle is section-absolute (not inside the grid column) so the arc stays circular.
  if (isRound) {
    const roundBody = (
      <RoundBleedLayout position={imagePosition} textSection={sharedTextSection}>
        <img src={imageSrc} alt={imageAlt} className="size-full object-cover" />
      </RoundBleedLayout>
    );

    if (isCard) {
      const resolvedColor = coerceSectionCardColor(theme, cardColor);
      const interiorTheme = getSectionCardInteriorTheme(resolvedColor, theme);
      return (
        <SectionShell theme={theme} className={className} roundImageSection {...shellProps}>
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

    return <SectionShell theme={theme} className={className} roundImageSection {...shellProps}>{roundBody}</SectionShell>;
  }

  if (layout === "full-image") {
    return (
      <TextImageFullImageLayout
        className={className}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        eyebrow={eyebrow}
        title={title}
        headingSize={headingSize}
        body={body}
        bodySize={bodySize}
        primaryCta={primaryCta}
        primaryCtaHref={primaryCtaHref}
        secondaryCta={secondaryCta}
        secondaryCtaHref={secondaryCtaHref}
      />
    );
  }

  const parallaxMediaSlot = imageSrc ? (
    <ParallaxCover
      src={imageSrc}
      alt={imageAlt}
      videoSrc={videoSrc}
      className={cn("aspect-video w-full", imageRadius)}
      smooth
    />
  ) : null;

  const useVideoPlaceholder =
    imageStyle === "video" || Boolean(videoSrc?.trim());

  const useEmbeddableVideoPlaceholder = Boolean(
    useVideoPlaceholder && videoSrc?.trim() && isEmbeddableVideo(videoSrc),
  );

  const videoPlaceholderSlot = imageSrc ? (
    <VideoPlaceholder
      posterSrc={imageSrc}
      posterAlt={imageAlt}
      videoSrc={videoSrc}
      className={imageRadius}
    />
  ) : null;

  const stackMediaSlot = useEmbeddableVideoPlaceholder
    ? videoPlaceholderSlot
    : parallaxMediaSlot;

  const wrapWithSticker = (
    slot: ReactNode,
    position: "top-left" | "top-center" = "top-left",
  ) =>
    sticker ? (
      <div className="relative overflow-visible">
        {slot}
        <div
          className={cn(
            position === "top-center"
              ? STICKER_OVERLAP_TOP_CENTER_CLASS
              : STICKER_OVERLAP_CARD_TOP_LEFT_CLASS,
            STICKER_SIZE_SM_CLASS,
          )}
          aria-hidden
        >
          <Sticker name={stickerName} fillContainer alt="" />
        </div>
      </div>
    ) : (
      slot
    );

  if (layout === "stack-left") {
    const contentSlot = wrapWithSticker(stackMediaSlot, "top-center");

    return (
      <SectionShell
        theme={theme}
        className={cn(sticker && !roundedTop && "overflow-visible", className)}
        {...shellProps}
      >
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={contentSlot}
        />
      </SectionShell>
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
          textSlotClassName="w-full max-w-3xl"
          textSlot={makeTextSection({ align: "center" })}
          contentSlot={stackMediaSlot}
        />
      </SectionShell>
    );
  }

  if (layout === "three-image-caption") {
    return (
      <SectionShell theme={theme} className={className} {...shellProps}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", STACKED_CARD_GRID_GAP)}>
              {images.map((img, i) => (
                <div key={i} className="flex flex-col gap-3 lg:gap-5">
                  <div className={cn("relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4] lg:aspect-auto lg:h-[432px]", imageRadius)}>
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                  {(img.title || img.body) && (
                    <div className="flex flex-col gap-1">
                      {img.title && (
                        <p className="text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--section-text)]">
                          {img.title}
                        </p>
                      )}
                      {img.body && (
                        <p className="text-base leading-[1.4] text-[var(--section-text)]">
                          {img.body}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        />
      </SectionShell>
    );
  }

  if (layout === "three-image-stat") {
    return (
      <SectionShell theme={theme} className={className} {...shellProps}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", STACKED_CARD_GRID_GAP)}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative flex aspect-[4/5] flex-col justify-end overflow-hidden p-6 sm:aspect-[3/4] sm:p-8 lg:aspect-auto lg:h-[432px] lg:p-10",
                    imageRadius,
                  )}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[rgba(27,27,21,0.54)] from-50% to-transparent mix-blend-multiply lg:h-[264px]"
                  />
                  {(img.stat || img.label) && (
                    <div className="relative flex flex-col gap-1 sm:gap-2">
                      {img.stat && (
                        <p className="font-display text-[clamp(48px,12vw,128px)] font-bold leading-[0.86] tracking-[-0.04em] text-white">
                          {img.stat}
                        </p>
                      )}
                      {img.label && (
                        <p className="text-[clamp(18px,4vw,32px)] font-medium leading-[1.06] tracking-[-0.04em] text-white">
                          {img.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        />
      </SectionShell>
    );
  }

  if (layout === "four-image-caption") {
    return (
      <SectionShell theme={theme} className={className} {...shellProps}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", STACKED_CARD_GRID_GAP)}>
              {images.map((img, i) => (
                <div key={i} className="flex flex-col gap-3 lg:gap-5">
                  <div className={cn("relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4] lg:aspect-auto lg:h-[432px]", imageRadius)}>
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                  {(img.title || img.body) && (
                    <div className="flex flex-col gap-1">
                      {img.title && (
                        <p className="text-[28px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--section-text)]">
                          {img.title}
                        </p>
                      )}
                      {img.body && (
                        <p className="text-base leading-[1.4] text-[var(--section-text)]">
                          {img.body}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        />
      </SectionShell>
    );
  }

  if (layout === "four-image-stat") {
    return (
      <SectionShell theme={theme} className={className} {...shellProps}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", STACKED_CARD_GRID_GAP)}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative flex aspect-[4/5] flex-col justify-end overflow-hidden p-6 sm:aspect-[3/4] sm:p-8 lg:aspect-auto lg:h-[432px] lg:px-6 lg:py-10",
                    imageRadius,
                  )}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[rgba(27,27,21,0.54)] from-50% to-transparent mix-blend-multiply lg:h-[264px]"
                  />
                  {(img.stat || img.label) && (
                    <div className="relative flex flex-col gap-1 sm:gap-2">
                      {img.stat && (
                        <p className="font-display text-[clamp(40px,10vw,128px)] font-bold leading-[0.86] tracking-[-0.04em] text-white">
                          {img.stat}
                        </p>
                      )}
                      {img.label && (
                        <p className="text-[clamp(16px,3.5vw,32px)] font-medium leading-[1.06] tracking-[-0.04em] text-white">
                          {img.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        />
      </SectionShell>
    );
  }

  const textSlot = <div>{sharedTextSection}</div>;

  const imageSlot = wrapWithSticker(squareSlot);

  return (
    <SectionShell
      theme={theme}
      className={cn(sticker && !roundedTop && "overflow-visible", className)}
      {...shellProps}
    >
      <SectionLayout
        layout="horizontal"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        reverse={imagePosition === "left"}
        textSlot={textSlot}
        contentSlot={sticker ? imageSlot : squareSlot}
      />
    </SectionShell>
  );
}

export default TextImageSection;
