import { TextImageBackground, type TextImageItem } from "@/components/ui/TextImageBackground";
import type { SectionProps } from "@/lib/types";

export type { TextImageItem };

export interface TextImageBackgroundCarouselSectionProps extends SectionProps {
  eyebrow?: string;
  items: TextImageItem[];
  align?: "left" | "center";
  defaultIndex?: number;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
}

export function TextImageBackgroundCarouselSection({
  eyebrow,
  items,
  align = "left",
  defaultIndex = 0,
  autoAdvance,
  autoAdvanceMs,
  className,
  id,
}: TextImageBackgroundCarouselSectionProps) {
  return (
    <TextImageBackground
      id={id}
      className={className}
      eyebrow={eyebrow}
      items={items}
      align={align}
      defaultIndex={defaultIndex}
      autoAdvance={autoAdvance}
      autoAdvanceMs={autoAdvanceMs}
    />
  );
}

export default TextImageBackgroundCarouselSection;
