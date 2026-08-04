import { cn } from "@/lib/cn";
import {
  motion,
  slotMachineDigitDuration,
  slotMachineDigitEase,
  slotMachineDigitStagger,
  slotMachineInViewOptions,
  slotMachineReelCycles,
  slotMachineStartDelay,
  useReducedMotion,
} from "@/lib/motion";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { metricNumberClassName } from "@/lib/typography";
import { useFitText } from "@/lib/useFitText";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";

const MOBILE_FIT_MQ = "(max-width: 639px)";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

type MetricPhase = "idle" | "playing" | "settled";

const digitSlotClassName =
  "relative inline-block h-[1em] w-[0.93ch] overflow-hidden align-top lg:w-[1ch]";

const digitGlyphClassName = "block h-[1em] shrink-0 leading-[1.06] text-center";

function buildReel(targetDigit: number): string[] {
  const reel: string[] = [];
  const totalSteps = slotMachineReelCycles * 10 + targetDigit;

  for (let step = 0; step <= totalSteps; step += 1) {
    reel.push(DIGITS[step % 10]);
  }

  return reel;
}

function SlotDigit({
  digit,
  index,
  phase,
}: {
  digit: string;
  index: number;
  phase: MetricPhase;
}) {
  const targetDigit = Number.parseInt(digit, 10);
  const reel = useMemo(() => buildReel(targetDigit), [targetDigit]);
  const finalOffsetEm = reel.length - 1;
  const targetY = phase === "idle" ? 0 : `-${finalOffsetEm}em`;

  return (
    <span className={digitSlotClassName} aria-hidden>
      <motion.span
        className="flex flex-col will-change-transform"
        initial={false}
        animate={{ y: targetY }}
        transition={
          phase === "playing"
            ? {
                duration: slotMachineDigitDuration,
                delay: slotMachineStartDelay + index * slotMachineDigitStagger,
                ease: slotMachineDigitEase,
              }
            : { duration: 0 }
        }
      >
        {reel.map((char, reelIndex) => (
          <span key={reelIndex} className={digitGlyphClassName}>
            {char}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function MetricSeparator({ char }: { char: string }) {
  return <span className="inline-block">{char}</span>;
}

function MetricDigits({
  value,
  phase,
}: {
  value: string;
  phase: MetricPhase;
}) {
  const chars = value.split("");
  let digitIndex = 0;

  return (
    <>
      {chars.map((char, charIndex) => {
        if (!/\d/.test(char)) {
          return <MetricSeparator key={charIndex} char={char} />;
        }

        const index = digitIndex;
        digitIndex += 1;

        return (
          <SlotDigit
            key={charIndex}
            digit={char}
            index={index}
            phase={phase}
          />
        );
      })}
    </>
  );
}

function MetricDisplay({
  value,
  sizerValue,
  className,
  textRef,
  fontStyle,
  phase,
}: {
  value: string;
  /** All digits replaced with "0" so the sizer matches the 1ch slot widths exactly */
  sizerValue: string;
  className: string;
  textRef: RefObject<HTMLElement | null>;
  fontStyle?: CSSProperties;
  phase: MetricPhase;
}) {
  const visible = phase !== "idle";

  return (
    <>
      {/* Invisible sizer — digits replaced with "0" so natural "0" glyph width (= 1ch) over-estimates
          the actual 0.93ch slots, making fit-text conservatively smaller than needed. */}
      <span
        ref={textRef}
        aria-hidden
        style={fontStyle}
        className={cn(className, "pointer-events-none invisible absolute whitespace-nowrap")}
      >
        {sizerValue}
      </span>
      <p
        style={fontStyle}
        className={className}
        aria-label={value.replace(/,/g, "")}
      >
        <motion.span
          className="inline-flex items-baseline"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.45, ease: slotMachineDigitEase, delay: visible ? 0.06 : 0 }}
        >
          <MetricDigits value={value} phase={phase} />
        </motion.span>
      </p>
    </>
  );
}

export interface SlotMachineNumberProps {
  value: string;
  className?: string;
}

/** Formatted numeral with a left-to-right slot-machine reel reveal */
export function SlotMachineNumber({ value, className }: SlotMachineNumberProps) {
  const reduceMotion = useReducedMotion();
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(inViewRef, slotMachineInViewOptions);
  const [animationValue, setAnimationValue] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);
  const displayValue = settled || reduceMotion ? value : (animationValue ?? value);
  // Replace every digit with "0" so the invisible sizer matches the 1ch fixed-width slots
  const sizerValue = displayValue.replace(/\d/g, "0");
  const [mobileFit, setMobileFit] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_FIT_MQ);
    const update = () => setMobileFit(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { containerRef, textRef, fontSizePx } = useFitText(sizerValue, {
    minSizePx: 32,
    enabled: mobileFit,
  });
  const fontStyle = fontSizePx != null ? { fontSize: `${fontSizePx}px` } : undefined;

  const digitCount = useMemo(() => (value.match(/\d/g) ?? []).length, [value]);
  const revealDurationMs =
    (slotMachineStartDelay +
      slotMachineDigitDuration +
      Math.max(0, digitCount - 1) * slotMachineDigitStagger) *
      1000 +
    80;

  useEffect(() => {
    if (!inView || animationValue !== null) return;
    setAnimationValue(value);
  }, [animationValue, inView, value]);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    const timer = window.setTimeout(() => setSettled(true), revealDurationMs);
    return () => window.clearTimeout(timer);
  }, [inView, reduceMotion, revealDurationMs]);

  const phase: MetricPhase = reduceMotion || settled
    ? "settled"
    : inView && animationValue !== null
      ? "playing"
      : "idle";

  const numberClassName = cn(
    metricNumberClassName,
    "relative inline-flex w-fit max-w-full items-baseline tabular-nums max-sm:w-full max-sm:justify-center",
    className,
  );

  const mergeRefs = (node: HTMLDivElement | null) => {
    inViewRef.current = node;
    containerRef.current = node;
  };

  return (
    <div ref={mergeRefs} className="relative w-fit min-w-0 max-w-full max-sm:w-full max-sm:overflow-hidden">
      <MetricDisplay
        value={displayValue}
        sizerValue={sizerValue}
        className={numberClassName}
        textRef={textRef}
        fontStyle={fontStyle}
        phase={phase}
      />
    </div>
  );
}

export default SlotMachineNumber;
