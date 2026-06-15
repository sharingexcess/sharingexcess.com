import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export interface SiteHeaderNavItem {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  className?: string;
  logoLabel?: string;
  navItems?: SiteHeaderNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_NAV_ITEMS: SiteHeaderNavItem[] = [
  { label: "Menu Item", href: "#" },
  { label: "Menu Item", href: "#" },
  { label: "Menu Item", href: "#" },
  { label: "Menu Item", href: "#" },
];

/** Figma node 1052:2970 — NavigationBar option 1 (desktop). */
export function SiteHeader({
  className,
  logoLabel = "Sharing Excess",
  navItems = DEFAULT_NAV_ITEMS,
  ctaLabel = "Primary Action",
  ctaHref = "#",
}: SiteHeaderProps) {
  return (
    <header className={cn("w-full px-8 py-4", className)}>
      <div
        className={cn(
          "mx-auto flex max-w-[1320px] items-center justify-between gap-6",
          "rounded-[var(--radius-xl)] bg-neutral-000 px-8 py-4",
          "shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        )}
      >
        <a href="/" className="flex shrink-0 items-center gap-[6px] no-underline">
          <span
            aria-hidden
            className="size-6 shrink-0 rounded-[6px] bg-se-green"
          />
          <span className="font-sans text-[28px] font-semibold leading-[1.06] tracking-[-1.12px] text-se-green">
            {logoLabel}
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-6">
          <nav
            className="flex items-center gap-8 text-[15px] leading-[1.4] text-kale"
            aria-label="Main"
          >
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="whitespace-nowrap text-kale no-underline hover:text-se-green"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button variant="primary" size="sm" href={ctaHref}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
