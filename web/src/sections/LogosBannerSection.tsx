import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { parseEmphasis } from "@/lib/parseEmphasis";
import {
  eyebrowClassName,
  bodyLgClassName,
  bodyMdClassName,
  bodyXlClassName,
  sectionH1ClassName,
  sectionH2ClassName,
} from "@/lib/typography";
import type { SectionContentProps } from "@/lib/types";
import { LogoMarquee } from "./LogoMarquee";
import { SectionShell } from "./SectionShell";

export interface LogoItem {
  src: string;
  alt: string;
  /** Intrinsic pixel width — reserves layout space before the image decodes. */
  width?: number;
  /** Intrinsic pixel height — reserves layout space before the image decodes. */
  height?: number;
}

const bodyClasses = {
  xl: bodyXlClassName,
  lg: bodyLgClassName,
  md: bodyMdClassName,
} as const;

export interface LogosBannerSectionProps
  extends Omit<
    SectionContentProps,
    | "imageSrc"
    | "imageAlt"
    | "isCard"
    | "cardColor"
    | "secondaryCta"
    | "secondaryCtaHref"
  > {
  /** Optional page heading above the logo marquee */
  title?: string;
  logos: LogoItem[];
  /** Monochrome partner lockups — matches surplus.sharingexcess.com */
  grayscale?: boolean;
  /** Full loop duration in seconds */
  duration?: number;
  id?: string;
  /** Arch-shaped dark-to-light transition at the top of this section */
  archTop?: boolean;
}

export function LogosBannerSection({
  theme = "light",
  eyebrow,
  title,
  headingSize = "h2",
  body,
  bodySize = "lg",
  primaryCta,
  primaryCtaHref,
  logos,
  grayscale = true,
  duration = 40,
  className,
  id,
  archTop,
  transparentBg,
}: LogosBannerSectionProps) {
  const buttonScheme = theme === "dark" ? "dark" : "light";
  const headingClassName = headingSize === "h1" ? sectionH1ClassName : sectionH2ClassName;
  const hasIntroText = Boolean(eyebrow?.trim() || title?.trim() || body?.trim());

  return (
    <SectionShell
      theme={theme}
      archTop={archTop}
      transparentBg={transparentBg}
      className={cn("overflow-visible py-12 lg:py-16", className)}
      id={id}
    >
      <div className="flex flex-col gap-8 lg:gap-12">
        {hasIntroText && (
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center lg:gap-6">
            {eyebrow?.trim() && (
              <p className={cn(eyebrowClassName, "text-[var(--section-text)]")}>{eyebrow}</p>
            )}
            {title?.trim() && (
              <h2 className={cn(headingClassName, "text-[var(--section-text)]")}>
                {parseEmphasis(title)}
              </h2>
            )}
            {body?.trim() && (
              <p className={cn(bodyClasses[bodySize], "text-[var(--section-text)]")}>
                {body}
              </p>
            )}
          </div>
        )}

        <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen max-w-none">
          <LogoMarquee logos={logos} grayscale={grayscale} duration={duration} />
        </div>

        {primaryCta && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              colorScheme={buttonScheme}
              href={primaryCtaHref}
              size="md"
            >
              {primaryCta}
            </Button>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export default LogosBannerSection;
