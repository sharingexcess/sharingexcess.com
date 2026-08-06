import {
  ScrollBlurWords,
  tokenizeScrollBlurWords,
  useScrollRevealProgress,
} from "@/components/ui/ScrollBlurWords";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/motion";
import { scrollProgressInTrack } from "@/lib/useScrollDrivenIndex";
import { bodyXlClassName, sectionH2ClassName } from "@/lib/typography";
import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react";

export interface FullImageScrollTextSectionProps {
  heading: string;
  body: string;
  imageSrc: string;
  imageAlt?: string;
  /** Scroll track height — longer tracks slow the word reveal */
  scrollHeightVh?: number;
  className?: string;
  id?: string;
}

/** Share of section scroll used for rounded frame → fullscreen expand */
const FRAME_EXPAND_END = 0.22;
/** Text blur begins early, while the frame is still settling */
const BLUR_START = 0.08;
/** Same 62% scroll span as the original 0.38 → 1.0 reveal — only shifted earlier */
const BLUR_END = BLUR_START + 0.62;
/** Bottom corners begin rounding after text reveal finishes */
const FRAME_EXIT_START = BLUR_END + 0.02;

const SCROLL_OVERLAY =
  "linear-gradient(to top, rgba(27,27,21,0.72) 0%, rgba(27,27,21,0.52) 40%, rgba(27,27,21,0.38) 100%)";

function useFullImageScrollCssVar(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduceMotion) return;

    let raf = 0;

    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = sectionRef.current;
        if (!el) return;
        el.style.setProperty("--section-scroll", String(scrollProgressInTrack(el)));
      });
    };

    update();

    if (lenis) {
      lenis.on("scroll", update);
      lenis.on("virtual-scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    document.addEventListener("astro:after-swap", update);

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
        lenis.off("virtual-scroll", update);
      } else {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      }
      document.removeEventListener("astro:after-swap", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, lenis, reduceMotion, sectionRef]);
}

/** Full-bleed image with centered copy that unblurs word-by-word on scroll */
export function FullImageScrollTextSection({
  heading,
  body,
  imageSrc,
  imageAlt = "",
  scrollHeightVh = 280,
  className,
  id,
}: FullImageScrollTextSectionProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const scrollFx = !reduceMotion;
  const headingWords = useMemo(() => tokenizeScrollBlurWords(heading), [heading]);
  const bodyWords = useMemo(() => tokenizeScrollBlurWords(body), [body]);
  const totalWords = headingWords.length + bodyWords.length;
  const { progress } = useScrollRevealProgress(scrollRef, BLUR_START, BLUR_END);

  useFullImageScrollCssVar(scrollRef, scrollFx);

  return (
    <section
      ref={scrollRef}
      id={id}
      data-theme="dark"
      style={
        {
          "--section-emphasis": "var(--color-neutral-000)",
          "--section-frame-end": FRAME_EXPAND_END,
          "--section-exit-start": FRAME_EXIT_START,
          minHeight: `${scrollHeightVh}vh`,
        } as CSSProperties
      }
      className={cn(
        "full-image-scroll-text relative -mt-[12vh] z-[11] overflow-visible",
        scrollFx && "full-image-scroll-text--scroll-fx",
        className,
      )}
    >
      <div className="sticky top-0 h-screen overflow-x-clip overflow-y-visible">
        <div
          className={cn(
            "full-image-scroll-text__frame absolute overflow-hidden",
            scrollFx && "full-image-scroll-text__frame--scroll-fx",
            !scrollFx && "inset-0 rounded-none",
          )}
        >
          <div className="full-image-scroll-text__bg-wrap absolute inset-0">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 size-full object-cover"
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ backgroundImage: SCROLL_OVERLAY }}
          />

          <div className="relative z-10 flex h-full items-center justify-center px-6 py-16 sm:px-8 lg:px-24">
            <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center lg:gap-8">
              <ScrollBlurWords
                text={heading}
                startIndex={0}
                totalWords={totalWords}
                as="h2"
                progress={progress}
                reduceMotion={reduceMotion}
                className={cn(sectionH2ClassName, "text-white")}
              />
              <ScrollBlurWords
                text={body}
                startIndex={headingWords.length}
                totalWords={totalWords}
                as="p"
                progress={progress}
                reduceMotion={reduceMotion}
                className={cn(bodyXlClassName, "text-white/90")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FullImageScrollTextSection;
