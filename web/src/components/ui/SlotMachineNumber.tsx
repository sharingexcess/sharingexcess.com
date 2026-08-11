import { cn } from "@/lib/cn";
import { formatLargeNumber } from "@/lib/formatNumber";
import {
  slotMachineDigitDuration,
  slotMachineLiveTickDigitDuration,
  slotMachineLiveTickInitialDelayMs,
  slotMachineLiveTickIntervalMs,
  slotMachineReelCycles,
  slotMachineStartDelay,
  slotMachineDigitStagger,
  slotMachineFadeInDelayMs,
  slotMachineFadeInDurationMs,
  slotMachineInViewOptions,
  useReducedMotion,
} from "@/lib/motion";
import { metricNumberClassName } from "@/lib/typography";
import { useFitText } from "@/lib/useFitText";
import { useInViewOnce } from "@/lib/useInViewOnce";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const MOBILE_FIT_MQ = "(max-width: 639px)";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

type SlotPhase = "idle" | "playing" | "settled" | "stepping";

const digitSlotClassName =
  "relative inline-block h-[1em] w-[0.93ch] overflow-hidden align-top lg:w-[1ch]";

const digitGlyphClassName = "block h-[1em] shrink-0 leading-[1.06] text-center";

const separatorClassName = "inline-block w-[0.35ch] text-center";

const REEL_CACHE = Array.from({ length: 10 }, (_, digit) => {
  const reel: string[] = [];
  const totalSteps = slotMachineReelCycles * 10 + digit;

  for (let step = 0; step <= totalSteps; step += 1) {
    reel.push(DIGITS[step % 10]);
  }

  return reel;
});

interface LockedReveal {
  revealValue: string;
  revealNumeric: number;
  targetNumeric: number;
}

