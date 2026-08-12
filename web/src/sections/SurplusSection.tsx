import { ScrollAutoplayVideo } from "@/components/ui/ScrollAutoplayVideo";
import { SurplusDotGridBackground } from "@/components/ui/SurplusDotGridBackground";
import { TextSection } from "@/components/ui/TextSection";
import { cn } from "@/lib/cn";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "@/lib/motion";
import {
  SURPLUS_LANDING_URL,
  SURPLUS_LANDING_VIDEO_SRC,
} from "@/components/ui/SurplusInfoPopover";
import type { ImagePosition, SectionContentProps } from "@/lib/types";
import { useRef } from "react";
import { SectionShell } from "./SectionShell";

export interface SurplusSectionProps extends Omit<SectionContentProps, "imageSrc" | "imageAlt"> {
  body: string;
  /** Which side the video appears on at lg+ */
  videoPosition?: ImagePosition;
  /** Reserve space below for an arch transition on the next section */
  archBottom?: boolean;
}

const CARD_REVEAL_OFFSET: [string, string] = ["start end", "end end"];
const CARD_REVEAL_Y = 96;
const CARD_REVEAL_SCALE = 0.88;
const VIDEO_MIN_HEIGHT_CLASS = "min-h-[21.6rem]";

export function SurplusSection({
  theme = "dark",
  title,
  headingSize = "h2",
  body,
  bodySize = "lg",
  eyebrow,
  primaryCta = "Learn more",
  primaryCtaHref = SURPLUS_LANDING_URL,
  secondaryCta,
  secondaryCtaHref,
  videoPosition = "left",
  className,
  id,
  archBottom,
  transparentBg,
  flushTop,
  flushBottom,
}: SurplusSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: CARD_REVEAL_OFFSET,
  });
  const y = useTransform(
    scrollYProgress,
    [0, 0.75, 1],
    reduceMotion ? [0, 0, 0] : [CARD_REVEAL_Y, 8, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.45, 0.82, 1],
    reduceMotion ? [1, 1, 1, 1] : [CARD_REVEAL_SCALE, 0.91, 0.97, 1],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    reduceMotion ? [1, 1, 1] : [0.72, 0.95, 1],
  );

  return (
    <SectionShell
      theme={theme}
      archBottom={archBottom}
      transparentBg={transparentBg}
      className={className}
      id={id}
      flushTop={flushTop}
      flushBottom={flushBottom}
    >
      <motion.div
        ref={cardRef}
        style={{ y, scale, opacity }}
        className="origin-bottom will-change-transform"
      >
        <div
          data-theme="light"
          data-form-card="white"
          className={cn(
            "relative w-full min-w-0 overflow-hidden rounded-[var(--radius-lg)] p-4 text-kale sm:p-6 lg:rounded-[var(--radius-xl)] lg:p-10",
            reduceMotion ? "surplus-dot-grid" : "bg-white",
          )}
        >
          {!reduceMotion && <SurplusDotGridBackground />}
          <div
            className={cn(
              "relative z-[1] grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12",
              videoPosition === "right" && "lg:[&>*:first-child]:order-2",
            )}
          >
            <div
              className={cn(
                "h-full overflow-hidden rounded-[var(--radius-lg)] bg-neutral-100 lg:min-h-0",
                VIDEO_MIN_HEIGHT_CLASS,
              )}
            >
              <ScrollAutoplayVideo
                videoSrc={SURPLUS_LANDING_VIDEO_SRC}
                className={cn("aspect-auto h-full w-full lg:min-h-0", VIDEO_MIN_HEIGHT_CLASS)}
              />
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <TextSection
                eyebrow={eyebrow}
                heading={title}
                headingSize={headingSize}
                body={body}
                bodySize={bodySize}
                primaryCta={primaryCta}
                primaryCtaHref={primaryCtaHref}
                secondaryCta={secondaryCta}
                secondaryCtaHref={secondaryCtaHref}
                buttonScheme="light"
                emphasis
                animateHeading
                headingRevealTrigger="inView"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}

export default SurplusSection;
