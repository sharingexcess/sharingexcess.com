import { cn } from "@/lib/cn";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useHeaderOverHomeHero } from "@/lib/useHeaderOverHomeHero";
import { useHideOnScroll } from "@/lib/useHideOnScroll";
import { Button } from "@/components/ui/Button";
import { MenuToggle } from "@/components/layout/MenuToggle";
import { MobileNavPanel } from "@/components/layout/MobileNavPanel";
import { NavDropdownPanel, NavDropdownTrigger, NAV_BUTTON_GLASS_STYLE, NAV_BUTTON_STYLE } from "@/components/layout/NavDropdown";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export interface SiteHeaderNavLink {
  label: string;
  href: string;
}

export interface NavDropdownFeatured {
  imageSrc: string;
  imageAlt?: string;
  text: string;
  href?: string;
}

export interface SiteHeaderNavItem {
  label: string;
  href: string;
  children?: SiteHeaderNavLink[];
  featured?: NavDropdownFeatured;
  /** Optional second featured card — only shown when `showSecondaryFeatured` is enabled */
  secondaryFeatured?: NavDropdownFeatured;
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
}

export const DEFAULT_NAV_ITEMS: SiteHeaderNavItem[] = [
  {
    label: "About",
    href: "/about",
    children: PLACEHOLDER_NAV_DROPDOWN_LINKS,
    featured: PLACEHOLDER_NAV_DROPDOWN_FEATURED,
  },
  {
    label: "Get Involved",
    href: "/get-involved/volunteer",
    children: PLACEHOLDER_NAV_DROPDOWN_LINKS,
    featured: PLACEHOLDER_NAV_DROPDOWN_FEATURED,
  },
  {
    label: "Find Food",
    href: "/find-food",
    children: PLACEHOLDER_NAV_DROPDOWN_LINKS,
    featured: PLACEHOLDER_NAV_DROPDOWN_FEATURED,
  },
];

const MOBILE_NAV_ID = "site-mobile-nav";

/** Liquid glass frost — matches ghost button (Figma 1010:1302) at nav-bar scale. */
function HeaderGlassLayers() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/[0.10] backdrop-blur-md"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/12 via-transparent to-black/[0.06]"
      />
    </>
  );
}

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
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState<number | null>(null);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isHomePage, setIsHomePage] = useState(
    () => typeof window !== "undefined" && window.location.pathname === "/",
  );
  const overHomeHero = useHeaderOverHomeHero();
  const scrollVisible = useHideOnScroll({ enabled: isHomePage });
  const visible = isHomePage ? scrollVisible || menuOpen || isMobileViewport : true;
  const glassOverHero = isHomePage && overHomeHero && !menuOpen;

  useBodyScrollLock(menuOpen);

  useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobileViewport(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const syncPath = () => {
      setIsHomePage(window.location.pathname === "/");
    };
    document.addEventListener("astro:after-swap", syncPath);
    syncPath();
    return () => document.removeEventListener("astro:after-swap", syncPath);
  }, []);

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

  const headerInteractive = visible || isMobileViewport;

  return (
    <header
      data-site-header
      data-visible={visible}
      data-over-hero={glassOverHero || undefined}
      data-menu-open={menuOpen || undefined}
      className={cn(
        "site-header-shell fixed inset-x-0 top-0 z-50 w-full bg-transparent px-4 py-3 lg:px-8 lg:py-4",
        !visible && "site-header-shell--hidden",
        className,
      )}
      aria-hidden={headerInteractive ? undefined : true}
      inert={headerInteractive ? undefined : true}
    >
      <div
        className="relative mx-auto max-w-[1320px]"
        onMouseLeave={closeNavDropdown}
      >
        <div
          className={cn(
            "relative isolate rounded-[var(--radius-xl)] px-4 py-3 transition-[background-color,box-shadow,border-color] duration-300 lg:px-8 lg:py-4",
            glassOverHero
              ? "border border-white/25 shadow-[0_2px_12px_rgba(0,0,0,0.16)]"
              : "border border-transparent bg-neutral-000 shadow-[0_2px_12px_rgba(0,0,0,0.12)]",
            menuOpen && "z-50",
          )}
        >
          {glassOverHero && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            >
              <HeaderGlassLayers />
            </div>
          )}
          <div className="relative z-10 flex items-center justify-between gap-4 lg:gap-6">
        <a
          href="/"
          className="flex shrink-0 items-center gap-[6px] no-underline text-se-green lg:text-[24px]"
        >
          <img
            src="/images/se-icon-green.png"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-[6px] lg:h-[1.06em] lg:w-[1.06em] lg:min-w-[1.06em]"
          />
          <span className="font-sans text-[22px] font-semibold leading-[1.06] tracking-[-0.04em] lg:text-[inherit]">
            {logoLabel}
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-4 lg:gap-6">
          <nav
            className="hidden items-center gap-6 lg:flex"
            style={glassOverHero ? NAV_BUTTON_GLASS_STYLE : NAV_BUTTON_STYLE}
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
                onMouseEnter={() => setHoveredNavIndex(index)}
              >
                <NavDropdownTrigger
                  item={item}
                  active={activeNavIndex === index}
                  onActivate={() => setActiveNavIndex(index)}
                />
              </div>
            ))}
          </nav>

          <div
            className="hidden items-center gap-2 lg:flex"
            style={glassOverHero ? NAV_BUTTON_GLASS_STYLE : undefined}
          >
            <Button
              variant="secondary"
              size="sm"
              colorScheme={glassOverHero ? "dark" : "light"}
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
            inverted={glassOverHero}
            className="lg:hidden"
          />
        </div>
        </div>
        </div>

        <NavDropdownPanel
          item={activeNavItem}
          navIndex={activeNavIndex}
          open={navDropdownOpen}
          onClose={closeNavDropdown}
          showSecondaryFeatured={showSecondaryFeatured}
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
