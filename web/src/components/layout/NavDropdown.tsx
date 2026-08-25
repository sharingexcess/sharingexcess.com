import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  motion,
  navDropdownExitSpring,
  navDropdownLinkSpring,
  navDropdownSpring,
  navFeaturedArrowSpring,
  navStackedExpandSpring,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import {
  type NavDropdownArrowAccent,
  type SiteHeaderNavItem,
} from "./SiteHeader";

/** Kale rest → se-green hover; shared by nav triggers and dropdown links. */
export const NAV_BUTTON_STYLE = {
  "--section-btn": "var(--color-kale, #003619)",
  "--section-btn-hover": "var(--color-se-green-base, #00843d)",
} as React.CSSProperties;

/** Hero overlay nav — white at rest and on hover for contrast on photography. */
export const NAV_BUTTON_GLASS_STYLE = {
  "--section-btn": "var(--color-neutral-000, #ffffff)",
  "--section-btn-hover": "var(--color-neutral-000, #ffffff)",
} as React.CSSProperties;

export const NAV_BUTTON_CLASS = "font-normal";

/** Tertiary `sm` — shared by nav triggers and dropdown links so label size matches. */
export const NAV_LINK_TEXT_CLASS = "text-sm leading-[0.82] lg:text-[16px]";

/** Subtle elevation when the nav or dropdown sits over a light page background. */
export const NAV_SURFACE_SHADOW_CLASS = "shadow-[0_2px_18px_rgba(0,0,0,0.06)]";

/** Slightly stronger elevation when the header bar is visible after scroll-hide. */
export const NAV_SURFACE_SHADOW_VISIBLE_CLASS =
  "shadow-[0_3px_24px_rgba(0,0,0,0.07)]";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={cn("size-3 shrink-0", className)}>
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

export interface NavDropdownTriggerProps {
  item: SiteHeaderNavItem;
  active?: boolean;
  onActivate: () => void;
}

export function NavDropdownTrigger({
  item,
  active,
  onActivate,
}: NavDropdownTriggerProps) {
  const children = item.children ?? [];
  const colorScheme = "light";

  if (children.length === 0) {
    return (
      <Button
        variant="tertiary"
        size="sm"
        colorScheme={colorScheme}
        href={item.href}
        active={active}
        className={cn(NAV_BUTTON_CLASS, NAV_LINK_TEXT_CLASS)}
      >
        {item.label}
      </Button>
    );
  }

  return (
    <div
      className="flex items-center gap-1 text-[var(--section-btn,#003619)]"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <Button
        variant="tertiary"
        size="sm"
        colorScheme={colorScheme}
        href={item.href}
        active={active}
        className={cn(NAV_BUTTON_CLASS, NAV_LINK_TEXT_CLASS)}
      >
        {item.label}
      </Button>
      <ChevronDownIcon
        aria-hidden
        className={cn(
          "transition-[transform,opacity] duration-200",
          active && "rotate-180",
        )}
      />
    </div>
  );
}

export interface NavDropdownPanelProps {
  item: SiteHeaderNavItem | null;
  navIndex: number | null;
  open: boolean;
  onClose: () => void;
  /** When true, renders `item.secondaryFeatured` in the dropdown list */
  showSecondaryFeatured?: boolean;
  /** Matches header bar — shadow only when page content below is on a light background */
  overWhiteBackground?: boolean;
  /** Horizontal offset from the header container — aligns panel under the active nav item */
  anchorLeft?: number;
}

const listVariants: Variants = {
  closed: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
  open: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const linkVariants: Variants = {
  closed: {
    opacity: 0,
    y: 8,
  },
  open: {
    opacity: 1,
    y: 0,
    transition: navDropdownLinkSpring,
  },
};

/** Fixed width — both dropdown menus share the same size. */
const DROPDOWN_PANEL_SHELL_CLASS =
  "w-[22rem] overflow-hidden rounded-[var(--radius-sm)] bg-neutral-000";

const DROPDOWN_PANEL_INNER_CLASS = "p-4";

/** Hardcoded design-system fills for nav dropdown hover arrows */
const NAV_DROPDOWN_ARROW_ACCENT_CLASS: Record<NavDropdownArrowAccent, string> = {
  "se-green": "bg-se-green text-white",
  "bright-kelly": "bg-bright-kelly text-kale",
  tangerine: "bg-tangerine text-dark-cherry",
  banana: "bg-banana text-kale",
  blueberry: "bg-blueberry text-kale",
  guava: "bg-guava text-dark-cherry",
};

const DEFAULT_NAV_DROPDOWN_ARROW_ACCENT: NavDropdownArrowAccent = "se-green";

function getNavDropdownArrowClass(accent?: NavDropdownArrowAccent): string {
  return NAV_DROPDOWN_ARROW_ACCENT_CLASS[accent ?? DEFAULT_NAV_DROPDOWN_ARROW_ACCENT];
}

function NavDropdownListArrow() {
  return (
    <svg viewBox="0 0 43 43" fill="none" className="block size-4 shrink-0" aria-hidden>
      <path
        d="M8 21.5H35M24 10.5L35 21.5L24 32.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const listItemArrowRevealVariants: Variants = {
  rest: { opacity: 0, y: 8 },
  hover: {
    opacity: 1,
    y: 0,
    transition: navFeaturedArrowSpring,
  },
};

const listItemThumbnailVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.12,
    transition: navFeaturedArrowSpring,
  },
};

