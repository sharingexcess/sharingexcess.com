import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

const FOOTER_LOGO_SRC = "/images/footer-logo.svg";
const FOOTER_LOGO_ALT = "Sharing Excess";
const SEGMENT_REPEATS = 3;

const logoClassName =
  "h-[120px] w-auto shrink-0 object-contain lg:h-[180px] xl:h-[222px]";

export interface FooterLogoMarqueeProps {
  duration?: number;
  /** Full-width static logo instead of scrolling marquee */
  static?: boolean;
  className?: string;
}

export function FooterLogoMarquee({
  duration = 120,
  static: isStatic = false,
  className,
}: FooterLogoMarqueeProps) {
  if (isStatic) {
    return (
      <div className={cn("w-full", className)}>
        <img
          src={FOOTER_LOGO_SRC}
          alt={FOOTER_LOGO_ALT}
          className="block h-auto w-full object-contain"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  const segment = Array.from({ length: SEGMENT_REPEATS }, (_, index) => index);
  const trackItems = [...segment, ...segment];

  const trackStyle = {
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <>
      <div className="hidden w-full items-center justify-center motion-reduce:flex">
        <img
          src={FOOTER_LOGO_SRC}
          alt={FOOTER_LOGO_ALT}
          className="h-[120px] w-auto max-w-full object-contain lg:h-[180px] xl:h-[222px]"
        />
      </div>

      <div
        className={cn(
          "footer-logo-marquee-viewport w-full overflow-hidden motion-reduce:hidden",
          className,
        )}
        aria-label={FOOTER_LOGO_ALT}
      >
        <div
          className="footer-logo-marquee-track footer-logo-marquee-track--ready flex w-max shrink-0 items-center gap-10 lg:gap-16"
          style={trackStyle}
        >
          {trackItems.map((index) => (
            <img
              key={`footer-logo-${index}`}
              src={FOOTER_LOGO_SRC}
              alt={index === 0 ? FOOTER_LOGO_ALT : ""}
              aria-hidden={index === 0 ? undefined : true}
              className={logoClassName}
              loading="eager"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default FooterLogoMarquee;
