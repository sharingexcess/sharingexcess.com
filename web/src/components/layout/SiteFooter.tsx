import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export interface FooterNavSection {
  title: string;
  links: { label: string; href: string }[];
}

export interface SiteFooterProps {
  heading?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** 4 nav sections — first 2 are stacked in the left nav column */
  navSections?: FooterNavSection[];
  /** Certification badge images (e.g. Charity Navigator, Candid) */
  badges?: { src: string; alt: string }[];
  className?: string;
}

const LEGAL =
  'Sharing Excess is a registered 501(c)(3) nonprofit organization. Donations are tax-deductible. Nonprofit Tax ID/EIN: 86-2161466. "Sharing Excess" is a registered trademark, all rights reserved.';

/** Figma placeholder nav — real links go in Astro pages when content is finalized. */
export const DEFAULT_FOOTER_NAV_SECTIONS: FooterNavSection[] = [
  {
    title: "Section Title",
    links: [
      { label: "Lorem ipsum dolor", href: "#" },
      { label: "Emit descuptus amor", href: "#" },
      { label: "Conspectus samit", href: "#" },
      { label: "Lorem ipsum dolor", href: "#" },
    ],
  },
  {
    title: "Section Title",
    links: [
      { label: "Conspectus samit", href: "#" },
      { label: "Lorem ipsum dolor", href: "#" },
      { label: "Emit descuptus amor", href: "#" },
      { label: "Lorem ipsum dolor", href: "#" },
    ],
  },
  {
    title: "Section Title",
    links: [
      { label: "Lorem ipsum dolor", href: "#" },
      { label: "Emit descuptus amor", href: "#" },
      { label: "Lorem ipsum dolor", href: "#" },
      { label: "Conspectus samit", href: "#" },
    ],
  },
  {
    title: "Section Title",
    links: [
      { label: "Lorem ipsum dolor", href: "#" },
      { label: "Conspectus samit", href: "#" },
      { label: "Lorem ipsum dolor", href: "#" },
      { label: "Emit descuptus amor", href: "#" },
    ],
  },
];

export const DEFAULT_FOOTER_BADGES: NonNullable<SiteFooterProps["badges"]> = [
  {
    src: "/images/Four-Star-Rating-Badge---Full-Color_1.avif",
    alt: "",
  },
  { src: "/images/guidestar.svg", alt: "" },
];

export function SiteFooter({
  heading = "Lorem ipsum?",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  ctaLabel = "Contact Us",
  ctaHref = "/contact",
  navSections = DEFAULT_FOOTER_NAV_SECTIONS,
  badges = DEFAULT_FOOTER_BADGES,
  className,
}: SiteFooterProps) {
  // First 2 sections go in the left nav column, rest each get their own column
  const leftNavSections  = navSections.slice(0, 2);
  const rightNavSections = navSections.slice(2);

  return (
    <footer className={cn("w-full", className)}>
      <div
        data-theme="dark"
        className="overflow-hidden rounded-t-[var(--radius-md)] bg-[#00843d] lg:rounded-t-[var(--radius-lg)]"
      >

        {/* ── Main content ── */}
        <div className="flex flex-col gap-10 px-6 pb-10 pt-12 lg:flex-row lg:items-start lg:gap-[120px] lg:px-24 lg:pb-12 lg:pt-16">

          {/* Left: tagline + CTA + badges */}
          <div className="flex w-full shrink-0 flex-col gap-8 lg:w-[312px] lg:gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="font-sans text-[clamp(32px,8vw,72px)] font-medium leading-[1.06] tracking-[-0.04em] text-white lg:tracking-[-2.88px]">
                  {heading}
                </p>
                <p className="text-base leading-[1.4] text-white">
                  {description}
                </p>
              </div>
              <Button variant="secondary" colorScheme="dark" size="md" href={ctaHref} className="self-start">
                {ctaLabel}
              </Button>
            </div>
            {badges.length > 0 && (
              <div className="flex items-start gap-4">
                {badges.map((badge, index) => (
                  <img
                    key={`${badge.src}-${index}`}
                    src={badge.src}
                    alt={badge.alt}
                    className="h-16 w-auto object-contain"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: nav columns + legal */}
          <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:flex lg:items-start lg:gap-16">
              {/* Left nav column — up to 2 stacked sections */}
              {leftNavSections.length > 0 && (
                <div className="contents lg:flex lg:flex-col lg:gap-12">
                  {leftNavSections.map((section, index) => (
                    <NavSection key={`nav-left-${index}`} section={section} />
                  ))}
                </div>
              )}
              {/* Remaining columns — one section each */}
              {rightNavSections.map((section, index) => (
                <NavSection key={`nav-right-${index}`} section={section} />
              ))}
            </div>
            <p className="mt-8 text-[12px] leading-[1.4] text-white lg:mt-12">
              {LEGAL}
            </p>
          </div>
        </div>

        {/* ── Wordmark — no content padding, ~42px side margin matching Figma ── */}
        <div className="flex w-full items-center justify-center px-6 pt-16 lg:px-[42px] lg:pt-[120px]">
          <img src="/images/footer-logo.svg" alt="Sharing Excess" className="w-full" />
        </div>

      </div>
    </footer>
  );
}

function NavSection({ section }: { section: FooterNavSection }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-sm font-bold leading-[1.1] tracking-[-0.42px] text-white lg:text-[18px] lg:tracking-[-0.54px]">
        {section.title}
      </p>
      {section.links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-sm leading-[1.4] text-white no-underline hover:underline lg:text-base"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default SiteFooter;
