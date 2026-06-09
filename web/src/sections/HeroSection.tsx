import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import type { SectionTheme } from "@/lib/types";
import { SectionShell } from "./SectionShell";

export interface HeroSectionProps {
  theme?: SectionTheme;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function HeroSection({
  theme = "dark",
  title,
  subtitle,
  ctaLabel,
  ctaHref = "#",
  className,
}: HeroSectionProps) {
  return (
    <SectionShell theme={theme} className={className}>
      <Heading level={1}>{title}</Heading>
      {subtitle && (
        <Text className="mt-4 max-w-2xl text-lg opacity-90">{subtitle}</Text>
      )}
      {ctaLabel && (
        <div className="mt-8">
          <Button href={ctaHref} variant="primary">
            {ctaLabel}
          </Button>
        </div>
      )}
    </SectionShell>
  );
}

export default HeroSection;
