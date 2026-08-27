import {
  ScrollBlurWords,
  tokenizeScrollBlurWords,
  useScrollRevealProgress,
} from "@/components/ui/ScrollBlurWords";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useTransform, type MotionValue } from "@/lib/motion";
import {
  bodyXlClassName,
  sectionH1ClassName,
} from "@/lib/typography";
import { useMemo, useRef, type CSSProperties, type RefObject } from "react";

export interface HomeScrollStatementContentProps {
  header: string;
  caption: string;
  emphasis: string;
  /** Shared scroll track — bridge layout passes the outer section ref */
  scrollTrackRef?: RefObject<HTMLElement | null>;
  /** Bridge handoff — timing segments are track fractions, not standalone section */
  embedded?: boolean;
  /** Shimmer mask target — statement copy block */
  contentMaskRef?: RefObject<HTMLDivElement | null>;
  /** Remap scroll so animation finishes before a trailing hold segment */
  scrollAnimationFraction?: number;
  className?: string;
}

export interface HomeScrollStatementSectionProps extends HomeScrollStatementContentProps {
  /** Scroll track height — longer tracks slow the word reveal */
  scrollHeightVh?: number;
  id?: string;
}

const STANDALONE_HEADER_BLUR_START = 0.06;
const STANDALONE_HEADER_BLUR_END = 0.4;
const STANDALONE_CAPTION_BLUR_START = 0.42;
const STANDALONE_CAPTION_BLUR_END = 0.76;
const STANDALONE_EMPHASIS_BLUR_START = 0.78;
const STANDALONE_EMPHASIS_BLUR_END = 0.96;

export const BRIDGE_HEADER_BLUR_START = 0.4;
export const BRIDGE_HEADER_BLUR_END = 0.68;
const BRIDGE_CAPTION_BLUR_START = 0.56;
const BRIDGE_CAPTION_BLUR_END = 0.84;
const BRIDGE_EMPHASIS_BLUR_START = 0.74;
const BRIDGE_EMPHASIS_BLUR_END = 0.98;

/** Full blur + fade — matches blurWordVariants (opacity 0, blur 12px) */
const SCROLL_REVEAL_MAX_BLUR_PX = 20;
const SCROLL_REVEAL_MIN_OPACITY = 0;

function BlurTextBlock({
  text,
  progress,
  reduceMotion,
  as,
  className,
  revealOpacity,
  maxBlurPx = SCROLL_REVEAL_MAX_BLUR_PX,
  minOpacity = SCROLL_REVEAL_MIN_OPACITY,
  emphasis = false,
  orphanGuard = false,
}: {
  text: string;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  as: "h2" | "p";
  className?: string;
  revealOpacity?: MotionValue<number>;
  maxBlurPx?: number;
  minOpacity?: number;
  emphasis?: boolean;
  orphanGuard?: boolean;
}) {
  const words = useMemo(() => tokenizeScrollBlurWords(text), [text]);

  const copy = (
    <ScrollBlurWords
      text={text}
      startIndex={0}
      totalWords={words.length}
      as={as}
      progress={progress}
      reduceMotion={reduceMotion}
      maxBlurPx={maxBlurPx}
      minOpacity={minOpacity}
      emphasis={emphasis}
      orphanGuard={orphanGuard}
      className={className}
    />
  );

  if (!revealOpacity || reduceMotion) {
    return copy;
  }

  return (
    <motion.div style={{ opacity: revealOpacity }} className="w-full">
      {copy}
    </motion.div>
  );
}

