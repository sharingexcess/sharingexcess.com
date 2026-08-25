import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  appleEase,
  motion,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteHeaderNavItem } from "./SiteHeader";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={cn("size-4 shrink-0", className)}>
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface MobileNavItemProps {
  item: SiteHeaderNavItem;
  onClose: () => void;
}

function MobileNavItem({ item, onClose }: MobileNavItemProps) {
  const children = item.children ?? [];
  const [expanded, setExpanded] = useState(false);
  const submenuId = `mobile-nav-submenu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

  if (children.length === 0) {
    return (
      <a
        href={item.href}
        className={cn(
          "flex items-center py-2 no-underline",
          "font-display text-[clamp(1.375rem,5vw,1.75rem)] font-bold leading-[1.12] tracking-[-0.03em]",
          "text-kale",
        )}
        onClick={onClose}
      >
        {item.label}
      </a>
    );
  }

  return (
    <div className="py-1">
      <div className="flex items-center gap-2">
        <a
          href={item.href}
          className={cn(
            "min-w-0 flex-1 py-2 no-underline",
            "font-display text-[clamp(1.375rem,5vw,1.75rem)] font-bold leading-[1.12] tracking-[-0.03em]",
            "text-kale",
          )}
          onClick={onClose}
        >
          {item.label}
        </a>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-kale"
          aria-expanded={expanded}
          aria-controls={submenuId}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label} menu`}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDownIcon className={cn("transition-transform duration-200", expanded && "rotate-180")} />
        </button>
      </div>

      {expanded && (
        <ul id={submenuId} className="flex flex-col gap-1 pb-2 pl-4">
          {children.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="block py-2 text-[1.0625rem] leading-[1.35] text-kale/80 no-underline transition-colors hover:text-se-green"
                onClick={onClose}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface MobileNavPanelProps {
  open: boolean;
  navItems: SiteHeaderNavItem[];
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  ctaLabel: string;
  onDonateClick: () => void;
  onClose: () => void;
  panelId: string;
}

const shellVariants: Variants = {
  closed: {
    opacity: 1,
    transition: { when: "afterChildren" },
  },
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
  exit: {
    opacity: 1,
    transition: { staggerChildren: 0.04, staggerDirection: -1, when: "afterChildren" },
  },
};

const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { duration: 0.35, ease: appleEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: appleEase },
  },
};

const panelVariants: Variants = {
  closed: { opacity: 0, y: -12 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: appleEase, delay: 0.04 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease: appleEase },
  },
};

const linkVariants: Variants = {
  closed: { opacity: 0, y: 18 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: appleEase },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.18, ease: appleEase },
  },
};

const footerVariants: Variants = {
  closed: { opacity: 0, y: 12 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: appleEase, delay: 0.28 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: appleEase },
  },
};

export function MobileNavPanel({
  open,
  navItems,
  secondaryCtaLabel,
  secondaryCtaHref,
  ctaLabel,
  onDonateClick,
  onClose,
  panelId,
}: MobileNavPanelProps) {
  const reduceMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const firstLink = navRef.current?.querySelector("a");
    firstLink?.focus();
  }, [open]);

  const instant = reduceMotion ? { duration: 0 } : undefined;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-40 lg:hidden"
          variants={shellVariants}
          initial="closed"
          animate="open"
          exit="exit"
        >
          <motion.button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-neutral-000"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="exit"
            transition={instant}
            onClick={onClose}
          />

          <motion.nav
            ref={navRef}
            aria-label="Main"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 top-[var(--site-header-height)]",
              "flex flex-col justify-between px-6 pb-10 pt-8",
            )}
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="exit"
            transition={instant}
          >
            <motion.ul className="pointer-events-auto flex flex-col gap-1">
              {navItems.map((item, index) => (
                <motion.li key={index} variants={linkVariants}>
                  <MobileNavItem item={item} onClose={onClose} />
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="pointer-events-auto flex flex-row gap-2 pt-8"
              variants={footerVariants}
              transition={instant}
            >
              <Button variant="secondary" size="lg" href={secondaryCtaHref} className="min-w-0 flex-1">
                {secondaryCtaLabel}
              </Button>
              <Button variant="primary" size="lg" className="min-w-0 flex-1" onClick={() => {
                onDonateClick();
                onClose();
              }}>
                {ctaLabel}
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default MobileNavPanel;
