import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import type { ImagePosition, ImageStyle, SectionTheme } from "@/lib/types";
import { SectionShell } from "./SectionShell";

export interface TextImageSectionProps {
  theme?: SectionTheme;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: ImagePosition;
  imageStyle?: ImageStyle;
  className?: string;
}

export function TextImageSection({
  theme = "light",
  title,
  body,
  imageSrc,
  imageAlt,
  imagePosition = "right",
  imageStyle = "square",
  className,
}: TextImageSectionProps) {
  return (
    <SectionShell theme={theme} className={className}>
      <div
        className={cn(
          "grid items-center gap-10 md:grid-cols-2",
          imagePosition === "left" && "md:[&>*:first-child]:order-2",
        )}
      >
        <div>
          <Heading level={2}>{title}</Heading>
          <Text className="mt-4">{body}</Text>
        </div>
        <img
          src={imageSrc}
          alt={imageAlt}
          className={cn(
            "h-auto w-full object-cover",
            imageStyle === "round" ? "rounded-full" : "rounded-xl",
          )}
        />
      </div>
    </SectionShell>
  );
}

export default TextImageSection;
