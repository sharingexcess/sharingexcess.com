import { DonationForm } from "@/components/donation/DonationForm";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { AnimatePresence, appleEase, motion, useReducedMotion } from "@/lib/motion";
import { FormSection } from "@/sections/FormSection";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const DONATE_FORM_PARAM = "form";
const DONATE_FORM_VALUE = "donate";

const PLACEHOLDER_TITLE = "Lorem et du el ipsum";
const PLACEHOLDER_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.";
const PLACEHOLDER_BACKGROUND = "/images/peppers.jpg";

interface DonateOverlayContextValue {
  open: boolean;
  openDonateOverlay: () => void;
  closeDonateOverlay: () => void;
}

const DonateOverlayContext = createContext<DonateOverlayContextValue | null>(null);

const noopOverlay: DonateOverlayContextValue = {
  open: false,
  openDonateOverlay: () => {},
  closeDonateOverlay: () => {},
};

export function useDonateOverlay(): DonateOverlayContextValue {
  return useContext(DonateOverlayContext) ?? noopOverlay;
}

function readDonateParam(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(DONATE_FORM_PARAM) === DONATE_FORM_VALUE;
}

function setDonateParam(active: boolean) {
  const url = new URL(window.location.href);
  if (active) {
    url.searchParams.set(DONATE_FORM_PARAM, DONATE_FORM_VALUE);
  } else {
    url.searchParams.delete(DONATE_FORM_PARAM);
  }
  window.history.replaceState(window.history.state, "", url);
}

export function DonateOverlayProvider({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDonateOverlay = useCallback(() => {
    setOpen(true);
    setDonateParam(true);
  }, []);

  const closeDonateOverlay = useCallback(() => {
    setOpen(false);
    setDonateParam(false);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      if (readDonateParam()) {
        setOpen(true);
      }
    };

    syncFromUrl();
    document.addEventListener("astro:after-swap", syncFromUrl);
    return () => document.removeEventListener("astro:after-swap", syncFromUrl);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDonateOverlay();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeDonateOverlay]);

  return (
    <DonateOverlayContext.Provider value={{ open, openDonateOverlay, closeDonateOverlay }}>
      {children}
      <DonateOverlayPanel open={open} onClose={closeDonateOverlay} />
    </DonateOverlayContext.Provider>
  );
}

function DonateOverlayPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const instant = reduceMotion ? { duration: 0 } : undefined;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Donate"
          className="fixed inset-0 z-[100] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: appleEase, ...instant }}
        >
          <button
            type="button"
            onClick={onClose}
            className="fixed right-4 top-4 z-[110] flex size-10 items-center justify-center rounded-full bg-white/90 text-kale shadow-md backdrop-blur-sm transition-colors hover:bg-white lg:right-8 lg:top-8"
            aria-label="Close donation form"
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

          <FormSection
            layout="vertical-card"
            align="left"
            variant="brand-green"
            theme="light"
            headingSize="h2"
            backgroundImageSrc={PLACEHOLDER_BACKGROUND}
            backgroundImageAlt=""
            title={PLACEHOLDER_TITLE}
            body={PLACEHOLDER_BODY}
            cardMaxWidthClass="max-w-[560px]"
            cardClassName="rounded-[var(--radius-xl)] p-10 lg:p-12"
            className="min-h-screen"
          >
            <DonationForm
              variant="hero"
              formCard="white"
              sectionTheme="light"
              hideHeader
              compact
              embedded
            />
          </FormSection>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
