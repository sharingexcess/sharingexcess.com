import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

const ENGLISH = "LET'S FREE FOOD";

/** Translations of the tagline — 10 most spoken US languages plus Japanese. */
export const MARQUEE_TRANSLATIONS = [
  "LIBEREMOS LA COMIDA", // Spanish
  "解放食物", // Mandarin Chinese
  "PALAYAAN NATIN ANG PAGKAIN", // Tagalog
  "GIẢI PHÓNG THỰC PHẨM", // Vietnamese
  "لنحرر الطعام", // Arabic
  "LIBÉRONS LA NOURRITURE", // French
  "음식을 해방하자", // Korean
  "ОСВОБОДИМ ЕДУ", // Russian
  "LASST UNS ESSEN BEFREIEN", // German
  "ANN LIBERE MANJE A", // Haitian Creole
  "食べ物を解放しよう", // Japanese
] as const;

/** English first, then every 4th phrase thereafter. */
export function buildMarqueeSequence(translations: readonly string[]): string[] {
  const sequence: string[] = [];

  for (let index = 0; index < translations.length; index += 3) {
    sequence.push(ENGLISH);
    for (let offset = 0; offset < 3 && index + offset < translations.length; offset++) {
      sequence.push(translations[index + offset]);
    }
  }

  return sequence;
}

/** Repeat one full phrase cycle so wide viewports stay filled. */
function buildMarqueeSegment(phrases: readonly string[]): string[] {
  const repeats = Math.max(1, Math.ceil(12 / phrases.length));
  return Array.from({ length: repeats }, () => phrases).flat();
}

const itemClassName =
  "font-display text-base font-extrabold uppercase tracking-[0.04em] sm:text-lg";

const dotClassName = "h-1.5 w-1.5 shrink-0 rounded-full bg-current";

export interface TextMarqueeBannerProps {
  translations?: readonly string[];
  duration?: number;
  className?: string;
}

export function TextMarqueeBanner({
  translations = MARQUEE_TRANSLATIONS,
  duration = 30,
  className,
}: TextMarqueeBannerProps) {
  const sequence = buildMarqueeSequence(translations);
  const segmentPhrases = buildMarqueeSegment(sequence);
  const trackPhrases = [...segmentPhrases, ...segmentPhrases];
  const loopDuration = duration * (segmentPhrases.length / 8);

  const trackStyle = {
    "--marquee-duration": `${loopDuration}s`,
  } as CSSProperties;

  const renderPhraseItems = (items: string[], keyPrefix: string) =>
    items.flatMap((phrase, index) => [
      <span key={`${keyPrefix}-text-${index}`} className="shrink-0">
        {phrase}
      </span>,
      <span key={`${keyPrefix}-dot-${index}`} className={dotClassName} aria-hidden />,
    ]);

  const staticPhrases = [ENGLISH, ...translations];

  return (
    <div
      className={cn(
        "relative z-10 w-full overflow-hidden bg-banana py-3.5 text-kale sm:py-4",
        className,
      )}
    >
      <div
        className={cn(
          "hidden flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 motion-reduce:flex",
          itemClassName,
        )}
      >
        {staticPhrases.map((phrase) => (
          <span key={phrase} className="inline-flex items-center gap-8">
            {phrase}
            <span className={dotClassName} aria-hidden />
          </span>
        ))}
      </div>

      <div
        className="text-marquee-viewport w-full overflow-hidden motion-reduce:hidden"
        aria-label={ENGLISH}
      >
        <div
          className={cn(
            "text-marquee-track text-marquee-track--ready flex w-max shrink-0 items-center gap-8 px-4",
            itemClassName,
          )}
          style={trackStyle}
        >
          {renderPhraseItems(trackPhrases, "marquee")}
        </div>
      </div>
    </div>
  );
}

export default TextMarqueeBanner;
