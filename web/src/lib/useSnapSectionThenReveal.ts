import { useScrollInteractionsEnabled } from "@/components/providers/AppProviders";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { getLenisInstance } from "@/lib/lenisInstance";
import {
  disableRoundSectionScrollLock,
  enableRoundSectionScrollLock,
} from "@/lib/roundSectionScrollLock";
import {
  getSectionAlignmentDistance,
  isSectionAligned,
  isSectionOnScreen,
} from "@/lib/roundSectionScroll";
import { useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, useState, type RefObject } from "react";

const SNAP_ZONE_RATIO = 0.55;
const WHEEL_SETTLE_MS = 90;
const MOMENTUM_SETTLE_VELOCITY = 5;
const SNAP_CANCEL_VELOCITY = 8;

function getSectionElement(target: HTMLElement | null): HTMLElement | null {
  return target?.closest("section") ?? target;
}

type Phase = "idle" | "armed" | "snapping" | "done";

export interface RoundSectionRevealState {
  revealed: boolean;
  isSnapping: boolean;
}

export function useSnapSectionThenReveal(
  targetRef: RefObject<HTMLElement | null>,
): RoundSectionRevealState {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const scrollInteractions = useScrollInteractionsEnabled();
  const staticPreview = !scrollInteractions || reduceMotion;
  const [revealed, setRevealed] = useState(!!staticPreview);
  const [isSnapping, setIsSnapping] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const wheelTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (staticPreview) return;

    const finish = () => {
      phaseRef.current = "done";
      setIsSnapping(false);
      setRevealed(true);
      const section = getSectionElement(targetRef.current);
      if (section) enableRoundSectionScrollLock(section);
    };

    const getSection = () => getSectionElement(targetRef.current);

    const canReveal = (section: HTMLElement) => {
      if (!isSectionAligned(section)) return false;
      if (lenis && Math.abs(lenis.velocity) > MOMENTUM_SETTLE_VELOCITY) return false;
      return true;
    };

    const maybeReveal = (section: HTMLElement) => {
      if (phaseRef.current === "done") {
        if (isSectionAligned(section)) enableRoundSectionScrollLock(section);
        return true;
      }
      if (!canReveal(section)) return false;
      finish();
      return true;
    };

    const inSnapZone = (section: HTMLElement) => {
      const distance = getSectionAlignmentDistance(section);
      return (
        isSectionOnScreen(section) &&
        distance <= window.innerHeight * SNAP_ZONE_RATIO
      );
    };

    const runSnap = (section: HTMLElement) => {
      if (canReveal(section)) { finish(); return; }
      if (!lenis) return;
      disableRoundSectionScrollLock(section);
      phaseRef.current = "snapping";
      setIsSnapping(true);
      lenis.scrollTo(section, {
        lerp: 0.11,
        force: true,
        userData: { initiator: "round-image-snap" },
        onComplete: () => {
          setIsSnapping(false);
          const current = getSection();
          if (current) maybeReveal(current);
          else finish();
        },
      });
    };

    const trySnap = (fromWheelSettle = false) => {
      if (phaseRef.current === "done") return;
      const section = getSection();
      if (!section) return;
      if (maybeReveal(section)) return;
      if (!inSnapZone(section)) {
        if (phaseRef.current === "armed") phaseRef.current = "idle";
        return;
      }
      if (phaseRef.current === "idle") phaseRef.current = "armed";
      if (phaseRef.current === "snapping") return;
      if (phaseRef.current !== "armed") return;
      if (!fromWheelSettle && lenis && Math.abs(lenis.velocity) > MOMENTUM_SETTLE_VELOCITY) return;
      runSnap(section);
    };

    const onVirtualScroll = () => {
      if (phaseRef.current === "done") return;
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => trySnap(true), WHEEL_SETTLE_MS);
    };

    const onScroll = () => {
      const section = getSection();
      if (!section) return;
      if (phaseRef.current === "done") {
        if (isSectionAligned(section)) enableRoundSectionScrollLock(section);
        else disableRoundSectionScrollLock(section);
        return;
      }
      if (phaseRef.current === "snapping" && lenis && Math.abs(lenis.velocity) > SNAP_CANCEL_VELOCITY) {
        phaseRef.current = "armed";
        setIsSnapping(false);
        return;
      }
      if (phaseRef.current === "snapping") { maybeReveal(section); return; }
      if (maybeReveal(section)) return;
      if (!inSnapZone(section)) return;
      if (phaseRef.current === "idle") phaseRef.current = "armed";
      if (lenis && Math.abs(lenis.velocity) <= MOMENTUM_SETTLE_VELOCITY) trySnap(false);
    };

    const section = getSection();
    if (section && canReveal(section)) {
      finish();
    } else if (!lenis) {
      const fallback = window.setTimeout(() => {
        const current = getSection();
        if (current && isSectionAligned(current) && !getLenisInstance()) finish();
      }, 250);
      return () => window.clearTimeout(fallback);
    }

    if (!lenis) return;
    lenis.on("virtual-scroll", onVirtualScroll);
    lenis.on("scroll", onScroll);

    // After Lenis becomes ready, fire one initial snap check on the next
    // layout frame. Without this, a section already in the snap zone (e.g.
    // page loads mid-scroll, browser restores scroll position, or Lenis
    // initialises after mount) stays invisible waiting for user scroll input.
    const initialCheck = requestAnimationFrame(() => trySnap(true));

    return () => {
      cancelAnimationFrame(initialCheck);
      lenis.off("virtual-scroll", onVirtualScroll);
      lenis.off("scroll", onScroll);
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
      const current = getSection();
      if (current) disableRoundSectionScrollLock(current);
    };
  }, [lenis, staticPreview, targetRef]);

  useEffect(() => {
    if (!staticPreview) return;
    const section = getSectionElement(targetRef.current);
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isSectionAligned(section)) setRevealed(true);
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(section);
    if (isSectionAligned(section)) setRevealed(true);
    return () => observer.disconnect();
  }, [staticPreview, targetRef]);

  return { revealed, isSnapping };
}
