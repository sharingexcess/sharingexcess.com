import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CountUp, useSectionReveal } from "@/lib/motion";
import { assets } from "./assets";

const navItems = ["Menu Item", "Menu Item", "Menu Item", "Menu Item"];

const stats = [
  {
    value: 1.2,
    decimals: 1,
    suffix: "M",
    label: "Lorems ipsumed",
    accent: "bg-bright-kelly",
  },
  { value: 80, suffix: "+", label: "Lorems ipsumed", accent: "bg-banana" },
  { value: 5, suffix: "K", label: "Lorems ipsumed", accent: "bg-tangerine" },
] as const;

const footerColumns = [
  [
    {
      title: "Section Title",
      links: [
        "Lorem ipsum dolor",
        "Emit descuptus amor",
        "Conspectus samit",
        "Lorem ipsum dolor",
      ],
    },
    {
      title: "Section Title",
      links: [
        "Conspectus samit",
        "Lorem ipsum dolor",
        "Emit descuptus amor",
        "Lorem ipsum dolor",
      ],
    },
  ],
  {
    title: "Section Title",
    links: [
      "Lorem ipsum dolor",
      "Emit descuptus amor",
      "Lorem ipsum dolor",
      "Conspectus samit",
    ],
  },
  {
    title: "Section Title",
    links: [
      "Lorem ipsum dolor",
      "Conspectus samit",
      "Lorem ipsum dolor",
      "Emit descuptus amor",
    ],
  },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-lg font-bold tracking-[-0.03em] text-neutral-000">
        {title}
      </p>
      {links.map((link, index) => (
        <a
          // Placeholder copy repeats within a column, so position is the identity.
          key={`${link}-${index}`}
          href="#"
          className="text-base leading-[1.4] text-neutral-000 no-underline hover:underline"
        >
          {link}
        </a>
      ))}
    </div>
  );
}

