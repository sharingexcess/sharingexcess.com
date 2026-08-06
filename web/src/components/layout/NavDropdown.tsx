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
  navStackedExpandSpring,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  PLACEHOLDER_NAV_DROPDOWN_FEATURED,
  type NavDropdownArrowAccent,
  type NavDropdownFeatured,
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

/** Subtle elevation when the nav or dropdown sits over a light page background. */
export const NAV_SURFACE_SHADOW_CLASS = "shadow-[0_2px_12px_rgba(0,0,0,0.05)]";

/** Slightly stronger elevation when the header bar is visible after scroll-hide. */
export const NAV_SURFACE_SHADOW_VISIBLE_CLASS =
  "shadow-[0_3px_16px_rgba(0,0,0,0.07)]";

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
  // Always light — parent <nav> sets NAV_BUTTON_* CSS vars (kale/green).
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
  /** Matches header bar — shadow only when page content below is on a light background */
  overWhiteBackground?: boolean;
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

/** Raised scrim when stacked tile label wraps to two lines */
const STACKED_MULTILINE_SCRIM_GRADIENT =
  "linear-gradient(0.59deg, rgba(27,27,21,0.72) 4%, rgba(27,27,21,0.58) 34%, rgba(23,23,23,0) 74%)";

/** Compact stacked tiles — solid scrim over full image at rest */
const STACKED_SCRIM_COLOR = "rgba(27, 27, 21, 0.58)";

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

/** Hardcoded design-system fills for nav dropdown arrow buttons */
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
interface NavDropdownFeaturedCardProps {
  featured: NavDropdownFeatured;
  tilt: number;
  onClose: () => void;
}

function NavDropdownFeaturedCard({ featured, tilt, onClose }: NavDropdownFeaturedCardProps) {
  const reduceMotion = useReducedMotion();

  const cardShellClass =
    "nav-dropdown-featured-shell block h-60 w-full shrink-0 overflow-hidden rounded-[20px] no-underline";

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
        className={cn(
          "absolute bottom-4 right-4 z-10 flex size-12 items-center justify-center rounded-full",
          getNavDropdownArrowClass(featured.arrowAccent),
        )}
      >
        <NavDropdownFeaturedArrow />
      </motion.div>
    </div>
  );

  return (
    <motion.div
      className="w-full shrink-0"
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

const DROPDOWN_PANEL_PADDING_CLASS = "p-6";
const DROPDOWN_ITEM_GAP_CLASS = "gap-4";
const DROPDOWN_STACKED_GAP_CLASS = "gap-2";
const DROPDOWN_CARD_SLOT_CLASS = "flex min-w-0 flex-1 basis-0 items-start";
const DROPDOWN_TEXT_SLOT_CLASS = "flex shrink-0 items-start";

/** Compact stacked tile rest size → featured card size (1.125rem / 1.75rem) */
const STACKED_TEXT_SCALE = 1.125 / 1.75;
/** Compact stacked arrow rest size → featured arrow (32px / 48px) */
const STACKED_ARROW_SCALE = 8 / 12;
const STACKED_EXPAND_TRANSITION = (reduceMotion: boolean) =>
  reduceMotion ? { duration: 0 } : navStackedExpandSpring;

type StackedFeaturedVariant = "compact" | "tall";

interface NavDropdownStackedFeaturedColumnProps {
  links: Array<{
    label: string;
    href: string;
    featured: NonNullable<SiteHeaderNavItem["children"]>[number]["featured"];
  }>;
  variant?: StackedFeaturedVariant;
  onClose: () => void;
}

function getStackedFlexGrow(
  index: number,
  hoveredIndex: number | null,
  reduceMotion: boolean,
): number {
  if (reduceMotion || hoveredIndex === null) return 1;
  return hoveredIndex === index ? 1 : 0;
}

interface NavDropdownStackedFeaturedCardProps {
  featured: NavDropdownFeatured;
  isHoveredExpanded: boolean;
  isVisible: boolean;
  reduceMotion: boolean;
  variant: StackedFeaturedVariant;
}

function useStackedLabelMultiline(
  text: string,
  measure: boolean,
): { textRef: React.RefObject<HTMLParagraphElement | null>; isMultiline: boolean } {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  const update = useCallback(() => {
    const el = textRef.current;
    if (!el || !measure) {
      setIsMultiline(false);
      return;
    }

    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) return;

    setIsMultiline(el.scrollHeight > lineHeight * 1.35);
  }, [measure]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || !measure) {
      setIsMultiline(false);
      return;
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, measure, update]);

  useEffect(() => {
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return { textRef, isMultiline };
}

function NavDropdownStackedFeaturedCard({
  featured,
  isHoveredExpanded,
  isVisible,
  reduceMotion,
  variant,
}: NavDropdownStackedFeaturedCardProps) {
  const isCompact = variant === "compact";
  const measureMultiline = isCompact ? isHoveredExpanded : isVisible;
  const { textRef, isMultiline } = useStackedLabelMultiline(featured.text, measureMultiline);
  const scrimHeight = isMultiline ? "74%" : "55%";

  const scrim = isCompact && !isHoveredExpanded ? (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ backgroundColor: STACKED_SCRIM_COLOR }}
    />
  ) : (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
      animate={{ height: scrimHeight }}
      transition={STACKED_EXPAND_TRANSITION(reduceMotion)}
      style={{
        backgroundImage: isMultiline
          ? STACKED_MULTILINE_SCRIM_GRADIENT
          : FEATURED_SCRIM_GRADIENT,
      }}
    />
  );

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden">
      <img
        src={featured.imageSrc}
        alt={featured.imageAlt ?? ""}
        className={cn(
          "nav-dropdown-stacked-featured-image",
          featured.imageAlign === "bottom" && "nav-dropdown-stacked-featured-image--bottom",
        )}
      />
      {scrim}
      <motion.p
        ref={textRef}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isCompact && !isHoveredExpanded ? STACKED_TEXT_SCALE : 1,
        }}
        style={{ transformOrigin: "bottom left" }}
        transition={STACKED_EXPAND_TRANSITION(reduceMotion)}
        className="absolute inset-x-0 bottom-0 z-10 flex h-full items-end px-5 pb-5 pr-16 font-sans text-[1.75rem] font-medium leading-[1.06] tracking-[-0.04em] text-white"
      >
        {featured.text}
      </motion.p>
      <motion.div
        aria-hidden
        variants={featuredArrowVariants}
        className={cn(
          "absolute bottom-4 right-4 z-10 flex size-12 items-center justify-center rounded-full",
          getNavDropdownArrowClass(featured.arrowAccent),
        )}
        style={{ transformOrigin: "bottom right" }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isCompact && !isHoveredExpanded ? STACKED_ARROW_SCALE : 1,
        }}
        transition={STACKED_EXPAND_TRANSITION(reduceMotion)}
      >
        <NavDropdownFeaturedArrow />
      </motion.div>
    </div>
  );
}