/** Scroll-driven blur statement copy — standalone or embedded in hero bridge */
export function HomeScrollStatementContent({
  header,
  caption,
  emphasis,
  scrollTrackRef,
  embedded = false,
  contentMaskRef,
  scrollAnimationFraction,
  className,
}: HomeScrollStatementContentProps) {
  const internalRef = useRef<HTMLElement>(null);
  const trackRef = scrollTrackRef ?? internalRef;
  const reduceMotion = useReducedMotion();

  const headerBlurStart = embedded ? BRIDGE_HEADER_BLUR_START : STANDALONE_HEADER_BLUR_START;
  const headerBlurEnd = embedded ? BRIDGE_HEADER_BLUR_END : STANDALONE_HEADER_BLUR_END;
  const captionBlurStart = embedded ? BRIDGE_CAPTION_BLUR_START : STANDALONE_CAPTION_BLUR_START;
  const captionBlurEnd = embedded ? BRIDGE_CAPTION_BLUR_END : STANDALONE_CAPTION_BLUR_END;
  const emphasisBlurStart = embedded ? BRIDGE_EMPHASIS_BLUR_START : STANDALONE_EMPHASIS_BLUR_START;
  const emphasisBlurEnd = embedded ? BRIDGE_EMPHASIS_BLUR_END : STANDALONE_EMPHASIS_BLUR_END;

  const { progress: headerProgress } = useScrollRevealProgress(
    trackRef,
    headerBlurStart,
    headerBlurEnd,
    scrollAnimationFraction,
  );
  const { progress: captionProgress } = useScrollRevealProgress(
    trackRef,
    captionBlurStart,
    captionBlurEnd,
    scrollAnimationFraction,
  );
  const { progress: emphasisProgress } = useScrollRevealProgress(
    trackRef,
    emphasisBlurStart,
    emphasisBlurEnd,
    scrollAnimationFraction,
  );

  const captionRevealOpacity = useTransform(headerProgress, (value) =>
    value >= 0.98 ? 1 : Math.max(0, (value - 0.88) / 0.12),
  );
  const emphasisRevealOpacity = useTransform(captionProgress, (value) =>
    value >= 0.98 ? 1 : Math.max(0, (value - 0.88) / 0.12),
  );

  return (
    <div
      ref={embedded ? undefined : internalRef}
      data-theme="light"
      style={{ "--section-emphasis": "var(--color-se-green-base)" } as CSSProperties}
      className={cn(
        embedded
          ? "absolute inset-0 z-[3] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-12"
          : "sticky top-0 flex h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-12",
        className,
      )}
    >
      <div
        ref={contentMaskRef}
        className="flex w-full max-w-[min(960px,96vw)] flex-col items-center gap-6 text-center sm:max-w-[min(960px,92vw)] lg:max-w-[min(960px,90vw)] lg:gap-8"
      >
        <BlurTextBlock
          text={header}
          progress={headerProgress}
          reduceMotion={reduceMotion}
          as="h2"
          emphasis
          orphanGuard
          maxBlurPx={24}
          minOpacity={0}
          className={cn(
            sectionH1ClassName,
            "text-balance text-kale max-lg:text-[clamp(34px,8.25vw,40px)]",
          )}
        />
        <BlurTextBlock
          text={caption}
          progress={captionProgress}
          reduceMotion={reduceMotion}
          as="p"
          orphanGuard
          revealOpacity={captionRevealOpacity}
          className={cn(bodyXlClassName, "text-balance text-kale/85")}
        />
        <BlurTextBlock
          text={emphasis}
          progress={emphasisProgress}
          reduceMotion={reduceMotion}
          as="p"
          orphanGuard
          revealOpacity={emphasisRevealOpacity}
          className={cn(bodyXlClassName, "text-balance font-semibold text-se-green")}
        />
      </div>
    </div>
  );
}

/** White bridge between home hero and next section — scroll-driven word blur resolve */
export function HomeScrollStatementSection({
  header,
  caption,
  emphasis,
  scrollHeightVh = 220,
  className,
  id,
}: HomeScrollStatementSectionProps) {
  const scrollRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={scrollRef}
      id={id}
      data-theme="light"
      style={
        {
          "--section-emphasis": "var(--color-se-green-base)",
          minHeight: `${scrollHeightVh}vh`,
        } as CSSProperties
      }
      className={cn("relative z-10 overflow-visible bg-white", className)}
    >
      <HomeScrollStatementContent
        header={header}
        caption={caption}
        emphasis={emphasis}
        scrollTrackRef={scrollRef}
      />
    </section>
  );
}

export default HomeScrollStatementSection;
