import { cn } from "@/lib/cn";
import { motion } from "@/lib/motion";
import type { MapHub } from "./types";

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

function hubTitleId(name: string): string {
  return `hub-card-title-${name.replace(/\s+/g, "-").toLowerCase()}`;
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
          "se-map-hub-card w-[min(100vw,20rem)] rounded-[var(--radius-xl)] bg-white p-5 shadow-[0_8px_32px_rgba(27,27,21,0.18)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
        <h3
          id={titleId}
          className="font-display text-lg font-bold leading-tight tracking-[-0.03em] text-[var(--color-neutral-500)]"
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
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          {hub.metrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <dt className="text-xs leading-snug text-[var(--color-neutral-350)]">
                {metric.label}
              </dt>
              <dd className="font-display text-xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-se-green-700)]">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      </div>
    </motion.div>
  );
}

export default HubMarkerCard;