const THUMBNAIL_SHELL_CLASS = "size-16 shrink-0 origin-center overflow-hidden rounded-[12px] bg-neutral-100";

/** Matches tertiary nav triggers — sliding label with multiline support. */
const NAV_DROPDOWN_ITEM_CLASS = cn(
  NAV_BUTTON_CLASS,
  NAV_LINK_TEXT_CLASS,
  "h-auto w-full min-w-0 shrink-0 origin-left items-center justify-start gap-3 rounded-[10px] py-1.5",
);

interface NavDropdownListEntry {
  key: string;
  label: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  imageAlign?: "center" | "bottom";
  arrowAccent?: NavDropdownArrowAccent;
}

function buildDropdownEntries(
  item: SiteHeaderNavItem,
  showSecondaryFeatured: boolean,
): NavDropdownListEntry[] {
  const entries: NavDropdownListEntry[] = [];

  if (showSecondaryFeatured && item.secondaryFeatured) {
    entries.push({
      key: `${item.label}-secondary-featured`,
      label: item.secondaryFeatured.text,
      href: item.secondaryFeatured.href ?? item.href,
      imageSrc: item.secondaryFeatured.imageSrc,
      imageAlt: item.secondaryFeatured.imageAlt,
      arrowAccent: item.secondaryFeatured.arrowAccent,
    });
  }

  for (const [index, link] of (item.children ?? []).entries()) {
    entries.push({
      key: `${item.label}-child-${index}`,
      label: link.label,
      href: link.href,
      imageSrc: link.featured?.imageSrc,
      imageAlt: link.featured?.imageAlt,
      imageAlign: link.featured?.imageAlign,
      arrowAccent: link.featured?.arrowAccent,
    });
  }

  return entries;
}

interface NavDropdownListItemProps {
  entry: NavDropdownListEntry;
  onClose: () => void;
  /** Skip sliding duplicate labels while the panel height is animating */
  simpleLabel?: boolean;
}

function NavDropdownListItem({ entry, onClose, simpleLabel = false }: NavDropdownListItemProps) {
  const reduceMotion = useReducedMotion();

  const thumbnailImage = entry.imageSrc ? (
    <img
      src={entry.imageSrc}
      alt={entry.imageAlt ?? ""}
      className={cn(
        "size-full object-cover",
        entry.imageAlign === "bottom" && "object-bottom",
      )}
    />
  ) : null;

  const thumbnail = reduceMotion ? (
    <div
      className={cn(
        THUMBNAIL_SHELL_CLASS,
        "transition-transform duration-200 ease-out group-hover:scale-[1.12] motion-reduce:transition-none",
      )}
    >
      {thumbnailImage ?? <div aria-hidden className="size-full bg-neutral-100" />}
    </div>
  ) : (
    <motion.div className={THUMBNAIL_SHELL_CLASS} variants={listItemThumbnailVariants}>
      {thumbnailImage ?? <div aria-hidden className="size-full bg-neutral-100" />}
    </motion.div>
  );

  const arrowClass = cn(
    "flex aspect-square size-8 shrink-0 items-center justify-center rounded-full",
    getNavDropdownArrowClass(entry.arrowAccent),
  );

  const arrowPositionClass = "absolute right-0 top-1/2 -translate-y-1/2";

  const arrow = reduceMotion ? (
    <span
      aria-hidden
      className={cn(
        arrowClass,
        arrowPositionClass,
        "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
      )}
    >
      <NavDropdownListArrow />
    </span>
  ) : (
    <motion.span
      aria-hidden
      variants={listItemArrowRevealVariants}
      className={cn(arrowClass, arrowPositionClass)}
    >
      <NavDropdownListArrow />
    </motion.span>
  );

  const link = (
    <Button
      variant="tertiary"
      size="sm"
      colorScheme="light"
      href={entry.href}
      leading={thumbnail}
      wrapLabel
      simpleLabel={simpleLabel}
      className={NAV_DROPDOWN_ITEM_CLASS}
      onClick={onClose}
      role="menuitem"
    >
      {entry.label}
    </Button>
  );

  if (reduceMotion) {
    return (
      <div className="group relative w-full">
        {link}
        {arrow}
      </div>
    );
  }

  return (
    <motion.div className="group relative w-full" initial="rest" whileHover="hover">
      {link}
      {arrow}
    </motion.div>
  );
}

