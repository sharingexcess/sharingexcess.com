import { TextSection } from "@/components/ui/TextSection";
import { Sticker, STICKER_OVERLAP_CARD_TOP_LEFT_CLASS, STICKER_SIZE_SM_CLASS, type StickerName } from "@/components/ui/Sticker";
import { cn } from "@/lib/cn";
import {
  StatCard,
  type StatCardColorVariant,
  type StatCardImageTilt,
} from "@/components/ui/StatCard";
import type { SectionCardColor, SectionContentProps } from "@/lib/types";
import { SectionShell } from "./SectionShell";
import { SectionLayout } from "./SectionLayout";
import { sectionCardContentIsDark } from "./sectionCardConfig";

export interface StatItem {
  /** Card metric or header — alias: `header` */
  value: string;
  /** Card label or caption — alias: `caption` */
  label: string;
  /** Alias for `value` on text cards */
  header?: string;
  /** Alias for `label` on text cards */
  caption?: string;
  type?: "color" | "image";
  /** Color cards only */
  variant?: StatCardColorVariant;
  /** Image cards only — Figma TiltLeft / TiltRight */
  tilt?: StatCardImageTilt;
  imageSrc?: string;
  href?: string;
}

export interface StatsCardSectionProps extends Omit<
  SectionContentProps,
  "title" | "imageSrc" | "imageAlt" | "videoSrc"
> {
  /** Section heading — alias: `header` */
  title?: string;
  /** Alias for `title` */
  header?: string;
  /** Alias for `body` */
  caption?: string;
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  /** Metric (default) uses display numerals; text uses eyebrow + lg body */
  contentVariant?: "metric" | "text";
  align?: "left" | "center";
  /** Intro text — horizontal puts heading and body side by side (Figma) */
  textLayout?: "vertical" | "horizontal";
  /** Overlap a brand sticker on the top-left of the first stat card */
  sticker?: boolean;
  /** Which sticker to show when `sticker` is true. Defaults to `free-food`. */
  stickerName?: StickerName;
}

export function StatsCardSection({
  theme = "dark",
  eyebrow,
  title,
  header,
  body,
  caption,
  headingSize = "h1",
  bodySize = "xl",
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  stats,
  columns = 3,
  contentVariant = "metric",
  align = "left",
  textLayout = "vertical",
  sticker = false,
  stickerName = "free-food",
  isCard = false,
  cardColor = "surface",
  className,
  id,
  flushTop,
  flushBottom,
  transparentBg,
}: StatsCardSectionProps) {
  const gridClass =
    columns === 2 || columns === 4
      ? "sm:grid-cols-2"
      : "sm:grid-cols-3";

  const sectionTitle = header ?? title;
  const sectionBody = caption ?? body;
  const hasIntroText = Boolean(
    eyebrow?.trim()
    || sectionTitle?.trim()
    || sectionBody?.trim()
    || primaryCta
    || secondaryCta,
  );

  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);
  const isCentered = align === "center";
  const isHorizontalText = textLayout === "horizontal";

  return (
    <SectionShell
      theme={theme}
      className={cn(sticker && "overflow-visible", className)}
      id={id}
      flushTop={flushTop}
      flushBottom={flushBottom}
      transparentBg={transparentBg}
    >
      <SectionLayout
        layout="vertical"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        centered={isCentered}
        textSlotClassName={
          isCentered
            ? isCard
              ? "w-full"
              : "w-full max-w-3xl"
            : isHorizontalText
              ? "w-full"
              : "w-full lg:max-w-[60%]"
        }
        textSlot={
          hasIntroText ? (
            <TextSection
              eyebrow={eyebrow}
              heading={sectionTitle}
              headingSize={headingSize}
              body={sectionBody}
              bodySize={bodySize}
              primaryCta={primaryCta}
              primaryCtaHref={primaryCtaHref}
              secondaryCta={secondaryCta}
              secondaryCtaHref={secondaryCtaHref}
              buttonScheme={isDark ? "dark" : "light"}
              layout={textLayout}
              align={align}
              emphasis={!isCard}
              isCard={isCard}
              className={cn(isCentered && "mx-auto max-w-3xl")}
            />
          ) : undefined
        }
        contentSlot={
          <div className={cn("grid gap-12 sm:gap-6", gridClass)}>
            {stats.map((stat, index) => {
              const cardHeader = stat.header ?? stat.value;
              const cardCaption = stat.caption ?? stat.label;

              const card = (
                <StatCard
                  key={`${cardHeader}-${cardCaption}`}
                  {...(stat.type === "image" && stat.imageSrc
                    ? {
                        type: "image" as const,
                        imageSrc: stat.imageSrc,
                        tilt: stat.tilt,
                        variant: stat.variant,
                      }
                    : {
                        type: stat.type ?? "color",
                        variant: stat.variant,
                      })}
                  value={cardHeader}
                  label={cardCaption}
                  href={stat.href}
                  contentVariant={contentVariant}
                />
              );

              if (index === 0 && sticker) {
                return (
                  <div
                    key={`${cardHeader}-${cardCaption}`}
                    className="relative overflow-visible"
                  >
                    {card}
                    <div
                      className={cn(STICKER_OVERLAP_CARD_TOP_LEFT_CLASS, STICKER_SIZE_SM_CLASS)}
                      aria-hidden
                    >
                      <Sticker name={stickerName} fillContainer alt="" />
                    </div>
                  </div>
                );
              }

              return card;
            })}
          </div>
        }
      />
    </SectionShell>
  );
}

export default StatsCardSection;