const SlotDigit = memo(function SlotDigit({
  digit,
  index,
  phase,
  primed,
  stepFromOffset,
}: {
  digit: string;
  index: number;
  phase: SlotPhase;
  primed: boolean;
  stepFromOffset?: number;
}) {
  const targetDigit = Number.parseInt(digit, 10);
  const reel = REEL_CACHE[targetDigit] ?? REEL_CACHE[0];
  const finalOffset = reel.length - 1;
  const isStepping = phase === "stepping" && stepFromOffset != null;
  const isPlaying = phase === "playing";
  const isSettled = phase === "settled" || phase === "stepping";

  const reelStyle = {
    "--slot-offset": finalOffset,
    "--slot-duration": `${slotMachineDigitDuration}s`,
    "--slot-step-duration": `${slotMachineLiveTickDigitDuration}s`,
    ...(isPlaying && {
      "--slot-delay": `${slotMachineStartDelay + index * slotMachineDigitStagger}s`,
    }),
    ...(isStepping && {
      "--slot-from": stepFromOffset,
    }),
    ...(isSettled &&
      !isPlaying &&
      !isStepping && {
        transform: `translate3d(0, calc(-1em * ${finalOffset}), 0)`,
      }),
  } as CSSProperties;

  return (
    <span className={cn(digitSlotClassName, "[contain:layout_paint]")} aria-hidden>
      <span
        className={cn(
          "slot-reel-column flex flex-col",
          primed && "slot-reel-column--primed",
          isPlaying && "slot-reel-column--playing",
          isStepping && "slot-reel-column--stepping",
        )}
        style={reelStyle}
      >
        {reel.map((char, reelIndex) => (
          <span key={reelIndex} className={digitGlyphClassName}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
});

const MetricSeparator = memo(function MetricSeparator({ char }: { char: string }) {
  return <span className={separatorClassName}>{char}</span>;
});

const MetricDigits = memo(function MetricDigits({
  value,
  revealPhase,
  primed,
  lastDigitIndex,
  stepFromOffset,
}: {
  value: string;
  revealPhase: SlotPhase;
  primed: boolean;
  lastDigitIndex: number;
  stepFromOffset?: number;
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
        const isLastDigit = index === lastDigitIndex;
        const isStepping = isLastDigit && stepFromOffset != null;

        const digitPhase: SlotPhase = isStepping
          ? "stepping"
          : revealPhase === "playing"
            ? "playing"
            : revealPhase === "idle"
              ? "idle"
              : "settled";

        return (
          <SlotDigit
            key={charIndex}
            digit={char}
            index={index}
            phase={digitPhase}
            primed={primed}
            stepFromOffset={isStepping ? stepFromOffset : undefined}
          />
        );
      })}
    </>
  );
});

function MetricDisplay({
  value,
  sizerValue,
  className,
  textRef,
  fontStyle,
  revealPhase,
  primed,
  lastDigitIndex,
  stepFromOffset,
}: {
  value: string;
  sizerValue: string;
  className: string;
  textRef: RefObject<HTMLElement | null>;
  fontStyle?: CSSProperties;
  revealPhase: SlotPhase;
  primed: boolean;
  lastDigitIndex: number;
  stepFromOffset?: number;
}) {
  const visible = revealPhase !== "idle";

  return (
    <>
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
        <span
          className="inline-flex items-baseline transition-opacity ease-[cubic-bezier(0.52,0,0.22,1)]"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${slotMachineFadeInDurationMs}ms`,
            transitionDelay: visible ? `${slotMachineFadeInDelayMs}ms` : "0ms",
          }}
          aria-hidden={!visible}
        >
          <MetricDigits
            value={value}
            revealPhase={revealPhase}
            primed={primed}
            lastDigitIndex={lastDigitIndex}
            stepFromOffset={stepFromOffset}
          />
        </span>
      </p>
    </>
  );
}

export interface SlotMachineNumberProps {
  value: string;
  className?: string;
  /** Live target count — reels land on `target - liveTickOffset`, then the last digit steps up */
  numericValue?: number;
  liveTickOffset?: number;
  /** Fires once the main reel reveal finishes */
  onRevealComplete?: () => void;
}

/** Formatted numeral with a left-to-right slot-machine reel reveal */
export function SlotMachineNumber({
  value,
  className,
  numericValue,
  liveTickOffset = 5,
  onRevealComplete,
}: SlotMachineNumberProps) {
  const reduceMotion = useReducedMotion();
  const inViewRef = useRef<HTMLDivElement>(null);
  const lockedRevealRef = useRef<LockedReveal | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const revealCompleteRef = useRef(onRevealComplete);
  const inView = useInViewOnce(inViewRef, slotMachineInViewOptions);

  const targetNumeric = numericValue ?? Number.parseInt(value.replace(/\D/g, ""), 10);
  const hasLiveTick =
    numericValue != null && liveTickOffset > 0 && targetNumeric - liveTickOffset >= 0;

  const [primed, setPrimed] = useState(false);
  const [animationValue, setAnimationValue] = useState<string | null>(null);
  const [revealDone, setRevealDone] = useState(false);
  const [liveNumeric, setLiveNumeric] = useState<number | null>(null);
  const [liveTickDone, setLiveTickDone] = useState(!hasLiveTick);
  const [stepFromOffset, setStepFromOffset] = useState<number | undefined>(undefined);
  const [mobileFit, setMobileFit] = useState(false);
  const [fitLocked, setFitLocked] = useState(false);

  revealCompleteRef.current = onRevealComplete;

  const locked = lockedRevealRef.current;
  const revealValue =
    locked?.revealValue ??
    formatLargeNumber(hasLiveTick ? targetNumeric - liveTickOffset : targetNumeric);

  const displayValue =
    reduceMotion || liveTickDone
      ? value
      : liveNumeric != null
        ? formatLargeNumber(liveNumeric)
        : (animationValue ?? revealValue);

  const sizerValue = (animationValue ?? revealValue).replace(/\d/g, "0");
  const digitCount = useMemo(() => (value.match(/\d/g) ?? []).length, [value]);
  const lastDigitIndex = digitCount - 1;

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_FIT_MQ);
    const update = () => setMobileFit(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { containerRef, textRef, fontSizePx } = useFitText(sizerValue, {
    minSizePx: 32,
    enabled: mobileFit && !fitLocked,
  });
  const fontStyle = fontSizePx != null ? { fontSize: `${fontSizePx}px` } : undefined;

  const revealDurationMs =
    (slotMachineStartDelay +
      slotMachineDigitDuration +
      Math.max(0, digitCount - 1) * slotMachineDigitStagger) *
      1000 +
    80;

  // Prime GPU layers on mount so the first spin doesn't pay compositor setup during scroll.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setPrimed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!inView || !reduceMotion || revealDone) return;

    setRevealDone(true);
    revealCompleteRef.current?.();
    setLiveTickDone(true);
  }, [inView, reduceMotion, revealDone]);

  // Lock values and defer the playing phase until after the current scroll frame paints.
  useEffect(() => {
    if (!inView || lockedRevealRef.current) return;

    lockedRevealRef.current = {
      revealValue: formatLargeNumber(
        hasLiveTick ? targetNumeric - liveTickOffset : targetNumeric,
      ),
      revealNumeric: hasLiveTick ? targetNumeric - liveTickOffset : targetNumeric,
      targetNumeric,
    };
    setFitLocked(true);

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setAnimationValue(lockedRevealRef.current?.revealValue ?? null);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [hasLiveTick, inView, liveTickOffset, targetNumeric]);

  useEffect(() => {
    if (!animationValue || revealDone || reduceMotion) return;

    const timer = window.setTimeout(() => {
      setRevealDone(true);
      revealCompleteRef.current?.();
      if (hasLiveTick && lockedRevealRef.current) {
        setLiveNumeric(lockedRevealRef.current.revealNumeric);
      }
    }, revealDurationMs);

    return () => window.clearTimeout(timer);
  }, [animationValue, hasLiveTick, reduceMotion, revealDone, revealDurationMs]);

  useEffect(() => {
    if (!revealDone || !hasLiveTick || liveTickDone || liveNumeric == null || reduceMotion) {
      return;
    }

    const target = lockedRevealRef.current?.targetNumeric ?? targetNumeric;
    if (liveNumeric >= target) {
      setLiveTickDone(true);
      return;
    }

    if (stepFromOffset != null) return;

    const revealStart = lockedRevealRef.current?.revealNumeric;
    const tickDelay =
      revealStart != null && liveNumeric === revealStart
        ? slotMachineLiveTickInitialDelayMs
        : slotMachineLiveTickIntervalMs;

    tickTimerRef.current = window.setTimeout(() => {
      const nextNumeric = liveNumeric + 1;
      const nextDigits = formatLargeNumber(nextNumeric).match(/\d/g) ?? [];
      const nextLastDigit = Number.parseInt(nextDigits[nextDigits.length - 1] ?? "0", 10);
      const nextReel = REEL_CACHE[nextLastDigit] ?? REEL_CACHE[0];
      const fromOffset = nextReel.length - 2;

      setStepFromOffset(fromOffset);
      setLiveNumeric(nextNumeric);

      window.setTimeout(() => {
        setStepFromOffset(undefined);
        if (nextNumeric >= target) {
          setLiveTickDone(true);
        }
      }, slotMachineLiveTickDigitDuration * 1000 + 40);
    }, tickDelay);

    return () => {
      if (tickTimerRef.current != null) {
        window.clearTimeout(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [
    hasLiveTick,
    liveNumeric,
    liveTickDone,
    reduceMotion,
    revealDone,
    stepFromOffset,
    targetNumeric,
  ]);

  const revealPhase: SlotPhase = reduceMotion || liveTickDone
    ? "settled"
    : animationValue !== null && !revealDone
      ? "playing"
      : animationValue !== null
        ? "settled"
        : "idle";

  const numberClassName = cn(
    metricNumberClassName,
    "relative inline-flex w-fit max-w-full items-baseline tabular-nums max-sm:w-full max-sm:justify-center",
    className,
  );

  const mergeRefs = useCallback((node: HTMLDivElement | null) => {
    inViewRef.current = node;
    containerRef.current = node;
  }, [containerRef]);

  return (
    <div ref={mergeRefs} className="relative w-fit min-w-0 max-w-full max-sm:w-full max-sm:overflow-hidden">
      <MetricDisplay
        value={displayValue}
        sizerValue={sizerValue}
        className={numberClassName}
        textRef={textRef}
        fontStyle={fontStyle}
        revealPhase={revealPhase}
        primed={primed}
        lastDigitIndex={lastDigitIndex}
        stepFromOffset={stepFromOffset}
      />
    </div>
  );
}

export default SlotMachineNumber;