function NavDropdownStackedFeaturedColumn({
  links,
  variant = "compact",
  onClose,
}: NavDropdownStackedFeaturedColumnProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const isAccordionActive = hoveredIndex !== null;

  return (
    <div
      className={cn(
        "nav-dropdown-stacked-featured-column flex w-full shrink-0 flex-col",
        !isAccordionActive && DROPDOWN_STACKED_GAP_CLASS,
      )}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {links.map((link, index) => {
        const isHoveredExpanded = hoveredIndex === index;
        const isVisible = hoveredIndex === null || isHoveredExpanded;
        const featured = {
          imageSrc: link.featured!.imageSrc,
          imageAlt: link.featured!.imageAlt,
          text: link.label,
          href: link.href,
          arrowAccent: link.featured!.arrowAccent,
          imageAlign: link.featured!.imageAlign,
        };

        const card = (
          <NavDropdownStackedFeaturedCard
            featured={featured}
            isHoveredExpanded={isHoveredExpanded}
            isVisible={isVisible}
            reduceMotion={!!reduceMotion}
            variant={variant}
          />
        );

        return (
          <motion.div
            key={link.href}
            className="min-h-0 shrink basis-0 overflow-hidden rounded-[16px]"
            animate={{
              flexGrow: getStackedFlexGrow(index, hoveredIndex, reduceMotion),
              opacity: isVisible ? 1 : 0,
            }}
            transition={STACKED_EXPAND_TRANSITION(reduceMotion)}
            aria-hidden={!isVisible}
          >
            {featured.href ? (
              <a
                href={featured.href}
                className={cn(
                  "block h-full min-h-0 w-full no-underline",
                  !isVisible && "pointer-events-none",
                )}
                onClick={onClose}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                tabIndex={isVisible ? undefined : -1}
              >
                {card}
              </a>
            ) : (
              <div
                className="block h-full min-h-0 w-full"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {card}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Detached full-width dropdown panel — matches navbar width, floats below with a gap. */
export function NavDropdownPanel({
  item,
  navIndex,
  open,
  onClose,
  showSecondaryFeatured = false,
  overWhiteBackground = false,
}: NavDropdownPanelProps) {
  const menuId = useId();
  const reduceMotion = useReducedMotion();
  const links = item?.children ?? [];
  const featured = item?.featured ?? PLACEHOLDER_NAV_DROPDOWN_FEATURED;
  const secondaryFeatured = item?.secondaryFeatured;
  const featuredTilt = navIndex !== null ? getFeaturedTilt(navIndex) : FEATURED_TILT_OUTER;
  const standardFeaturedChildLinks = links.filter(
    (link) =>
      link.featured &&
      link.featuredLayout !== "stacked" &&
      link.featuredLayout !== "stacked-tall",
  );
  const stackedFeaturedLinks = links.filter(
    (link) =>
      link.featured &&
      (link.featuredLayout === "stacked" || link.featuredLayout === "stacked-tall"),
  );
  const stackedFeaturedVariant: StackedFeaturedVariant =
    stackedFeaturedLinks[0]?.featuredLayout === "stacked-tall" ? "tall" : "compact";
  const textLinks = links.filter((link) => !link.featured);
  const stackedFeaturedLast = item?.stackedFeaturedLast ?? false;
  const instant = reduceMotion ? { duration: 0 } : undefined;

  const stackedFeaturedColumn =
    stackedFeaturedLinks.length > 0 ? (
      <motion.div
        role="none"
        variants={linkVariants}
        transition={instant}
        className={DROPDOWN_CARD_SLOT_CLASS}
      >
        <NavDropdownStackedFeaturedColumn
          links={stackedFeaturedLinks}
          variant={stackedFeaturedVariant}
          onClose={onClose}
        />
      </motion.div>
    ) : null;

  const standardFeaturedColumns = standardFeaturedChildLinks.map((link) => (
    <motion.div
      key={link.href}
      role="none"
      variants={linkVariants}
      transition={instant}
      className={DROPDOWN_CARD_SLOT_CLASS}
    >
      <NavDropdownFeaturedCard
        featured={{
          imageSrc: link.featured!.imageSrc,
          imageAlt: link.featured!.imageAlt,
          text: link.label,
          href: link.href,
          arrowAccent: link.featured!.arrowAccent,
        }}
        tilt={featuredTilt}
        onClose={onClose}
      />
    </motion.div>
  ));

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
                "overflow-hidden rounded-[var(--radius-xl)] bg-neutral-000",
                DROPDOWN_PANEL_PADDING_CLASS,
                overWhiteBackground && NAV_SURFACE_SHADOW_CLASS,
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.label}
                  className={cn("flex w-full items-start", DROPDOWN_ITEM_GAP_CLASS)}
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
                    className={DROPDOWN_CARD_SLOT_CLASS}
                  >
                    <NavDropdownFeaturedCard
                      featured={featured}
                      tilt={featuredTilt}
                      onClose={onClose}
                    />
                  </motion.div>

                  {showSecondaryFeatured && secondaryFeatured && (
                    <motion.div
                      role="none"
                      variants={linkVariants}
                      transition={instant}
                      className={DROPDOWN_CARD_SLOT_CLASS}
                    >
                      <NavDropdownFeaturedCard
                        featured={secondaryFeatured}
                        tilt={featuredTilt}
                        onClose={onClose}
                      />
                    </motion.div>
                  )}

                  {stackedFeaturedLast ? (
                    <>
                      {standardFeaturedColumns}
                      {stackedFeaturedColumn}
                    </>
                  ) : (
                    <>
                      {stackedFeaturedColumn}
                      {standardFeaturedColumns}
                    </>
                  )}

                  {textLinks.length > 0 && (
                    <div
                      id={menuId}
                      role="menu"
                      aria-label={item.label}
                      className={DROPDOWN_TEXT_SLOT_CLASS}
                    >
                      <ul className={cn("flex w-auto shrink-0 flex-col", DROPDOWN_ITEM_GAP_CLASS)}>
                        {textLinks.map((link, index) => (
                          <motion.li
                            key={`${item.label}-text-${index}`}
                            role="none"
                            variants={linkVariants}
                            transition={instant}
                          >
                            <Button
                              role="menuitem"
                              variant="tertiary"
                              size="md"
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
                    </div>
                  )}
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
