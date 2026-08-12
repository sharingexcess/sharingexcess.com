import { cn } from "@/lib/cn";
import { AnimatePresence, motion, motionEase, useReducedMotion } from "@/lib/motion";
import { bodyMdClassName } from "@/lib/typography";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

const POPOVER_WIDTH = 240;
const POPOVER_GAP = 8;

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 9V14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.25" r="1" fill="currentColor" />
    </svg>
  );
}

export interface MetricInfoPopoverProps {
  label: string;
  tooltip?: string;
  className?: string;
}

export function MetricInfoPopover({ label, tooltip, className }: MetricInfoPopoverProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [placeAbove, setPlaceAbove] = useState(false);
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = Math.min(POPOVER_WIDTH, viewportWidth - 24);
    const left = Math.min(
      Math.max(12, rect.right - panelWidth),
      viewportWidth - panelWidth - 12,
    );

    const spaceBelow = viewportHeight - rect.bottom - POPOVER_GAP;
    const spaceAbove = rect.top - POPOVER_GAP;
    const shouldPlaceAbove = spaceBelow < 120 && spaceAbove > spaceBelow;
    const top = shouldPlaceAbove
      ? Math.max(12, rect.top - POPOVER_GAP)
      : rect.bottom + POPOVER_GAP;

    setPlaceAbove(shouldPlaceAbove);
    setPanelStyle({
      position: "fixed",
      left,
      top,
      width: panelWidth,
      zIndex: 60,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panelY = placeAbove ? "-100%" : 0;
  const panelYOffset = placeAbove ? "calc(-100% - 8px)" : 8;
  const panelTransition = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: motionEase };
  const hasTooltip = Boolean(tooltip?.trim());

  const popover = mounted
    ? createPortal(
        <AnimatePresence>
          {open && hasTooltip && (
            <motion.div
              ref={panelRef}
              role="tooltip"
              aria-labelledby={titleId}
              style={panelStyle}
              initial={{ opacity: 0, y: panelYOffset }}
              animate={{ opacity: 1, y: panelY }}
              exit={{ opacity: 0, y: panelYOffset }}
              transition={panelTransition}
              className="rounded-[var(--radius-md)] bg-white p-3 text-kale shadow-[0_8px_32px_rgba(27,27,21,0.18)]"
            >
              <p id={titleId} className={cn(bodyMdClassName, "text-kale")}>
                {tooltip}
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "shrink-0 rounded-full transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-se-green",
          className,
        )}
        aria-label={`More information about ${label}`}
        aria-expanded={open && hasTooltip}
        aria-disabled={!hasTooltip}
        onClick={() => {
          if (!hasTooltip) return;
          setOpen((current) => !current);
        }}
      >
        <InfoIcon className="size-5" />
      </button>
      {popover}
    </>
  );
}
