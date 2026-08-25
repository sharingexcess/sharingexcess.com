import { useScrollInteractionsEnabled } from "@/components/providers/AppProviders";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, useState, type RefObject } from "react";

/** Extra scroll runway while the map stage is sticky — ~40% viewport height. */
export const MAP_STAGE_LINGER_SVH = 40;

/** Distance from fullscreen (px) where the map starts pulling scroll in. */
const SNAP_ZONE_RATIO = 0.72;
/** Tighter band — snap immediately on wheel input. */
const TIGHT_SNAP_ZONE_RATIO = 0.32;
const WHEEL_SETTLE_MS = 55;
const MOMENTUM_SETTLE_VELOCITY = 8;
const SNAP_CANCEL_VELOCITY = 14;
const FILL_ALIGNED_THRESHOLD = 4;
const SNAP_DURATION_S = 1.25;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function getMapStageDistanceFromFill(stage: HTMLElement): number {
  return Math.abs(stage.getBoundingClientRect().top);
}

export function isMapStageFilled(stage: HTMLElement): boolean {
  return getMapStageDistanceFromFill(stage) <= FILL_ALIGNED_THRESHOLD;
}

function isPinOnScreen(pin: HTMLElement): boolean {
  const { top, bottom } = pin.getBoundingClientRect();
  return bottom > 0 && top < window.innerHeight;
}

export function useMapStageScrollSnap(
  pinRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  enabled = true,
): { isSnapping: boolean } {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const scrollInteractions = useScrollInteractionsEnabled();
  const active = enabled && scrollInteractions && !reduceMotion;
  const [isSnapping, setIsSnapping] = useState(false);
  const snappingRef = useRef(false);
  const wheelTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const getPin = () => pinRef.current;
    const getStage = () => stageRef.current;

    const inSnapZone = (pin: HTMLElement, stage: HTMLElement) => {
      if (!isPinOnScreen(pin)) return false;
      return getMapStageDistanceFromFill(stage) <= window.innerHeight * SNAP_ZONE_RATIO;
    };

    const inTightSnapZone = (stage: HTMLElement) =>
      getMapStageDistanceFromFill(stage) <= window.innerHeight * TIGHT_SNAP_ZONE_RATIO;

    const runSnap = (pin: HTMLElement, stage: HTMLElement) => {
      if (!lenis || snappingRef.current || isMapStageFilled(stage)) return;
      if (Math.abs(lenis.velocity) > MOMENTUM_SETTLE_VELOCITY) return;

      snappingRef.current = true;
      setIsSnapping(true);

      lenis.scrollTo(pin, {
        offset: 0,
        duration: SNAP_DURATION_S,
        easing: easeOutCubic,
        force: true,
        userData: { initiator: "map-stage-snap" },
        onComplete: () => {
          snappingRef.current = false;
          setIsSnapping(false);
        },
      });
    };

    const trySnap = (fromWheelSettle = false) => {
      const pin = getPin();
      const stage = getStage();
      if (!pin || !stage) return;
      if (isMapStageFilled(stage)) return;
      if (!inSnapZone(pin, stage)) return;
      if (snappingRef.current) return;
      if (!fromWheelSettle && lenis && Math.abs(lenis.velocity) > MOMENTUM_SETTLE_VELOCITY) return;
      runSnap(pin, stage);
    };

    const onVirtualScroll = () => {
      const pin = getPin();
      const stage = getStage();
      if (pin && stage && inTightSnapZone(stage)) {
        trySnap(false);
        return;
      }

      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => trySnap(true), WHEEL_SETTLE_MS);
    };

    const onScroll = () => {
      const pin = getPin();
      const stage = getStage();
      if (!pin || !stage) return;

      if (snappingRef.current && lenis && Math.abs(lenis.velocity) > SNAP_CANCEL_VELOCITY) {
        snappingRef.current = false;
        setIsSnapping(false);
        return;
      }

      if (snappingRef.current) return;
      if (isMapStageFilled(stage)) return;
      if (!inSnapZone(pin, stage)) return;
      if (inTightSnapZone(stage)) {
        trySnap(false);
        return;
      }
      if (lenis && Math.abs(lenis.velocity) <= MOMENTUM_SETTLE_VELOCITY) trySnap(false);
    };

    if (!lenis) return;

    lenis.on("virtual-scroll", onVirtualScroll);
    lenis.on("scroll", onScroll);

    const initialCheck = requestAnimationFrame(() => trySnap(true));

    return () => {
      cancelAnimationFrame(initialCheck);
      lenis.off("virtual-scroll", onVirtualScroll);
      lenis.off("scroll", onScroll);
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
      snappingRef.current = false;
      setIsSnapping(false);
    };
  }, [active, lenis, pinRef, stageRef]);

  return { isSnapping };
}
