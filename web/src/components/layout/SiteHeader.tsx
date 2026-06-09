import { cn } from "@/lib/cn";

export interface SiteHeaderProps {
  className?: string;
}

/** Site navigation — stub; add client:load when mobile menu is implemented. */
export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-neutral-200 bg-se-green-700 px-6 py-4 text-neutral-000",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <a href="/" className="text-lg font-semibold text-neutral-000 no-underline">
          Sharing Excess
        </a>
        <nav className="hidden gap-6 text-sm font-medium md:flex" aria-label="Main">
          <a href="/about" className="text-neutral-000 no-underline hover:text-bright-kelly">
            About
          </a>
          <a href="/get-involved" className="text-neutral-000 no-underline hover:text-bright-kelly">
            Get Involved
          </a>
          <a href="/contact" className="text-neutral-000 no-underline hover:text-bright-kelly">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
