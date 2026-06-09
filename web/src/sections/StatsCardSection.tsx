import { Heading } from "@/components/ui/Heading";
import { Stat } from "@/components/ui/Stat";
import type { SectionTheme } from "@/lib/types";
import { SectionShell } from "./SectionShell";

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsCardSectionProps {
  theme?: SectionTheme;
  title?: string;
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsCardSection({
  theme = "dark",
  title,
  stats,
  columns = 3,
  className,
}: StatsCardSectionProps) {
  const gridClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-3";

  return (
    <SectionShell theme={theme} className={className}>
      {title && <Heading level={2}>{title}</Heading>}
      <div className={`mt-8 grid gap-6 ${gridClass}`}>
        {stats.map((stat) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </SectionShell>
  );
}

export default StatsCardSection;
