import { MetricInfoPopover } from "@/components/map/MetricInfoPopover";
import { cn } from "@/lib/cn";
import { motion } from "@/lib/motion";
import type { MapHub, MapHubMetric } from "./types";

export interface HubCardAnchor {
  x: number;
  y: number;
}

export interface HubMarkerCardProps {
  hub: MapHub;
  onClose: () => void;
  anchor: HubCardAnchor;
  className?: string;
}

/** Matches `w-[min(100vw,24rem)]` — keep in sync with InteractiveMap card positioning. */
export const HUB_MARKER_CARD_WIDTH_PX = 384;

/** Title + 2×2 metric grid — keep in sync with InteractiveMap card positioning. */
export const HUB_MARKER_CARD_ESTIMATED_HEIGHT_PX = 260;

function hubTitleId(name: string): string {
  return `hub-card-title-${name.replace(/\s+/g, "-").toLowerCase()}`;
}

function HubMetricTile({
  metric,
  variant,
}: {
  metric: MapHubMetric;
  variant: "green" | "white";
}) {
  const isGreen = variant === "green";

  return (
    <div
      className={cn(
        "@container flex h-full w-full min-w-0 flex-col rounded-[var(--radius-sm)] px-3 pt-2.5 pb-2",
        isGreen
          ? "bg-se-green text-white"
          : "border border-[var(--color-neutral-200)] bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <p
          className={cn(
            "min-w-0 font-display text-[clamp(2.125rem,15.5cqw,3.25rem)] font-bold leading-none tracking-[-0.05em]",
            isGreen ? "text-white" : "text-kale",
          )}
        >
          {metric.value}
        </p>
        <MetricInfoPopover
          label={metric.label}
          tooltip={metric.tooltip}
          className={cn(
            "-mt-0.5",
            isGreen ? "text-white/80 hover:text-white" : "text-[var(--color-neutral-350)] hover:text-kale",
          )}
        />
      </div>
      <p
        className={cn(
          "mt-0.5 text-xs font-medium leading-tight",
          isGreen ? "text-white/90" : "text-[var(--color-neutral-400)]",
        )}
      >
        {metric.label}
      </p>
    </div>
  );
}

export function HubMarkerCard({ hub, onClose, anchor, className }: HubMarkerCardProps) {
  const titleId = hubTitleId(hub.name);

  return (
    <motion.div
      className="se-map-hub-card-anchor"
      style={{ left: anchor.x, top: anchor.y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "se-map-hub-card w-[min(100vw,24rem)] rounded-[var(--radius-xl)] bg-white p-5 shadow-[0_8px_32px_rgba(27,27,21,0.18)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            id={titleId}
            className="font-sans text-[clamp(1.5rem,7cqw,1.875rem)] font-bold leading-[1.06] tracking-[-0.04em] text-se-green"
          >
            {hub.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-500)]"
            aria-label={`Close ${hub.name} hub details`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 2L12 12M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {hub.metrics && hub.metrics.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-1">
            {hub.metrics.map((metric, index) => (
              <HubMetricTile
                key={metric.id}
                metric={metric}
                variant={index === 0 ? "green" : "white"}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default HubMarkerCard;
