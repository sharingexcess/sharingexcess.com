import { cn } from "@/lib/cn";
import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";

const FOOTER_MARQUEE_PHRASES = ["Sharing Excess", "Let's Free Food"] as const;
const SEGMENT_REPEATS = 6;

const FOOTER_MARQUEE_MOBILE_TRACKING = "-0.04em";

const phraseClassName =
  "font-sans text-[clamp(3.5rem,12vw,9.5rem)] font-medium leading-none tracking-[-0.06em] text-bright-kelly whitespace-nowrap";

const staticPhraseClassName =
  "inline-block font-sans font-medium leading-none tracking-[-0.04em] text-bright-kelly whitespace-nowrap";

function useFitTextToWidth(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      text.style.fontSize = "16px";
      text.style.letterSpacing = FOOTER_MARQUEE_MOBILE_TRACKING;
      const targetWidth = container.clientWidth;
      const currentWidth = text.scrollWidth;
      if (!targetWidth || !currentWidth) return;
      text.style.fontSize = `${(16 * targetWidth) / currentWidth}px`;
    };

    fit();
    void document.fonts?.ready.then(fit);

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [enabled]);

  return { containerRef, textRef };
}

export interface FooterLogoMarqueeProps {
  duration?: number;
  /** Full-width static wordmark instead of scrolling marquee */
  static?: boolean;
  className?: string;
}

function buildSegmentPhrases() {
  return Array.from(
    { length: SEGMENT_REPEATS },
    (_, index) => FOOTER_MARQUEE_PHRASES[index % FOOTER_MARQUEE_PHRASES.length],
  );
}

export function FooterLogoMarquee({
  duration = 120,
  static: isStatic = false,
  className,
}: FooterLogoMarqueeProps) {
  const { containerRef, textRef } = useFitTextToWidth(isStatic);
  const segmentPhrases = buildSegmentPhrases();
  const trackPhrases = [...segmentPhrases, ...segmentPhrases];
  const ariaLabel = FOOTER_MARQUEE_PHRASES.join(", ");

  const trackStyle = {
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  if (isStatic) {
    return (
      <div ref={containerRef} className={cn("w-full overflow-hidden text-center", className)}>
        <span ref={textRef} className={staticPhraseClassName}>
          Sharing Excess
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "hidden w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 motion-reduce:flex",
          phraseClassName,
        )}
      >
        {FOOTER_MARQUEE_PHRASES.map((phrase) => (
          <span key={phrase}>{phrase}</span>
        ))}
      </div>

      <div
        className={cn(
          "footer-logo-marquee-viewport w-full overflow-hidden motion-reduce:hidden",
          className,
        )}
        aria-label={ariaLabel}
      >
        <div
          className="footer-logo-marquee-track footer-logo-marquee-track--ready flex w-max shrink-0 items-center gap-10 lg:gap-16"
          style={trackStyle}
        >
          {trackPhrases.map((phrase, index) => (
            <span
              key={`footer-phrase-${index}`}
              className={phraseClassName}
              aria-hidden={index === 0 ? undefined : true}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export default FooterLogoMarquee;
