import { cn } from "@/lib/cn";
import { isHomePagePath } from "@/lib/isHomePagePath";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useHideOnScroll } from "@/lib/useHideOnScroll";
import { Button } from "@/components/ui/Button";
import { MenuToggle } from "@/components/layout/MenuToggle";
import { MobileNavPanel } from "@/components/layout/MobileNavPanel";
import {
  NavDropdownPanel,
  NavDropdownTrigger,
  NAV_BUTTON_STYLE,
  NAV_SURFACE_SHADOW_CLASS,
} from "@/components/layout/NavDropdown";
import {
  homeNavEnterDelay,
  homeNavEnterSpring,
  motion,
  useReducedMotion,
} from "@/lib/motion";
import { useIntroRevealed } from "@/lib/useIntroRevealed";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHeaderOverWhiteBackground } from "@/lib/useHeaderOverWhiteBackground";

/** Design-system accent for nav dropdown arrow buttons — hardcoded per card, not derived from images */
export type NavDropdownArrowAccent =
  | "se-green"
  | "bright-kelly"
  | "tangerine"
  | "banana"
  | "blueberry"
  | "guava";

export interface SiteHeaderNavLink {
  label: string;
  href: string;
  /** When set, renders as an image tile in the desktop dropdown instead of a text link */
  featured?: Pick<NavDropdownFeatured, "imageSrc" | "imageAlt" | "arrowAccent">;
  /** `stacked` — compact accordion tiles; `stacked-tall` — full-size labels with gradient scrim */
  featuredLayout?: "standard" | "stacked" | "stacked-tall";
}

export interface NavDropdownFeatured {
  imageSrc: string;
  imageAlt?: string;
  text: string;
  href?: string;
  arrowAccent?: NavDropdownArrowAccent;
}

export interface SiteHeaderNavItem {
  label: string;
  href: string;
  children?: SiteHeaderNavLink[];
  featured?: NavDropdownFeatured;
  /** Optional second featured card — only shown when `showSecondaryFeatured` is enabled */
  secondaryFeatured?: NavDropdownFeatured;
  /** When true, stacked featured links render after standard featured cards (e.g. About Us) */
  stackedFeaturedLast?: boolean;
}

/** Figma placeholder links — real links go in Astro pages when content is finalized. */
export const PLACEHOLDER_NAV_DROPDOWN_LINKS: SiteHeaderNavLink[] = [
  { label: "Lorem ipsum dolor", href: "#" },
  { label: "Emit descuptus amor", href: "#" },
  { label: "Conspectus samit", href: "#" },
  { label: "Nunc vulputate libero", href: "#" },
  { label: "Velit interdum ac", href: "#" },
  { label: "Aliquet odio mattis", href: "#" },
];

/** Figma placeholder featured card — real copy goes in Astro pages when content is finalized. */
export const PLACEHOLDER_NAV_DROPDOWN_FEATURED: NavDropdownFeatured = {
  imageSrc: "/images/peppers.jpg",
  imageAlt: "",
  text: "Lorem ipsum",
  href: "#",
};

/** Figma placeholder secondary featured card — opt-in via `showSecondaryFeatured`. */
export const PLACEHOLDER_NAV_DROPDOWN_SECONDARY_FEATURED: NavDropdownFeatured = {
  imageSrc: "/images/oranges.jpg",
  imageAlt: "",
  text: "Dolor sit",
  href: "#",
};

export interface SiteHeaderProps {
  className?: string;
  logoLabel?: string;
  navItems?: SiteHeaderNavItem[];
  /** When true, renders `secondaryFeatured` alongside the primary featured card */
  showSecondaryFeatured?: boolean;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Server-known home route — enables scroll-hide and hero sizing on first paint */
  isHomePage?: boolean;
}

