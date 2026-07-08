import { TextSection } from "@/components/ui/TextSection";
import {
  StatCard,
  type StatCardColorVariant,
  type StatCardImageTilt,
} from "@/components/ui/StatCard";
import type { SectionCardColor, SectionTheme } from "@/lib/types";
import { SectionShell } from "./SectionShell";
import { SectionLayout } from "./SectionLayout";
import { sectionCardContentIsDark } from "./sectionCardConfig";

export interface StatItem {
  value: string;
  label: string;
  type?: "color" | "image";
  /** Color cards only */
  variant?: StatCardColorVariant;
  /** Image cards only — Figma TiltLeft / TiltRight */
  tilt?: StatCardImageTilt;
  imageSrc?: string;
}

export interface StatsCardSectionProps {
  theme?: SectionTheme;
  eyebrow?: string;
  title?: string;
  headingSize?: "h1" | "h2";
  body?: string;
  bodySize?: "xl" | "lg" | "md";
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  /** Wraps the section content in the rounded dark-green card treatment */
  isCard?: boolean;
  /** Card fill when `isCard` is true */
  cardColor?: SectionCardColor;
  className?: string;
}

export function StatsCardSection({
  theme = "dark",
  eyebrow,
  title,
  headingSize = "h1",
  body,
  bodySize = "xl",
  stats,
  columns = 3,
  isCard = false,
  cardColor = "surface",
  className,
}: StatsCardSectionProps) {
  const gridClass =
    columns === 2 || columns === 4
      ? "sm:grid-cols-2"
      : "sm:grid-cols-3";

  const isDark = sectionCardContentIsDark(isCard, cardColor, theme);

  return (
    <SectionShell theme={isCard ? "light" : theme} className={className}>
      <SectionLayout
        layout="vertical"
        isCard={isCard}
        cardColor={cardColor}
        sectionTheme={theme}
        textSlot={
          title || eyebrow ? (
            <TextSection
              eyebrow={eyebrow}
              heading={title ?? ""}
              headingSize={headingSize}
              body={body}
              bodySize={bodySize}
              buttonScheme={isDark ? "dark" : "light"}
              emphasis={!isCard}
              isCard={isCard}
            />
          ) : undefined
        }
        contentSlot={
          <div className={`grid gap-12 sm:gap-6 ${gridClass}`}>
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                {...(stat.type === "image" && stat.imageSrc
                  ? {
                      type: "image" as const,
                      imageSrc: stat.imageSrc,
                      tilt: stat.tilt,
                    }
                  : {
                      type: stat.type ?? "color",
                      variant: stat.variant,
                    })}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        }
      />
    </SectionShell>
  );
}

export default StatsCardSection;
