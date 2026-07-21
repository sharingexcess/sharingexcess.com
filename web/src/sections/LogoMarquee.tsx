import { cn } from "@/lib/cn";
import { useEffect, useState, type CSSProperties } from "react";
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

function preloadLogos(logos: LogoItem[]): Promise<Record<string, { width: number; height: number }>> {
  const uniqueSrcs = [...new Set(logos.map((logo) => logo.src))];

  return Promise.all(
    uniqueSrcs.map(
      (src) =>
        new Promise<{ src: string; width: number; height: number }>((resolve) => {
          const logo = logos.find((item) => item.src === src);
          const image = new Image();

          image.onload = () => {
            resolve({
              src,
              width: image.naturalWidth || logo?.width || 256,
              height: image.naturalHeight || logo?.height || 54,
            });
          };

          image.onerror = () => {
            resolve({
              src,
              width: logo?.width || 256,
              height: logo?.height || 54,
            });
          };

          image.src = src;
        }),
    ),
  ).then((results) => Object.fromEntries(results.map((result) => [result.src, result])));
}

interface MarqueeLogoProps {
  logo: LogoItem;
  grayscale: boolean;
  dimensions?: { width: number; height: number };
  "aria-hidden"?: boolean;
}

function MarqueeLogo({ logo, grayscale, dimensions, "aria-hidden": ariaHidden }: MarqueeLogoProps) {
  const width = logo.width ?? dimensions?.width;
  const height = logo.height ?? dimensions?.height;

  return (
    <img
      src={logo.src}
      alt={logo.alt}
      width={width}
      height={height}
      loading="eager"
      decoding="async"
      aria-hidden={ariaHidden}
      className={logoImageClassName(grayscale)}
    />
  );
}

export interface LogoMarqueeProps {
  logos: LogoItem[];
  grayscale: boolean;
  duration: number;
  className?: string;
}

export function LogoMarquee({ logos, grayscale, duration, className }: LogoMarqueeProps) {
  const [dimensionsBySrc, setDimensionsBySrc] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [ready, setReady] = useState(false);

  const segmentLogos = buildMarqueeSegment(logos);
  const segmentRepeats = segmentLogos.length / logos.length;
  const loopDuration = duration * segmentRepeats;

  const trackStyle = {
    "--marquee-duration": `${loopDuration}s`,
  } as CSSProperties;

  useEffect(() => {
    let cancelled = false;

    setReady(false);
    preloadLogos(logos).then((dimensions) => {
      if (cancelled) return;
      setDimensionsBySrc(dimensions);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [logos]);

  const renderLogo = (logo: LogoItem, key: string, ariaHidden?: boolean) => (
    <MarqueeLogo
      key={key}
      logo={logo}
      grayscale={grayscale}
      dimensions={dimensionsBySrc[logo.src]}
      aria-hidden={ariaHidden}
    />
  );

  return (
    <>
      <div
        className={cn(
          "hidden flex-wrap items-center justify-center gap-x-14 gap-y-8 motion-reduce:flex",
          className,
        )}
        aria-hidden
      >
        {segmentLogos.map((logo, index) =>
          renderLogo(logo, `static-${logo.alt}-${index}`),
        )}
      </div>

      <div
        className={cn("logos-marquee-viewport w-full overflow-hidden motion-reduce:hidden", className)}
        aria-label="Partner logos"
      >
        <div
          className={cn(
            "logos-marquee-track flex w-max shrink-0 items-center gap-14 py-2",
            ready && "logos-marquee-track--ready",
          )}
          style={trackStyle}
        >
          {[...segmentLogos, ...segmentLogos].map((logo, index) =>
            renderLogo(
              logo,
              `marquee-${logo.alt}-${index}`,
              index >= segmentLogos.length ? true : undefined,
            ),
          )}
        </div>
      </div>
    </>
  );
}

export default LogoMarquee;
