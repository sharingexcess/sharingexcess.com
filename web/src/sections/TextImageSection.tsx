import { TextSection } from "@/components/ui/TextSection";
import { RoundImageCircle } from "@/components/ui/RoundImageCircle";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/motion";
import type { ImagePosition, ImageStyle, SectionContentProps } from "@/lib/types";
import type { ComponentProps, ReactNode } from "react";
import { useRef } from "react";
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
  /** Only applies to `layout="horizontal"` */
  imagePosition?: ImagePosition;
  /** Only applies to `layout="horizontal"` */
  imageStyle?: ImageStyle;
  /** Used with "three-image-caption" and "three-image-stat" layouts */
  images?: ThreeImageItem[];
}

function RoundImageLayout({
  imageSrc,
  imageAlt,
  imagePosition,
  textSection,
}: {
  imageSrc: string;
  imageAlt: string;
  imagePosition: ImagePosition;
  textSection: ReactNode;
}) {
  const onLeft = imagePosition === "left";
  const viewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(viewRef, { once: true, margin: "-10%" });

  return (
    <div ref={viewRef}>
      <div className="flex flex-col gap-8 lg:hidden">
        <RoundImageCircle
          src={imageSrc}
          alt={imageAlt}
          imagePosition={imagePosition}
          variant="contained"
          inView={inView}
        />
        {textSection}
      </div>
      <div className="relative hidden min-h-[563px] lg:block">
        <div className={cn("relative z-10 max-w-[47.6%]", onLeft && "ml-auto")}>
          <div className="flex min-h-[563px] flex-col justify-center">{textSection}</div>
        </div>
        <RoundImageCircle
          src={imageSrc}
          alt={imageAlt}
          imagePosition={imagePosition}
          variant="bleed"
          inView={inView}
        />
      </div>
    </div>
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
  bodySize = "xl",
  eyebrow,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  imageSrc,
  imageAlt = "",
  imagePosition = "right",
  imageStyle = "square",
  images = [],
  className,
}: TextImageSectionProps) {
  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
  const isRound = imageStyle === "round";
  const imageRadius = isCard
    ? SECTION_CARD_IMAGE_RADIUS_CLASS
    : "rounded-[var(--radius-md)]";

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

  // Square — fixed aspect-ratio container; card layout uses radius.md, default uses radius.xl at lg+
  const squareSlot = (
    <div
      className={cn(
        "aspect-square w-full overflow-hidden",
        imageRadius,
        !isCard && "lg:rounded-[var(--radius-xl)]",
      )}
    >
      <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
    </div>
  );

  // Round variant — Figma 1215:2580: 1630px circle bleeds off section edges.
  // Circle is section-absolute (not inside the grid column) so the arc stays circular.
  if (isRound) {
    const roundBody = (
      <RoundImageLayout
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        imagePosition={imagePosition}
        textSection={sharedTextSection}
      />
    );

    if (isCard) {
      const resolvedColor = coerceSectionCardColor(theme, cardColor);
      const interiorTheme = getSectionCardInteriorTheme(resolvedColor, theme);
      return (
        <SectionShell theme="light" className={className}>
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

    return <SectionShell theme={theme} className={className}>{roundBody}</SectionShell>;
  }

  if (layout === "full-image") {
    return (
      <section
        data-theme="dark"
        style={{ "--section-emphasis": "var(--color-neutral-000)" } as React.CSSProperties}
        className={cn("relative min-h-screen overflow-hidden", className)}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 size-full object-cover"
        />
        {/* row flex + items-end: child sticks to the bottom of the vh frame */}
        <div className="flex min-h-screen items-end">
          {/* gradient is inset-0 relative to THIS wrapper — only darkens the text strip, not the full photo */}
          <div className="relative w-full px-6 py-10 lg:p-24">
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
      </section>
    );
  }

  const fullWidthImage = (
    <div className={cn("w-full overflow-hidden", imageRadius)}>
      <img src={imageSrc} alt={imageAlt} className="aspect-video w-full object-cover" />
    </div>
  );

  if (layout === "stack-left") {
    return (
      <SectionShell theme={isCard ? "light" : theme} className={className}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={fullWidthImage}
        />
      </SectionShell>
    );
  }

  if (layout === "stack-centered") {
    return (
      <SectionShell theme={isCard ? "light" : theme} className={className}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          centered
          textSlotClassName="w-full max-w-3xl"
          textSlot={makeTextSection({ align: "center" })}
          contentSlot={fullWidthImage}
        />
      </SectionShell>
    );
  }

  if (layout === "three-image-caption") {
    return (
      <SectionShell theme={isCard ? "light" : theme} className={className}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => (
                <div key={i} className="flex flex-col gap-3 lg:gap-5">
                  <div className={cn("relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4] lg:aspect-auto lg:h-[432px]", imageRadius)}>
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                  {(img.title || img.body) && (
                    <div className="flex flex-col gap-1">
                      {img.title && (
                        <p className="text-[clamp(20px,5vw,28px)] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--section-text)]">
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
      <SectionShell theme={isCard ? "light" : theme} className={className}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <SectionShell theme={isCard ? "light" : theme} className={className}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((img, i) => (
                <div key={i} className="flex flex-col gap-3 lg:gap-5">
                  <div className={cn("relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4] lg:aspect-auto lg:h-[432px]", imageRadius)}>
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                  {(img.title || img.body) && (
                    <div className="flex flex-col gap-1">
                      {img.title && (
                        <p className="text-[clamp(20px,5vw,28px)] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--section-text)]">
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
      <SectionShell theme={isCard ? "light" : theme} className={className}>
        <SectionLayout
          layout="vertical"
          isCard={isCard}
          cardColor={cardColor}
          sectionTheme={theme}
          textSlotClassName="w-full"
          textSlot={makeTextSection({ layout: "horizontal" })}
          contentSlot={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

  return (
    <SectionShell theme={isCard ? "light" : theme} className={className}>
      <SectionLayout
        layout="horizontal"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        reverse={imagePosition === "left"}
        textSlot={textSlot}
        contentSlot={squareSlot}
      />
    </SectionShell>
  );
}

export default TextImageSection;