/** Compact dropdown panel — vertical list with square thumbnails beside labels. */
export function NavDropdownPanel({
  item,
  open,
  onClose,
  showSecondaryFeatured = false,
  overWhiteBackground = false,
  anchorLeft = 0,
}: NavDropdownPanelProps) {
  const menuId = useId();
  const reduceMotion = useReducedMotion();
  const links = item?.children ?? [];
  const entries = item ? buildDropdownEntries(item, showSecondaryFeatured) : [];
  const itemLabel = item?.label ?? null;
  const prevItemLabelRef = useRef<string | null>(null);
  const isDropdownSwitch =
    open &&
    itemLabel !== null &&
    prevItemLabelRef.current !== null &&
    prevItemLabelRef.current !== itemLabel;
  const showItemStagger = !reduceMotion && !isDropdownSwitch;
  const contentRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | "auto">("auto");
  const [isPanelResizing, setIsPanelResizing] = useState(false);

  useLayoutEffect(() => {
    if (open && itemLabel) {
      prevItemLabelRef.current = itemLabel;
    } else if (!open) {
      prevItemLabelRef.current = null;
    }
  }, [open, itemLabel]);

  useLayoutEffect(() => {
    if (isDropdownSwitch) {
      setIsPanelResizing(true);
    }
  }, [isDropdownSwitch, itemLabel]);

  useLayoutEffect(() => {
    if (!open || !item) {
      setPanelHeight("auto");
      return;
    }

    const el = contentRef.current;
    if (!el) return;

    const syncHeight = () => {
      setPanelHeight(el.offsetHeight);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, item, itemLabel, showSecondaryFeatured, showItemStagger]);

  const instant = reduceMotion ? { duration: 0 } : undefined;
  const layoutTransition = reduceMotion ? { duration: 0 } : navStackedExpandSpring;
  const panelSizeTransition =
    isDropdownSwitch && !reduceMotion ? layoutTransition : { duration: 0 };
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : {
        opacity: navDropdownSpring,
        y: navDropdownSpring,
        scale: navDropdownSpring,
      };

  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {open && item && links.length > 0 && (
        <motion.div
          key="nav-dropdown-panel"
          className="absolute top-full z-50 hidden origin-top lg:block"
          style={{ left: anchorLeft }}
          initial={{ opacity: 0, y: -10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.94, transition: reduceMotion ? { duration: 0 } : navDropdownExitSpring }}
          transition={panelTransition}
        >
          <div className="pt-1" onBlur={onBlur}>
            <motion.div
              initial={false}
              animate={{ height: panelHeight }}
              transition={panelSizeTransition}
              onAnimationComplete={() => setIsPanelResizing(false)}
              className={cn(
                DROPDOWN_PANEL_SHELL_CLASS,
                overWhiteBackground && NAV_SURFACE_SHADOW_CLASS,
              )}
            >
              <div ref={contentRef} className={cn(DROPDOWN_PANEL_INNER_CLASS, "shrink-0")}>
                {showItemStagger ? (
                  <motion.ul
                    id={menuId}
                    role="menu"
                    aria-label={item.label}
                    className="flex shrink-0 flex-col"
                    style={NAV_BUTTON_STYLE}
                    variants={listVariants}
                    initial="closed"
                    animate="open"
                  >
                    {entries.map((entry) => (
                      <motion.li
                        key={entry.key}
                        role="none"
                        className="shrink-0"
                        variants={linkVariants}
                        transition={instant}
                      >
                        <NavDropdownListItem entry={entry} onClose={onClose} />
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <ul
                    id={menuId}
                    role="menu"
                    aria-label={item.label}
                    className="flex shrink-0 flex-col"
                    style={NAV_BUTTON_STYLE}
                  >
                    {entries.map((entry) => (
                      <li key={entry.key} role="none" className="shrink-0">
                        <NavDropdownListItem
                          entry={entry}
                          onClose={onClose}
                          simpleLabel={isPanelResizing}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NavDropdownTrigger;
