import { Button } from "@/components/ui/Button";
import { ScrollAutoplayVideo } from "@/components/ui/ScrollAutoplayVideo";
import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  motion,
  motionEase,
  useReducedMotion,
} from "@/lib/motion";
import { parseEmphasis } from "@/lib/parseEmphasis";
import { bodyMdClassName, eyebrowClassName, sectionH3ClassName } from "@/lib/typography";
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

export const SURPLUS_LANDING_VIDEO_SRC = "/videos/Surplus-intro.mp4";

export const SURPLUS_LANDING_URL = "https://surplus.sharingexcess.com/";

const POPOVER_WIDTH = 640;
const POPOVER_GAP = 10;
const SURPLUS_LABEL = "Surplus";

function splitSurplusEyebrow(label: string): { prefix: string; hasSurplus: boolean } {
  const index = label.lastIndexOf(SURPLUS_LABEL);
  if (index === -1) return { prefix: label, hasSurplus: false };
  return { prefix: label.slice(0, index), hasSurplus: true };
}

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

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 2L12 12M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useSurplusInfoPopover() {
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
      Math.max(12, rect.left + rect.width / 2 - panelWidth / 2),
      viewportWidth - panelWidth - 12,
    );

    const spaceBelow = viewportHeight - rect.bottom - POPOVER_GAP;
    const spaceAbove = rect.top - POPOVER_GAP;
    const placeAbove = spaceBelow < 280 && spaceAbove > spaceBelow;
    const top = placeAbove
      ? Math.max(12, rect.top - POPOVER_GAP)
      : rect.bottom + POPOVER_GAP;

    setPlaceAbove(placeAbove);
    setPanelStyle({
      position: "fixed",
      left,
      top,
      width: panelWidth,
      zIndex: 60,
      "--section-emphasis": "var(--color-se-green-base)",
    } as CSSProperties);
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
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
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
  const panelYOffset = placeAbove ? "calc(-100% - 10px)" : 10;
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: motionEase };

  const popover = mounted
    ? createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="false"
              aria-labelledby={titleId}
              style={panelStyle}
              initial={{ opacity: 0, y: panelYOffset }}
              animate={{ opacity: 1, y: panelY }}
              exit={{ opacity: 0, y: panelYOffset }}
              transition={panelTransition}
              className="relative overflow-hidden rounded-[var(--radius-xl)] bg-white text-kale shadow-[0_12px_48px_rgba(27,27,21,0.22)]"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-neutral-350 transition-colors hover:bg-neutral-100 hover:text-neutral-500"
                aria-label="Close Surplus information"
              >
                <CloseIcon />
              </button>

              <div className="grid gap-5 px-5 pt-5 pb-5 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:items-center sm:gap-6 sm:px-6 sm:pt-6 sm:pb-6">
                <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-[var(--radius-lg)] border border-neutral-100 bg-neutral-100 sm:max-w-none">
                  <ScrollAutoplayVideo
                    videoSrc={SURPLUS_LANDING_VIDEO_SRC}
                    className="aspect-[9/16]"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-3 pr-6">
                  <h3 id={titleId} className={cn(sectionH3ClassName, "text-kale")}>
                    {parseEmphasis("*Surplus*: The Technology Behind Every Rescue")}
                  </h3>
                  <p className={cn(bodyMdClassName, "text-kale/88")}>
                    Surplus is the platform that powers our food rescue network. It tracks
                    food from pickup to delivery, connecting drivers, donors, and food
                    access partners in real time.
                  </p>
                  <div className="pt-1">
                    <Button
                      variant="primary"
                      colorScheme="light"
                      size="sm"
                      href={SURPLUS_LANDING_URL}
                    >
                      Learn more
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return {
    triggerRef,
    open,
    setOpen,
    popover,
  };
}

export interface SurplusEyebrowProps {
  label: string;
  className?: string;
}

/** Eyebrow copy with a Surplus word + info icon trigger for the product popover. */
export function SurplusEyebrow({ label, className }: SurplusEyebrowProps) {
  const { prefix, hasSurplus } = splitSurplusEyebrow(label);
  const { triggerRef, open, setOpen, popover } = useSurplusInfoPopover();

  if (!hasSurplus) {
    return (
      <p className={cn(eyebrowClassName, "text-[var(--section-text,#003619)]", className)}>
        {label}
      </p>
    );
  }

  return (
    <>
      <p
        className={cn(
          eyebrowClassName,
          "text-[var(--section-text,#003619)]",
          className,
        )}
      >
        {prefix}
        <button
          ref={triggerRef}
          type="button"
          aria-label="About Surplus"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "group inline-flex cursor-pointer items-center gap-1 align-baseline",
            "origin-left transition-transform duration-200 ease-out hover:scale-[1.06]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--section-emphasis)]",
          )}
        >
          <span>{SURPLUS_LABEL}</span>
          <InfoIcon className="size-5 shrink-0 text-[var(--section-text,#003619)]/72 transition-colors group-hover:text-[var(--section-text,#003619)]" />
        </button>
      </p>
      {popover}
    </>
  );
}

export default SurplusEyebrow;
