import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import type { SectionContentProps } from "@/lib/types";
import { mapCaptionClassName } from "@/lib/typography";

export interface GcalSectionProps extends Pick<
  SectionContentProps,
  | "theme"
  | "eyebrow"
  | "title"
  | "headingSize"
  | "body"
  | "bodySize"
  | "className"
  | "id"
> {
  align?: "left" | "center";
  /** Italic footnote below the calendar — matches Impact Map caption styling */
  note?: string;
  /** Google Calendar embed URL */
  embedUrl: string;
  /** Accessible title for the calendar iframe */
  embedTitle?: string;
  embedHeight?: number;
}

export function GcalSection({
  theme = "light",
  eyebrow,
  title,
  headingSize = "h2",
  body,
  note,
  bodySize = "lg",
  align = "center",
  embedUrl,
  embedTitle = "Sharing Excess pop-up food distribution calendar",
  embedHeight = 600,
  className,
  id,
}: GcalSectionProps) {
  const isCentered = align === "center";

  return (
    <section
      id={id}
      data-section=""
      data-theme={theme}
      className={cn(
        "bg-[var(--section-bg)] px-4 pb-12 pt-12 text-[var(--section-text)] lg:px-8 lg:pb-[var(--spacing-xxl)] lg:pt-[var(--spacing-xxl)]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 lg:gap-10">
        <TextSection
          eyebrow={eyebrow}
          heading={title}
          headingSize={headingSize}
          body={body}
          bodySize={bodySize}
          buttonScheme="light"
          layout="vertical"
          align={align}
          emphasis
          className={cn(isCentered && "mx-auto max-w-3xl")}
        />

        <div className="w-full overflow-hidden rounded-[var(--radius-sm)] lg:rounded-[var(--radius-md)]">
          <iframe
            src={embedUrl}
            className="block w-full border-0"
            height={embedHeight}
            frameBorder={0}
            scrolling="no"
            title={embedTitle}
          />
        </div>

        {note && (
          <p
            className={cn(
              "text-center text-[var(--section-text)]",
              mapCaptionClassName,
            )}
          >
            {note}
          </p>
        )}
      </div>
    </section>
  );
}

export default GcalSection;