export const DEFAULT_NAV_ITEMS: SiteHeaderNavItem[] = [
  {
    label: "Find Food",
    href: "/find-food",
  },
  {
    label: "Get Involved",
    href: "/get-involved",
    children: [
      {
        label: "For Food Businesses",
        href: "/get-involved/partners#food-business",
        featured: {
          imageSrc: "/images/Screen-Shot-2023-07-17-at-8.32.43-PM_1.avif",
          imageAlt: "",
          arrowAccent: "se-green",
        },
        featuredLayout: "stacked",
      },
      {
        label: "For Community Organizations",
        href: "/get-involved/partners#community-orgs",
        featured: {
          imageSrc: "/images/fall-food-featured-photo-1-1160x680.remini-enhanced_1.avif",
          imageAlt: "",
          arrowAccent: "banana",
        },
        featuredLayout: "stacked",
      },
      {
        label: "For Foundations",
        href: "/get-involved/partners#foundations",
        featured: {
          imageSrc: "/images/Screen-Shot-2023-07-17-at-9.09.58-PM.remini-enhanced_1.avif",
          imageAlt: "",
          arrowAccent: "blueberry",
        },
        featuredLayout: "stacked",
      },
      {
        label: "Give Monthly",
        href: "/collective",
        featured: {
          imageSrc: "/images/collective_footer_image_1.avif",
          imageAlt: "",
          arrowAccent: "guava",
        },
      },
      {
        label: "Volunteer",
        href: "/get-involved/volunteer",
        featured: {
          imageSrc: "/images/freefood-volunteer.jpg",
          imageAlt: "",
          arrowAccent: "bright-kelly",
        },
      },
    ],
    featured: {
      imageSrc: "/images/get-involved.jpg",
      imageAlt: "",
      text: "Get Involved",
      href: "/get-involved",
      arrowAccent: "tangerine",
    },
  },
  {
    label: "About Us",
    href: "/about",
    stackedFeaturedLast: true,
    children: [
      {
        label: "Our Impact",
        href: "/about/impact",
        featured: {
          imageSrc: "/images/Screen-Shot-2023-07-17-at-6.44.52-PM_1.avif",
          imageAlt: "",
          arrowAccent: "banana",
        },
      },
      {
        label: "Our Model",
        href: "/about",
        featured: {
          imageSrc: "/images/54178994461_4d4abdca3b_k_1.avif",
          imageAlt: "",
          arrowAccent: "tangerine",
        },
      },
      {
        label: "Our Team",
        href: "/about/team",
        featured: {
          imageSrc: "/images/team.jpg",
          imageAlt: "",
          arrowAccent: "guava",
        },
        featuredLayout: "stacked-tall",
      },
      {
        label: "Our Financials",
        href: "/about/financials",
        featured: {
          imageSrc: "/images/financials.jpg",
          imageAlt: "",
          arrowAccent: "blueberry",
        },
        featuredLayout: "stacked-tall",
      },
    ],
    featured: {
      imageSrc: "/images/about.png",
      imageAlt: "",
      text: "About Us",
      href: "/about",
      arrowAccent: "se-green",
    },
  },
  {
    label: "Closing the Gap",
    href: "/about/problem",
  },
];

const MOBILE_NAV_ID = "site-mobile-nav";

const LOGO_ICON_SRC = "/images/se-icon-green.png";

const HEADER_BAR_TRANSITION =
  "transition-[background-color,box-shadow,border-color,border-radius,padding,max-width] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none";

const STANDARD_NAV_MAX_WIDTH = "max-w-[1320px]";

const HEADER_BAR_CLASS =
  "relative isolate rounded-[var(--radius-3xl)] border border-transparent bg-neutral-000 px-4 py-2.5 lg:px-8 lg:py-4";

