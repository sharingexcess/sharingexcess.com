import { cn } from "@/lib/cn";
import { appleEase, motion, useReducedMotion } from "@/lib/motion";

export interface MenuToggleProps {
  open: boolean;
  onToggle: () => void;
  controlsId: string;
  /** Light icon for dark / photo backgrounds (e.g. transparent home hero header) */
  inverted?: boolean;
  className?: string;
}

const LINE_CLASS =
  "absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 rounded-full origin-center";

const LINE_OFFSETS = {
  top: -6,
  middle: 0,
  bottom: 6,
} as const;

/** Animated hamburger ↔ close icon — 44px touch target. */
export function MenuToggle({
  open,
  onToggle,
  controlsId,
  inverted = false,
  className,
}: MenuToggleProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: appleEase };

  return (
    <button
      type="button"
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center rounded-full",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-se-green",
        inverted
          ? "text-white hover:bg-white/10"
          : "text-kale hover:bg-neutral-100",
        className,
      )}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onToggle}
    >
      <span className="relative block size-5" aria-hidden>
        <motion.span
          className={cn(LINE_CLASS, inverted ? "bg-white" : "bg-kale")}
          initial={false}
          animate={
            open
              ? { y: 0, rotate: 45 }
              : { y: LINE_OFFSETS.top, rotate: 0 }
          }
          transition={transition}
        />
        <motion.span
          className={cn(LINE_CLASS, inverted ? "bg-white" : "bg-kale")}
          initial={false}
          animate={
            open
              ? { opacity: 0, scaleX: 0, y: 0 }
              : { opacity: 1, scaleX: 1, y: LINE_OFFSETS.middle }
          }
          transition={transition}
        />
        <motion.span
          className={cn(LINE_CLASS, inverted ? "bg-white" : "bg-kale")}
          initial={false}
          animate={
            open
              ? { y: 0, rotate: -45 }
              : { y: LINE_OFFSETS.bottom, rotate: 0 }
          }
          transition={transition}
        />
      </span>
    </button>
  );
}

export default MenuToggle;
