import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";
import type { LogoItem } from "./LogosBannerSection";

const logoImageClassName = (grayscale: boolean) =>
  cn(
    "h-[54px] w-auto max-w-[256px] shrink-0 object-contain transition-[filter] duration-300",
    grayscale && "grayscale hover:grayscale-0",
  );

/** Repeat logos within one segment so wide viewports stay filled. */
export function buildMarqueeSegment(logos: LogoItem[]): LogoItem[] {
  const repeats = Math.max(1, Math.ceil(12 / logos.length));
  return Array.from({ length: repeats }, () => logos).flat();
}

export interface LogoMarqueeProps {
  logos: LogoItem[];
  grayscale: boolean;
  duration: number;
  className?: string;
}

export function LogoMarquee({ logos, grayscale, duration, className }: LogoMarqueeProps) {
  const segmentLogos = buildMarqueeSegment(logos);
  const segmentRepeats = segmentLogos.length / logos.length;
  const loopDuration = duration * segmentRepeats;

  const trackStyle = {
    "--marquee-duration": `${loopDuration}s`,
  } as CSSProperties;

  return (
    <>
      <div
        className={cn(
          "hidden flex-wrap items-center justify-center gap-x-14 gap-y-8 motion-reduce:flex",
          className,
        )}
        aria-hidden
      >
        {segmentLogos.map((logo, index) => (
          <img
            key={`static-${logo.alt}-${index}`}
            src={logo.src}
            alt={logo.alt}
            className={logoImageClassName(grayscale)}
          />
        ))}
      </div>

      <div
        className={cn("logos-marquee-viewport w-full overflow-hidden motion-reduce:hidden", className)}
        aria-label="Partner logos"
      >
        <div
          className="logos-marquee-track flex w-max shrink-0 items-center gap-14 py-2"
          style={trackStyle}
        >
          {[...segmentLogos, ...segmentLogos].map((logo, index) => (
            <img
              key={`marquee-${logo.alt}-${index}`}
              src={logo.src}
              alt={logo.alt}
              loading="eager"
              decoding="async"
              aria-hidden={index >= segmentLogos.length ? true : undefined}
              className={logoImageClassName(grayscale)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default LogoMarquee;
