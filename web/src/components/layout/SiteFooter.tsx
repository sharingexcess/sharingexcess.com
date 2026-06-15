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

export function SiteFooter({
  heading = "Lorem ipsum?",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  ctaLabel = "Contact Us",
  ctaHref = "/contact",
  navSections = [],
  badges = [],
  className,
}: SiteFooterProps) {
  // First 2 sections go in the left nav column, rest each get their own column
  const leftNavSections  = navSections.slice(0, 2);
  const rightNavSections = navSections.slice(2);

  return (
    <footer className={cn("w-full", className)}>
      <div className="bg-[#00843d] rounded-t-[80px] overflow-hidden">

        {/* ── Main content ── */}
        <div className="flex gap-[120px] items-start px-24 pt-16 pb-12">

          {/* Left: tagline + CTA + badges */}
          <div className="flex flex-col gap-12 shrink-0 w-[312px]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="text-white font-sans font-medium text-[72px] leading-[1.06] tracking-[-2.88px]">
                  {heading}
                </p>
                <p className="text-white text-base leading-[1.4]">
                  {description}
                </p>
              </div>
              <Button variant="secondary" colorScheme="dark" size="md" href={ctaHref} className="self-start">
                {ctaLabel}
              </Button>
            </div>
            {badges.length > 0 && (
              <div className="flex gap-4 items-start">
                {badges.map((badge) => (
                  <img
                    key={badge.alt}
                    src={badge.src}
                    alt={badge.alt}
                    className="size-16 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: nav columns + legal */}
          <div className="flex flex-col flex-1 justify-between self-stretch min-w-0">
            <div className="flex gap-16 items-start">
              {/* Left nav column — up to 2 stacked sections */}
              {leftNavSections.length > 0 && (
                <div className="flex flex-col gap-12">
                  {leftNavSections.map((section) => (
                    <NavSection key={section.title} section={section} />
                  ))}
                </div>
              )}
              {/* Remaining columns — one section each */}
              {rightNavSections.map((section) => (
                <NavSection key={section.title} section={section} />
              ))}
            </div>
            <p className="text-white text-[12px] leading-[1.4] mt-12">
              {LEGAL}
            </p>
          </div>
        </div>

        {/* ── Wordmark — no content padding, ~42px side margin matching Figma ── */}
        <div className="w-full flex items-center justify-center px-[42px] pt-[120px]">
          <img src="/images/footer-logo.svg" alt="Sharing Excess" className="w-full" />
        </div>

      </div>
    </footer>
  );
}

function NavSection({ section }: { section: FooterNavSection }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-display font-bold text-[18px] leading-[1.1] tracking-[-0.54px] text-white">
        {section.title}
      </p>
      {section.links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-white text-base leading-[1.4] no-underline hover:underline"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default SiteFooter;
