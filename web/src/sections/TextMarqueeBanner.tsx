import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

const DEFAULT_TEXT = "LET'S FREE FOOD";
const SEGMENT_REPEATS = 8;

const itemClassName =
  "font-display text-base font-extrabold uppercase tracking-[0.04em] sm:text-lg";

const dotClassName = "h-1.5 w-1.5 shrink-0 rounded-full bg-current";

export interface TextMarqueeBannerProps {
  text?: string;
  duration?: number;
  className?: string;
}

export function TextMarqueeBanner({
  text = DEFAULT_TEXT,
  duration = 30,
  className,
}: TextMarqueeBannerProps) {
  const segment = Array.from({ length: SEGMENT_REPEATS }, (_, index) => index);
  const trackItems = [...segment, ...segment];

  const trackStyle = {
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "relative z-10 w-full overflow-hidden bg-banana py-3.5 text-kale sm:py-4",
        className,
      )}
    >
      <div
        className={cn(
          "hidden items-center justify-center px-4 motion-reduce:flex",
          itemClassName,
        )}
      >
        {text}
      </div>

      <div
        className="text-marquee-viewport w-full overflow-hidden motion-reduce:hidden"
        aria-hidden
      >
        <div
          className={cn(
            "text-marquee-track text-marquee-track--ready flex w-max shrink-0 items-center gap-8 px-4",
            itemClassName,
          )}
          style={trackStyle}
        >
          {trackItems.flatMap((index) => [
            <span key={`text-${index}`} className="shrink-0">
              {text}
            </span>,
            <span key={`dot-${index}`} className={dotClassName} aria-hidden />,
          ])}
        </div>
      </div>
    </div>
  );
}

export default TextMarqueeBanner;
