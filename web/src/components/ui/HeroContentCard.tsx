import { ArrowButton } from "@/components/ui/ArrowButton";
import { Sticker } from "@/components/ui/Sticker";
import { TextSection } from "@/components/ui/TextSection";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { heroContentCardHeadingClassName } from "@/lib/typography";
import { motion, statCardTiltSpring, useReducedMotion } from "@/lib/motion";
import { useCallback, useRef, type CSSProperties } from "react";

export interface HeroContentCardProps {
  title: string;
  body?: string;
  bodySize?: "xl" | "lg" | "md";
  primaryCta?: string;
  primaryCtaHref?: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  className?: string;
}

/** Space above the card so the overlapping sticker is included in parallax layout height */
const heroCardStickerBleedClass = "sm:pt-[clamp(40px,5vw,64px)]";
const heroCardStickerPositionClass =
  "absolute right-5 z-30 translate-x-1/2 -translate-y-[40%] sm:top-[clamp(52px,6vw,76px)]";

/** White overlay card for home hero — matches donate form shell styling. */
export function HeroContentCard({
  title,
  body,
  bodySize = "lg",
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  className,
}: HeroContentCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const bodyLines = body?.split("\n") ?? [];
  const mainBody = bodyLines[0]?.trim();
  const emphasisBody = bodyLines.slice(1).join("\n").trim() || undefined;

  const scrollToNextSection = useCallback(() => {
    const hero = rootRef.current?.closest<HTMLElement>("[data-home-hero]");
    const nextSection = hero?.nextElementSibling as HTMLElement | null;
    const targetY = nextSection
      ? nextSection.getBoundingClientRect().top + window.scrollY
      : hero
        ? hero.getBoundingClientRect().bottom + window.scrollY
        : window.scrollY + window.innerHeight;

    if (lenis) {
      lenis.scrollTo(targetY);
      return;
    }

    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, [lenis]);

  return (
    <div ref={rootRef} className={cn("relative mb-6", heroCardStickerBleedClass)}>
      <div
        data-form-card="white"
        style={
          {
            "--section-text": "var(--color-kale)",
            "--section-emphasis": "var(--color-se-green)",
          } as CSSProperties
        }
        className={cn(
          "@container flex w-full min-w-0 flex-col gap-6 overflow-visible rounded-[var(--radius-lg)] bg-white p-4 text-kale sm:p-6 lg:rounded-[var(--radius-xl)] lg:p-10",
          className,
        )}
      >
        <TextSection
          heading={title}
          headingClassName={heroContentCardHeadingClassName}
          headingTextWrap="balance"
          body={mainBody}
          bodyEmphasis={emphasisBody}
          bodySize={bodySize}
          primaryCta={primaryCta}
          primaryCtaHref={primaryCtaHref}
          secondaryCta={secondaryCta}
          secondaryCtaHref={secondaryCtaHref}
          buttonScheme="light"
          layout="vertical"
          ctaLayout="row"
          ctaSize="sm"
          emphasis
        />
      </div>

      <motion.div
        className={cn(
          heroCardStickerPositionClass,
          "pointer-events-auto hidden aspect-[250/159] w-[clamp(95px,11.88vw,158px)] cursor-default sm:block",
        )}
        initial={false}
        animate={{ rotate: 10 }}
        whileHover={reduceMotion ? undefined : { rotate: -2 }}
        transition={statCardTiltSpring}
        aria-hidden
      >
        <Sticker name="lemon" fillContainer alt="" />
      </motion.div>

      <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2 translate-y-[35%]">
        <div className="scroll-hint-bounce pointer-events-auto">
          <ArrowButton
            type="button"
            size="sm"
            variant="primary"
            colorScheme="light"
            hoverEffect="scale"
            direction="next"
            aria-label="Scroll to next section"
            className="rotate-90 shadow-[0_4px_20px_rgba(0,0,0,0.24)]"
            onClick={scrollToNextSection}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroContentCard;
