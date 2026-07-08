import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  motion,
  navDropdownExitSpring,
  navDropdownLinkSpring,
  navDropdownSpring,
  navFeaturedArrowSpring,
  navFeaturedTiltSpring,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";
import { useCallback, useId } from "react";
import {
  PLACEHOLDER_NAV_DROPDOWN_FEATURED,
  type NavDropdownFeatured,
  type SiteHeaderNavItem,
} from "./SiteHeader";

/** Kale rest → se-green hover; shared by nav triggers and dropdown links. */
export const NAV_BUTTON_STYLE = {
  "--section-btn": "var(--color-kale, #003619)",
  "--section-btn-hover": "var(--color-se-green-base, #00843d)",
} as React.CSSProperties;

/** Frosted hero nav — white at rest and on hover for contrast on glass. */
export const NAV_BUTTON_GLASS_STYLE = {
  "--section-btn": "var(--color-neutral-000, #ffffff)",
  "--section-btn-hover": "var(--color-neutral-000, #ffffff)",
} as React.CSSProperties;

export const NAV_BUTTON_CLASS = "font-normal";

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
  // Always light — parent <nav> sets NAV_BUTTON_* CSS vars (white on glass, kale/green on solid).
  const colorScheme = "light";

  if (children.length === 0) {
    return (
      <Button
        variant="tertiary"
        size="sm"
        colorScheme={colorScheme}
        href={item.href}
        active={active}
        className={NAV_BUTTON_CLASS}
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
        className={NAV_BUTTON_CLASS}
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
  /** When true, renders `item.secondaryFeatured` alongside the primary featured card */
  showSecondaryFeatured?: boolean;
}

const panelVariants: Variants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.94,
    transition: navDropdownExitSpring,
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: navDropdownSpring,
  },
};

const listVariants: Variants = {
  closed: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
  open: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.12,
    },
  },
};

const linkVariants: Variants = {
  closed: {
    opacity: 0,
    y: 12,
  },
  open: {
    opacity: 1,
    y: 0,
    transition: navDropdownLinkSpring,
  },
};

/** Figma StatCard image scrim — node 980:1057, dark anchored to the bottom */
const FEATURED_SCRIM_GRADIENT =
  "linear-gradient(0.59deg, rgba(27,27,21,0.62) 4%, rgba(27,27,21,0.48) 28%, rgba(23,23,23,0) 52%)";

const FEATURED_TILT_MIDDLE = -2;
const FEATURED_TILT_OUTER = 2;

/** Alternate tilt direction — middle nav item tilts left, others tilt right */
export function getFeaturedTilt(navIndex: number): number {
  return navIndex % 2 === 1 ? FEATURED_TILT_MIDDLE : FEATURED_TILT_OUTER;
}

const featuredCardVariants = (tilt: number): Variants => ({
  rest: { rotate: 0 },
  hover: {
    rotate: tilt,
    transition: navFeaturedTiltSpring,
  },
});

const featuredArrowVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.12,
    transition: navFeaturedArrowSpring,
  },
};

function NavDropdownFeaturedArrow() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 43 43"
      fill="none"
      className="block shrink-0"
      aria-hidden
    >
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
function splitLinksIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  const perColumn = Math.ceil(items.length / columnCount);

  items.forEach((item, index) => {
    const columnIndex = Math.min(Math.floor(index / perColumn), columnCount - 1);
    columns[columnIndex].push(item);
  });

  return columns;
}

interface NavDropdownFeaturedCardProps {
  featured: NavDropdownFeatured;
  tilt: number;
  onClose: () => void;
}

function NavDropdownFeaturedCard({ featured, tilt, onClose }: NavDropdownFeaturedCardProps) {
  const reduceMotion = useReducedMotion();

  const cardShellClass =
    "nav-dropdown-featured-shell block h-60 w-[300px] shrink-0 overflow-hidden rounded-[20px] no-underline";

  const card = (
    <div className="relative h-full w-full">
      <img
        src={featured.imageSrc}
        alt={featured.imageAlt ?? ""}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%]"
        style={{ backgroundImage: FEATURED_SCRIM_GRADIENT }}
      />
      <p className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pr-16 font-sans text-[1.75rem] font-medium leading-[1.06] tracking-[-0.04em] text-white">
        {featured.text}
      </p>
      <motion.div
        aria-hidden
        variants={featuredArrowVariants}
        className="absolute bottom-4 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white text-kale"
      >
        <NavDropdownFeaturedArrow />
      </motion.div>
    </div>
  );

  return (
    <motion.div
      className="shrink-0"
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      variants={featuredCardVariants(tilt)}
    >
      {featured.href ? (
        <a href={featured.href} className={cardShellClass} onClick={onClose}>
          {card}
        </a>
      ) : (
        <div className={cardShellClass}>{card}</div>
      )}
    </motion.div>
  );
}

/** Detached full-width dropdown panel — matches navbar width, floats below with a gap. */
export function NavDropdownPanel({
  item,
  navIndex,
  open,
  onClose,
  showSecondaryFeatured = false,
}: NavDropdownPanelProps) {
  const menuId = useId();
  const reduceMotion = useReducedMotion();
  const links = item?.children ?? [];
  const featured = item?.featured ?? PLACEHOLDER_NAV_DROPDOWN_FEATURED;
  const secondaryFeatured = item?.secondaryFeatured;
  const featuredTilt = navIndex !== null ? getFeaturedTilt(navIndex) : FEATURED_TILT_OUTER;
  const [leftLinks, rightLinks] = splitLinksIntoColumns(links, 2);
  const instant = reduceMotion ? { duration: 0 } : undefined;

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
          className="absolute inset-x-0 top-full z-50 hidden origin-top lg:block"
          initial="closed"
          animate="open"
          exit="closed"
          variants={panelVariants}
          transition={instant}
        >
          <div className="pt-2" onBlur={onBlur}>
            <div
              className={cn(
                "overflow-hidden rounded-[var(--radius-md)] border border-neutral-200/80",
                "bg-neutral-000 px-4 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] lg:px-8 lg:py-6",
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.label}
                  className="flex items-start gap-8 lg:gap-12"
                  style={NAV_BUTTON_STYLE}
                  variants={listVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <motion.div
                    role="none"
                    variants={linkVariants}
                    transition={instant}
                    className="flex shrink-0 items-start gap-4"
                  >
                    <NavDropdownFeaturedCard
                      featured={featured}
                      tilt={featuredTilt}
                      onClose={onClose}
                    />
                    {showSecondaryFeatured && secondaryFeatured && (
                      <NavDropdownFeaturedCard
                        featured={secondaryFeatured}
                        tilt={featuredTilt}
                        onClose={onClose}
                      />
                    )}
                  </motion.div>

                  <div
                    id={menuId}
                    role="menu"
                    aria-label={item.label}
                    className="flex items-start gap-8 lg:gap-12"
                  >
                    {[leftLinks, rightLinks].map((columnLinks, columnIndex) => (
                      <ul
                        key={`${item.label}-col-${columnIndex}`}
                        className="flex w-auto shrink-0 flex-col gap-4"
                      >
                        {columnLinks.map((link, index) => (
                          <motion.li
                            key={`${item.label}-${columnIndex}-${index}`}
                            role="none"
                            variants={linkVariants}
                            transition={instant}
                          >
                          <Button
                            role="menuitem"
                            variant="tertiary"
                            size="sm"
                            colorScheme="light"
                            href={link.href}
                            className={NAV_BUTTON_CLASS}
                            simpleLabel
                            onClick={onClose}
                          >
                              {link.label}
                            </Button>
                          </motion.li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NavDropdownTrigger;
