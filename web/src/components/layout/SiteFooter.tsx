import { NewsletterSignupForm } from "@/components/forms/NewsletterSignupForm";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { measureOffsetProgress } from "@/components/ui/ParallaxBackground";
import { cn } from "@/lib/cn";
import {
  motion,
  useMotionValue,
  useReducedMotion,
} from "@/lib/motion";
import { useEffect, useRef } from "react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  type SocialBrandIcon,
} from "@/components/icons/socialIcons";
import { FooterLogoMarquee } from "@/components/layout/FooterLogoMarquee";

export interface FooterNavSection {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: SocialBrandIcon;
}

export interface SiteFooterProps {
  heading?: string;
  submitLabel?: string;
  /** 4 nav sections — first 2 are stacked in the left nav column */
  navSections?: FooterNavSection[];
  socialLinks?: FooterSocialLink[];
  /** Certification badge images (e.g. Charity Navigator, Candid) */
  badges?: { src: string; alt: string; href?: string }[];
  className?: string;
}

const PRIVACY_HREF = "/documents/Sharing-Excess-Privacy-Policy.pdf";
const EIN = "86-2161466";

/** Extra Y travel while the footer slides into its overlap position */
const FOOTER_PARALLAX_TRAVEL_PX = 48;
const FOOTER_PARALLAX_TRAVEL_PX_LG = 72;

function footerParallaxTravelPx() {
  return window.matchMedia("(min-width: 1024px)").matches
    ? FOOTER_PARALLAX_TRAVEL_PX_LG
    : FOOTER_PARALLAX_TRAVEL_PX;
}

