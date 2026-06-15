import { cn } from "@/lib/cn";
import type { SectionTheme } from "@/lib/types";
import type { CSSProperties } from "react";
import { SectionShell } from "./SectionShell";

export interface LogoItem {
  src: string;
  alt: string;
}

export interface LogosBannerSectionProps {
  theme?: SectionTheme;
  /** Centered eyebrow-style heading above the logo row */
  title: string;
  logos: LogoItem[];
  /** Monochrome partner lockups — matches surplus.sharingexcess.com */
  grayscale?: boolean;
  /** Full loop duration in seconds */
  duration?: number;
  className?: string;
  id?: string;
}

function LogoMarquee({
  logos,
  grayscale,
  duration,
  className,
}: {
  logos: LogoItem[];
  grayscale: boolean;
  duration: number;
  className?: string;
}) {
  const loop = [...logos, ...logos];

  return (
    <>
      <div
        className={cn(
          "hidden flex-wrap items-center justify-center gap-x-14 gap-y-8 motion-reduce:flex",
          grayscale && "grayscale",
          className,
        )}
        aria-hidden
      >
        {logos.map((logo, index) => (
          <img
            key={`static-${logo.alt}-${index}`}
            src={logo.src}
            alt={logo.alt}
            className="h-[54px] w-auto max-w-[256px] shrink-0 object-contain"
          />
        ))}
      </div>

      <div
        className={cn("overflow-hidden motion-reduce:hidden", className)}
        aria-label="Partner logos"
      >
        <div
          className={cn(
            "logos-marquee-track flex w-max items-center gap-14 py-2",
            grayscale && "grayscale",
          )}
          style={{ "--logos-marquee-duration": `${duration}s` } as CSSProperties}
        >
          {loop.map((logo, index) => (
            <img
              key={`marquee-${logo.alt}-${index}`}
              src={logo.src}
              alt={logo.alt}
              className="h-[54px] w-auto max-w-[256px] shrink-0 object-contain"
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function LogosBannerSection({
  theme = "light",
  title,
  logos,
  grayscale = true,
  duration = 50,
  className,
  id,
}: LogosBannerSectionProps) {
  return (
    <SectionShell
      theme={theme}
      className={cn("overflow-hidden py-16 lg:py-16", className)}
      id={id}
    >
      <div className="flex flex-col items-center gap-12">
        <p className="text-center font-display text-[32px] font-bold leading-[1.1] text-[var(--section-text)]">
          {title}
        </p>

        <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
          <LogoMarquee logos={logos} grayscale={grayscale} duration={duration} />
        </div>
      </div>
    </SectionShell>
  );
}

export default LogosBannerSection;