function NavBar() {
  return (
    <nav
      aria-label="Main"
      className="mx-auto flex w-full max-w-[1384px] items-center justify-between gap-6 overflow-hidden rounded-full bg-neutral-100 px-4 py-4 sm:px-8"
    >
      <a href="/" className="flex shrink-0 items-center gap-1.5 no-underline">
        <span className="size-6 shrink-0 rounded-md bg-se-green" aria-hidden />
        <span className="whitespace-nowrap text-2xl font-semibold tracking-[-0.04em] text-se-green">
          Sharing Excess
        </span>
      </a>

      <div className="hidden items-center gap-6 lg:flex">
        <ul className="flex items-center gap-8 text-[15px] text-kale">
          {navItems.map((item, index) => (
            <li key={`${item}-${index}`}>
              <a href="#" className="whitespace-nowrap no-underline hover:text-se-green">
                {item}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="shrink-0 rounded-full bg-se-green px-5 py-4 text-base font-semibold text-neutral-000 no-underline"
        >
          Primary Action
        </a>
      </div>
    </nav>
  );
}

function SectionHeading({
  eyebrow,
  children,
  description,
  className,
  headingClassName,
}: {
  eyebrow?: string;
  children: ReactNode;
  description?: string;
  className?: string;
  headingClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {eyebrow && (
        <p
          data-reveal
          className="font-display text-[32px] font-bold leading-[1.1] text-neutral-000"
        >
          {eyebrow}
        </p>
      )}
      <h2
        data-reveal
        className={cn(
          "text-4xl font-medium leading-[1.06] tracking-[-0.04em] text-neutral-000 md:text-6xl lg:text-[96px]",
          headingClassName,
        )}
      >
        {children}
      </h2>
      {description && (
        <p data-reveal className="max-w-3xl text-base leading-[1.4] text-neutral-000">
          {description}
        </p>
      )}
    </div>
  );
}

function StatCard({
  value,
  decimals,
  suffix,
  label,
  accent,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  accent: string;
}) {
  return (
    <article
      data-reveal
      className="relative flex min-h-[432px] flex-col gap-2 overflow-hidden rounded-[40px] bg-se-green-600 p-[42px]"
    >
      <p className="font-display text-[clamp(4rem,10vw,8rem)] font-bold leading-[1.06] tracking-[-0.04em] text-neutral-000">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </p>
      <p className="text-[32px] font-medium leading-[1.06] tracking-[-0.04em] text-neutral-000">
        {label}
      </p>
      <div
        className={cn("absolute bottom-[15px] right-[23px] size-[88px] rounded-full", accent)}
        aria-hidden
      />
      <div className="absolute bottom-[37px] right-[45px] size-[43px] overflow-hidden">
        <img
          src={assets.arrowForward}
          alt=""
          className="size-full"
        />
      </div>
    </article>
  );
}

function TextField({
  label,
  className,
  multiline,
  reveal,
}: {
  label: string;
  className?: string;
  multiline?: boolean;
  reveal?: boolean;
}) {
  const shared =
    "w-full border border-neutral-250 bg-neutral-100 px-4 py-3 text-base text-kale placeholder:text-neutral-400";

  if (multiline) {
    return (
      <textarea
        rows={5}
        placeholder={label}
        aria-label={label}
        data-reveal={reveal ? "" : undefined}
        className={cn(shared, "min-h-[134px] resize-none rounded-3xl", className)}
      />
    );
  }

  return (
    <input
      type="text"
      placeholder={label}
      aria-label={label}
      data-reveal={reveal ? "" : undefined}
      className={cn(shared, "rounded-full", className)}
    />
  );
}

function ContactFormSection() {
  const scope = useSectionReveal<HTMLElement>();

  return (
    <section ref={scope} className="relative -mb-[90px] pb-[210px] pt-[120px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-neutral-000" />
        <img
          src={assets.sectionBg}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[1512px] px-6 lg:px-24">
        <div
          data-reveal
          className="flex flex-col gap-16 rounded-[80px] bg-neutral-000 p-8 sm:p-16"
        >
          <div data-reveal className="flex max-w-3xl flex-col gap-4">
            <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-medium leading-[1.06] tracking-[-0.04em] text-kale">
              Lorem et du
              <br />
              el ipsum
            </h2>
            <p className="text-xl leading-[1.4] text-kale">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              <br />
              Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
            </p>
          </div>

          <form
            className="flex w-full max-w-[648px] flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div data-reveal className="grid gap-4 sm:grid-cols-2">
              <TextField label="First Name" />
              <TextField label="Last Name" />
            </div>
            <TextField label="Email" reveal />
            <div data-reveal className="grid gap-4 sm:grid-cols-2">
              <TextField label="Phone Number (Optional)" />
              <TextField label="Organization Name" />
            </div>
            <TextField label="How can we help?" multiline reveal />
            <button
              type="submit"
              data-reveal
              className="w-full rounded-full bg-se-green px-6 py-6 text-xl font-semibold text-neutral-000"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function PageFooter() {
  return (
    <footer className="relative z-10 w-full">
      <div className="overflow-hidden rounded-t-[80px] bg-se-green pb-12 pt-16">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-[120px] px-6 lg:px-24">
          <div className="flex flex-col gap-16 xl:flex-row xl:gap-[120px]">
            <div className="flex w-full max-w-[312px] flex-col gap-12">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-neutral-000">
                  <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.04em]">
                    Lorem ipsum?
                  </h2>
                  <p className="text-base leading-[1.4]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate
                    libero et velit interdum, ac aliquet odio mattis.
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-flex w-fit items-center justify-center rounded-full border border-neutral-000 px-5 py-4 text-xl font-semibold text-neutral-000 no-underline"
                >
                  Contact Us
                </a>
              </div>
              <div className="flex gap-4">
                <img src={assets.badge1} alt="" className="size-16 object-cover" />
                <img src={assets.badge2} alt="" className="size-16 object-cover" />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-12">
              <div className="flex flex-wrap gap-16">
                <div className="flex flex-col gap-12">
                  {footerColumns[0].map((group, index) => (
                    <FooterLinkGroup key={`${group.title}-${index}`} {...group} />
                  ))}
                </div>
                {footerColumns.slice(1).map((group, index) => (
                  <FooterLinkGroup key={`${group.title}-${index}`} {...group} />
                ))}
              </div>
              <p className="text-xs leading-[1.4] text-neutral-000">
                Sharing Excess is a registered 501(c)(3) nonprofit organization. Donations are
                tax-deductible. Nonprofit Tax ID/EIN: 86-2161466. &quot;Sharing Excess&quot; is a
                registered trademark, all rights reserved.
              </p>
            </div>
          </div>

          <div className="flex justify-center overflow-hidden">
            <img
              src={assets.wordmark}
              alt="Sharing Excess"
              className="h-auto w-full max-w-[1427px]"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function HeroSection() {
  const scope = useSectionReveal<HTMLElement>({ trigger: "load" });

  return (
    <section
      ref={scope}
      className="w-full max-w-[1512px] px-6 pb-[120px] pt-16 lg:px-24"
    >
      <SectionHeading eyebrow="Section Eyebrow" className="mb-16 w-full">
        <span className="block whitespace-nowrap">Lorem ipsum dolor sit amet</span>
        <span className="text-bright-kelly">conspectus</span>.
      </SectionHeading>

      <div
        data-reveal
        className="relative h-[min(650px,60vw)] min-h-[280px] overflow-hidden rounded-[52px]"
      >
        <img
          src={assets.heroImage}
          alt="Volunteer loading rescued food at a grocery store"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </section>
  );
}

function StatsSection() {
  const scope = useSectionReveal<HTMLElement>();

  return (
    <section ref={scope} className="w-full max-w-[1512px] px-6 py-[120px] lg:px-24">
      <SectionHeading
        eyebrow="Section Eyebrow"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
        className="mb-16 max-w-[915px]"
      >
        Lorem ipsum dolor sit <span className="text-se-green">conspectus</span>.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={`${stat.value}${stat.suffix}`} {...stat} />
        ))}
      </div>
    </section>
  );
}

export function InformationalPage2() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-kale pt-16">
      <div className="w-full px-6">
        <NavBar />
      </div>

      <HeroSection />
      <StatsSection />

      <div className="relative isolate w-full">
        <ContactFormSection />
        <PageFooter />
      </div>
    </div>
  );
}

export default InformationalPage2;