function useFooterParallaxY() {
  const footerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const y = useMotionValue(0);

  useEffect(() => {
    if (reduceMotion) {
      y.set(0);
      return;
    }

    const update = () => {
      const target = footerRef.current;
      if (!target) return;

      const progress = measureOffsetProgress(
        target.getBoundingClientRect(),
        window.innerHeight,
        ["start end", "start 0.75"],
      );
      y.set((1 - progress) * footerParallaxTravelPx());
    };

    if (lenis) {
      lenis.on("scroll", update);
      window.addEventListener("resize", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }

    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, [lenis, reduceMotion, y]);

  return { footerRef, y, reduceMotion };
}

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

export const FOOTER_NAV_SECTIONS: FooterNavSection[] = [
  {
    title: "Get Food",
    links: [
      { label: "Find Food", href: "/find-food" },
      { label: "For Community Organizations", href: "/get-involved/partner#community-orgs" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Donate Food", href: "/donate-food" },
      { label: "For Foundations", href: "/get-involved/partner#foundations" },
      { label: "Give Monthly", href: "/collective" },
      { label: "Volunteer", href: "/get-involved/volunteer" },
      { label: "Fundraise", href: "/get-involved/fundraise" },
      { label: "Chapters", href: "/get-involved/chapters" },
      { label: "Merch", href: "https://shop.sharingexcess.com/collections/all", external: true },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Closing the Gap", href: "/about/problem" },
      { label: "Our Story", href: "/about#our-story" },
      { label: "Our Impact", href: "/about/impact" },
      { label: "Our Model", href: "/about" },
      { label: "Our Team", href: "/about/team" },
      { label: "Our Financials", href: "/about/financials" },
      { label: "News", href: "/news" },
      { label: "Careers", href: "/get-involved/careers" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "App", href: "https://app.sharingexcess.com/sign-in", external: true },
    ],
  },
];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  {
    label: "Sharing Excess on Instagram",
    href: "https://www.instagram.com/sharingexcess/",
    icon: InstagramIcon,
  },
  {
    label: "Sharing Excess on TikTok",
    href: "https://www.tiktok.com/@sharingexcess",
    icon: TiktokIcon,
  },
  {
    label: "Sharing Excess on Facebook",
    href: "https://www.facebook.com/sharingexcess",
    icon: FacebookIcon,
  },
  {
    label: "Sharing Excess on LinkedIn",
    href: "https://www.linkedin.com/company/sharing-excess",
    icon: LinkedinIcon,
  },
];

export const DEFAULT_FOOTER_BADGES: NonNullable<SiteFooterProps["badges"]> = [
  {
    src: "/images/Four-Star-Rating-Badge---Full-Color_1.avif",
    alt: "Sharing Excess rating on Charity Navigator",
    href: "https://www.charitynavigator.org/ein/862161466",
  },
  {
    src: "/images/guidestar.svg",
    alt: "Sharing Excess nonprofit profile on Candid (GuideStar)",
    href: "https://www.guidestar.org/profile/86-2161466",
  },
];

export function SiteFooter({
  heading = "Subscribe to Our Newsletter.",
  submitLabel = "Subscribe",
  navSections = FOOTER_NAV_SECTIONS,
  socialLinks = FOOTER_SOCIAL_LINKS,
  badges = DEFAULT_FOOTER_BADGES,
  className,
}: SiteFooterProps) {
  const leftNavSections = navSections.slice(0, 2);
  const rightNavSections = navSections.slice(2);
  const copyrightYear = new Date().getFullYear();
  const { footerRef, y, reduceMotion } = useFooterParallaxY();

  return (
    <footer
      ref={footerRef}
      className={cn(
        "relative z-10 -mt-16 w-full lg:-mt-24",
        className,
      )}
    >
      <motion.div
        style={reduceMotion ? undefined : { y }}
        className="transform-gpu will-change-transform"
      >
      <div
        data-theme="dark"
        className="overflow-hidden rounded-t-[var(--radius-xl)] bg-[#00843d] lg:rounded-t-[var(--radius-2xl)]"
      >
        <div className="flex flex-col gap-10 px-6 pb-10 pt-12 lg:flex-row lg:items-start lg:gap-[120px] lg:px-24 lg:pb-12 lg:pt-16">
          <div className="flex w-full shrink-0 flex-col gap-8 lg:w-[312px] lg:gap-12">
            <div className="flex flex-col gap-6">
              <p className="font-sans text-2xl font-semibold leading-[1.1] tracking-[-0.02em] text-white lg:text-[28px] lg:tracking-[-0.56px]">
                {heading}
              </p>
              <NewsletterSignupForm
                inputTheme="onColor"
                submitLabel={submitLabel}
                buttonVariant="secondary"
                buttonColorScheme="dark"
                nameFieldsClassName="grid-cols-1"
              />
            </div>
            {badges.length > 0 && (
              <div className="flex items-start gap-4">
                {badges.map((badge, index) => {
                  const image = (
                    <img
                      src={badge.src}
                      alt={badge.alt}
                      className="h-16 w-auto object-contain"
                    />
                  );

                  return badge.href ? (
                    <a
                      key={`${badge.src}-${index}`}
                      href={badge.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={badge.alt}
                      className="inline-flex"
                    >
                      {image}
                    </a>
                  ) : (
                    <span key={`${badge.src}-${index}`} className="inline-flex">
                      {image}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
            <div className="grid grid-cols-2 gap-x-10 gap-y-10 lg:flex lg:items-start lg:gap-24">
              {leftNavSections.length > 0 && (
                <div className="contents lg:flex lg:flex-col lg:gap-12">
                  {leftNavSections.map((section, index) => (
                    <NavSection key={`nav-left-${index}`} section={section} />
                  ))}
                </div>
              )}
              {rightNavSections.map((section, index) => (
                <NavSection
                  key={`nav-right-${index}`}
                  section={section}
                  socialLinks={index === rightNavSections.length - 1 ? socialLinks : undefined}
                />
              ))}
            </div>
            <LegalBar copyrightYear={copyrightYear} />
          </div>
        </div>

        <div className="w-full pt-16 lg:pt-[120px]">
          <FooterLogoMarquee />
        </div>
      </div>
      </motion.div>
    </footer>
  );
}

function LegalBar({ copyrightYear }: { copyrightYear: number }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] leading-[1.4] text-white lg:mt-12">
      <a href={PRIVACY_HREF} className="text-white no-underline hover:underline">
        Privacy
      </a>
      <span aria-hidden className="text-white/60">
        ·
      </span>
      <span>EIN {EIN}</span>
      <span aria-hidden className="text-white/60">
        ·
      </span>
      <span>© {copyrightYear} Sharing Excess. All rights reserved.</span>
    </div>
  );
}

function NavSection({
  section,
  socialLinks,
}: {
  section: FooterNavSection;
  socialLinks?: FooterSocialLink[];
}) {
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
          {...(link.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {link.label}
        </a>
      ))}
      {socialLinks && socialLinks.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex text-white transition-opacity hover:opacity-80"
              >
                <Icon className="size-8 fill-current text-white" aria-hidden />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SiteFooter;
