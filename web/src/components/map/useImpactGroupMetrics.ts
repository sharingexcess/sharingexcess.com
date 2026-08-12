import { useEffect, useState } from "react";
import { fetchSurplusGroupMetrics } from "@/components/map/surplusGroupMetrics";
import type { MapHubMetric } from "@/components/map/types";

export function useImpactGroupMetrics(): Record<string, MapHubMetric[]> {
  const [metricsByGroupId, setMetricsByGroupId] = useState<Record<string, MapHubMetric[]>>(
    {},
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchSurplusGroupMetrics(controller.signal)
      .then((metrics) => {
        if (metrics) setMetricsByGroupId(metrics);
      })
      .catch(() => {
        // Keep empty map on network errors or abort.
      });

    return () => controller.abort();
  }, []);

  return metricsByGroupId;
}
