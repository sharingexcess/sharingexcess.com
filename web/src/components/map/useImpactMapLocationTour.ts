import { useCallback, useEffect, useRef } from "react";
import type { ImpactMapGroup } from "./impactMapGroups";

/** Wait before the first location opens. */
export const IMPACT_MAP_TOUR_INITIAL_DELAY_MS = 5_000;
/** How long each location stays open before advancing. */
export const IMPACT_MAP_TOUR_LOCATION_DWELL_MS = 5_000;
/** Idle time on the default view before the tour restarts. */
export const IMPACT_MAP_TOUR_RESET_PAUSE_MS = 10_000;

interface UseImpactMapLocationTourOptions {
  enabled: boolean;
  groups: ImpactMapGroup[];
  isReady: boolean;
  onSelectGroup: (group: ImpactMapGroup | null) => void;
}

export function useImpactMapLocationTour({
  enabled,
  groups,
  isReady,
  onSelectGroup,
}: UseImpactMapLocationTourOptions) {
  const pausedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSelectGroupRef = useRef(onSelectGroup);

  onSelectGroupRef.current = onSelectGroup;

  const clearScheduledStep = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pauseTour = useCallback(() => {
    pausedRef.current = true;
    clearScheduledStep();
  }, [clearScheduledStep]);

  useEffect(() => {
    if (!enabled || !isReady || groups.length === 0) return;

    pausedRef.current = false;
    let cancelled = false;
    let locationIndex = 0;
    let isFirstCycle = true;

    const schedule = (delayMs: number, step: () => void) => {
      clearScheduledStep();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (cancelled || pausedRef.current) return;
        step();
      }, delayMs);
    };

    const showNextLocation = () => {
      if (locationIndex >= groups.length) {
        onSelectGroupRef.current(null);
        locationIndex = 0;
        isFirstCycle = false;
        schedule(IMPACT_MAP_TOUR_RESET_PAUSE_MS, startLocationCycle);
        return;
      }

      onSelectGroupRef.current(groups[locationIndex]);
      locationIndex += 1;
      schedule(IMPACT_MAP_TOUR_LOCATION_DWELL_MS, showNextLocation);
    };

    const startLocationCycle = () => {
      locationIndex = 0;
      showNextLocation();
    };

    const startTour = () => {
      if (isFirstCycle) {
        schedule(IMPACT_MAP_TOUR_INITIAL_DELAY_MS, startLocationCycle);
        return;
      }
      startLocationCycle();
    };

    startTour();

    return () => {
      cancelled = true;
      clearScheduledStep();
    };
  }, [clearScheduledStep, enabled, groups, isReady]);

  return { pauseTour };
}