/** Figma node 1052:2970 — NavigationBar option 1 (desktop + mobile overlay). */
export function SiteHeader({
  className,
  logoLabel = "Sharing Excess",
  navItems = DEFAULT_NAV_ITEMS,
  showSecondaryFeatured = false,
  secondaryCtaLabel = "Log In",
  secondaryCtaHref = "https://app.sharingexcess.com/sign-in",
  ctaLabel = "Donate",
  ctaHref = "/?form=donate",
  isHomePage: isHomePageProp = false,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const overWhiteBackground = useHeaderOverWhiteBackground(headerBarRef);
  const [activeNavIndex, setActiveNavIndex] = useState<number | null>(null);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const [isHomePage, setIsHomePage] = useState(isHomePageProp);
  const reduceMotion = useReducedMotion();
  const introRevealed = useIntroRevealed();
  const [homeEnterKey, setHomeEnterKey] = useState(0);
  const scrollVisible = useHideOnScroll({ enabled: isHomePage });
  const visible = isHomePage ? scrollVisible || menuOpen : true;
  const animateHomeNav = isHomePage && !reduceMotion && introRevealed;
  const homeNavEnter = isHomePage && !reduceMotion;

  useBodyScrollLock(menuOpen);

  useEffect(() => {
    const syncPath = () => {
      setIsHomePage(isHomePagePath(window.location.pathname));
    };
    document.addEventListener("astro:after-swap", syncPath);
    syncPath();
    return () => document.removeEventListener("astro:after-swap", syncPath);
  }, []);

  useEffect(() => {
    const replayHomeEnter = () => {
      if (isHomePagePath(window.location.pathname) && !reduceMotion) {
        setHomeEnterKey((key) => key + 1);
      }
    };
    document.addEventListener("astro:after-swap", replayHomeEnter);
    return () => document.removeEventListener("astro:after-swap", replayHomeEnter);
  }, [reduceMotion]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeNavDropdown = useCallback(() => setActiveNavIndex(null), []);

  const activeNavItem = activeNavIndex !== null ? navItems[activeNavIndex] : null;
  const navDropdownOpen =
    activeNavIndex !== null && (activeNavItem?.children?.length ?? 0) > 0;
  const focusedNavIndex = hoveredNavIndex ?? activeNavIndex;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeNavDropdown();
      if (menuOpen) closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu, closeNavDropdown]);

  useEffect(() => {
    // Close dropdown + menu the moment a link is clicked (before-preparation),
    // so the nav is never open when the new page content arrives.
    const closeAll = () => {
      closeMenu();
      closeNavDropdown();
    };
    document.addEventListener("astro:before-preparation", closeAll);
    document.addEventListener("astro:after-swap", closeAll);
    return () => {
      document.removeEventListener("astro:before-preparation", closeAll);
      document.removeEventListener("astro:after-swap", closeAll);
    };
  }, [closeMenu, closeNavDropdown]);

  const headerInteractive = visible || menuOpen;

  return (
    <header
      data-site-header
      data-visible={visible}
      data-menu-open={menuOpen || undefined}
      className={cn(
        "site-header-shell fixed inset-x-0 top-0 z-50 w-full bg-transparent px-4 py-2.5 lg:px-8 lg:py-4",
        !visible && "site-header-shell--hidden",
        className,
      )}
      aria-hidden={headerInteractive ? undefined : true}
      inert={headerInteractive ? undefined : true}
    >
      <div
        className={cn(
          "relative z-10 mx-auto w-full",
          HEADER_BAR_TRANSITION,
          STANDARD_NAV_MAX_WIDTH,
        )}
        onMouseLeave={closeNavDropdown}
      >
        <motion.div
          key={animateHomeNav ? homeEnterKey : undefined}
          ref={headerBarRef}
          data-header-bar
          initial={homeNavEnter ? { opacity: 0, y: -14 } : false}
          animate={
            homeNavEnter && !introRevealed
              ? { opacity: 0, y: -14 }
              : { opacity: 1, y: 0 }
          }
          transition={{
            ...homeNavEnterSpring,
            delay: homeNavEnter && introRevealed ? homeNavEnterDelay : 0,
          }}
          className={cn(
            HEADER_BAR_CLASS,
            HEADER_BAR_TRANSITION,
            overWhiteBackground && NAV_SURFACE_SHADOW_CLASS,
            menuOpen && "z-50",
          )}
        >
          <div className="relative flex items-center justify-between gap-4 lg:gap-6">
        <a
          href="/"
          className="flex shrink-0 items-center gap-[6px] text-[20px] text-se-green no-underline min-[360px]:text-[22px] lg:text-[24px]"
        >
          <img
            src={LOGO_ICON_SRC}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-[6px] lg:h-[1.06em] lg:w-[1.06em] lg:min-w-[1.06em]"
          />
          <span
            className="font-sans text-[20px] font-semibold leading-[1.06] tracking-[-0.04em] text-se-green min-[360px]:text-[22px] lg:text-[inherit]"
          >
            {logoLabel}
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-4 lg:gap-6">
          <nav
            className="hidden items-center gap-6 lg:flex"
            style={NAV_BUTTON_STYLE}
            aria-label="Main"
            onMouseLeave={() => setHoveredNavIndex(null)}
          >
            {navItems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "transition-opacity duration-200",
                  focusedNavIndex !== null && focusedNavIndex !== index && "opacity-50",
                )}
                onMouseEnter={() => {
                  setHoveredNavIndex(index);
                  if ((item.children?.length ?? 0) > 0) {
                    setActiveNavIndex(index);
                  } else {
                    closeNavDropdown();
                  }
                }}
              >
                <NavDropdownTrigger
                  item={item}
                  active={activeNavIndex === index}
                  onActivate={() => setActiveNavIndex(index)}
                />
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="secondary"
              size="sm"
              colorScheme="light"
              href={secondaryCtaHref}
            >
              {secondaryCtaLabel}
            </Button>

            <Button
              variant="primary"
              size="sm"
              colorScheme="light"
              href={ctaHref}
            >
              {ctaLabel}
            </Button>
          </div>

          <MenuToggle
            open={menuOpen}
            onToggle={toggleMenu}
            controlsId={MOBILE_NAV_ID}
            className="lg:hidden"
          />
        </div>
        </div>
        </motion.div>

        <NavDropdownPanel
          item={activeNavItem}
          navIndex={activeNavIndex}
          open={navDropdownOpen}
          onClose={closeNavDropdown}
          showSecondaryFeatured={showSecondaryFeatured}
          overWhiteBackground={overWhiteBackground}
        />
      </div>

      <MobileNavPanel
        open={menuOpen}
        navItems={navItems}
        secondaryCtaLabel={secondaryCtaLabel}
        secondaryCtaHref={secondaryCtaHref}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        onClose={closeMenu}
        panelId={MOBILE_NAV_ID}
      />
    </header>
  );
}

export default SiteHeader;
