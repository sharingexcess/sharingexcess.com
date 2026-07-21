import { useEffect, useState } from "react";
import { getSurplusApiOrigin } from "@/components/map/mapConfig";

/** Fallback when live API is unavailable — matches legacy home page (updated 5/9/25). */
export const FALLBACK_DONATED_WEIGHT_LBS = 234_772_717;

const METRICS_PATH = "/public/analytics/metrics";

interface SurplusImpactMetrics {
  donated_weight?: number;
}

export function useLiveDonatedWeight(): number {
  const [weight, setWeight] = useState(FALLBACK_DONATED_WEIGHT_LBS);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${getSurplusApiOrigin()}${METRICS_PATH}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SurplusImpactMetrics | null) => {
        if (typeof data?.donated_weight === "number" && Number.isFinite(data.donated_weight)) {
          setWeight(Math.round(data.donated_weight));
        }
      })
      .catch(() => {
        // Keep fallback on network errors or abort.
      });

    return () => controller.abort();
  }, []);

  return weight;
}
