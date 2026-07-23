import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PARTNER_LOGOS = [
  { src: "/images/narrative/logo-deloitte.png", alt: "Deloitte", className: "h-6 w-auto" },
  { src: "/images/narrative/logo-simply-organic.png", alt: "Simply Organic", className: "h-12 w-auto" },
  { src: "/images/narrative/logo-chiquita.png", alt: "Chiquita", className: "h-12 w-auto" },
  { src: "/images/narrative/logo-layer.png", alt: "Partner", className: "h-8 w-auto" },
  { src: "/images/narrative/logo-dole.png", alt: "Dole", className: "h-12 w-auto" },
  { src: "/images/narrative/logo-baldor.png", alt: "Baldor", className: "h-10 w-auto" },
  { src: "/images/narrative/logo-misfits.png", alt: "Misfits Market", className: "h-8 w-auto" },
  {
    src: "/images/narrative/logo-hunts-point.png",
    alt: "Hunts Point Produce Market",
    className: "h-8 w-auto",
  },
  { src: "/images/narrative/logo-image-333.png", alt: "Partner", className: "h-12 w-auto" },
  { src: "/images/narrative/logo-del-monte.png", alt: "Del Monte", className: "h-12 w-auto" },
  { src: "/images/narrative/logo-fyffes.png", alt: "Fyffes", className: "h-12 w-auto" },
] as const;

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Impact", href: "/#impact" },
  { label: "Contact", href: "/contact" },
] as const;

function NarrativeNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-6 md:px-6">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 rounded-full bg-neutral-000 px-4 py-3 shadow-sm md:px-8 md:py-4">
        <a href="/" className="flex items-center gap-1.5 no-underline">
          <span className="size-6 shrink-0 rounded-md bg-se-green" aria-hidden="true" />
          <span className="text-xl font-semibold tracking-tight text-se-green md:text-[28px] md:tracking-[-1.12px]">
            Sharing Excess
          </span>
        </a>
        <div className="flex items-center gap-4 md:gap-6">
          <nav
            className="hidden items-center gap-8 text-[15px] text-kale md:flex"
            aria-label="Main"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="no-underline transition-opacity hover:opacity-70"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button
            href="/contact"
            className="bg-se-green px-4 py-3 text-sm text-neutral-000 hover:bg-se-green-400 md:px-4"
          >
            Primary Action
          </Button>
        </div>
      </div>
    </header>
  );
}

function LemonSticker({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative size-[250px] rotate-[13deg] drop-shadow-[0_4px_5px_rgba(0,0,0,0.25)]",
        className,
      )}
      aria-hidden="true"
    >
      <img
        src="/images/narrative/sticker-lemon-fill.png"
        alt=""
        className="absolute left-[6%] top-[24%] h-[52%] w-[88%]"
      />
      <img
        src="/images/narrative/sticker-lemon-stroke.png"
        alt=""
        className="absolute inset-x-0 top-[18%] h-[63%] w-full"
      />
      <img
        src="/images/narrative/sticker-lemon-stroke-inner.png"
        alt=""
        className="absolute left-[3%] top-[22%] h-[56%] w-[93%]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-se-green">
        <p className="text-[38px] font-bold leading-[0.92] tracking-[-0.8px]">
          <span className="italic">S</span>haring
        </p>
        <p className="text-[38px] font-bold leading-[0.92] tracking-[-0.8px]">
          <span className="italic">E</span>
          <span className="italic">x</span>cess
        </p>
      </div>
    </div>
  );
}

export function NarrativeShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const partnersRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const partners = partnersRef.current;
      if (!hero) return;

      const headlineLines = hero.querySelectorAll<HTMLElement>("[data-headline-line]");
      const subcopy = hero.querySelector<HTMLElement>("[data-subcopy]");
      const ripples = hero.querySelectorAll<HTMLElement>("[data-ripple-ring]");
      const imageFg = hero.querySelector<HTMLElement>("[data-hero-fg]");
      const imageBg = hero.querySelector<HTMLElement>("[data-hero-bg]");

      if (reducedMotion) {
        gsap.set([headlineLines, subcopy, imageFg, imageBg, ripples], {
          clearProps: "all",
        });
        return;
      }

      gsap.set(headlineLines, { opacity: 0, y: 48 });
      gsap.set(subcopy, { opacity: 0, y: 24 });
      // Rings start as a small pulse at the handoff point, then expand to thin white arcs.
      gsap.set(ripples, { scale: 0.2, opacity: 0 });
      gsap.set(imageFg, { opacity: 0, scale: 1.06 });
      gsap.set(imageBg, { opacity: 0.4, scale: 1.03 });

      // Intro + ripple play on load (not scroll-scrubbed).
      const heroTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      heroTimeline
        .to(headlineLines, {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.7,
        })
        .to(
          subcopy,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
          },
          0.35,
        )
        .to(
          imageBg,
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power2.inOut",
          },
          0.25,
        )
        .to(
          imageFg,
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power2.inOut",
          },
          0.35,
        )
        .to(
          ripples,
          {
            // Final sizes match Figma: large concentric stroke rings over the image.
            scale: (index) => [3.2, 5.4, 7.8, 10.2][index] ?? 8,
            opacity: (index) => [0.95, 0.75, 0.55, 0.35][index] ?? 0.3,
            stagger: 0.14,
            duration: 1.35,
            ease: "power1.out",
          },
          0.55,
        );

      if (partners) {
        const logos = partners.querySelectorAll<HTMLElement>("[data-partner-logo]");
        const partnersHeading = partners.querySelector<HTMLElement>("[data-partners-heading]");
        const sticker = partners.querySelector<HTMLElement>("[data-sticker]");

        gsap.set([partnersHeading, logos], { opacity: 0, y: 28 });
        gsap.set(sticker, { opacity: 0, scale: 0.7, rotate: -8 });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: partners,
              start: "top 75%",
              end: "top 25%",
              scrub: 1,
            },
          })
          .to(partnersHeading, { opacity: 1, y: 0, ease: "power2.out", duration: 0.3 })
          .to(
            logos,
            {
              opacity: 1,
              y: 0,
              stagger: 0.04,
              ease: "power2.out",
              duration: 0.35,
            },
            0.1,
          )
          .to(
            sticker,
            {
              opacity: 1,
              scale: 1,
              rotate: 13,
              ease: "power2.out",
              duration: 0.4,
            },
            0.2,
          );
      }
    },
    { scope: rootRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="bg-neutral-000 text-kale">
      <NarrativeNav />

      <section
        ref={heroRef}
        className="relative flex min-h-dvh flex-col justify-start overflow-hidden bg-neutral-000 px-6 pb-0 pt-36 md:px-24 md:pt-[140px]"
      >
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center gap-8 md:gap-16">
          <div className="flex max-w-4xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-medium tracking-[-0.04em] text-kale md:text-6xl lg:text-[96px] lg:leading-[1.06]">
              <span data-headline-line className="block">
                Lorem ipsum
              </span>
              <span data-headline-line className="block">
                dolor sit amet
              </span>
              <span data-headline-line className="block text-se-green">
                conspectus.
              </span>
            </h1>
            <p
              data-subcopy
              className="max-w-2xl text-base leading-relaxed text-kale md:text-lg"
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et
              velit interdum, ac aliquet odio mattis.
            </p>
          </div>

          <div
            data-ripple
            className="relative mt-auto w-full overflow-hidden rounded-t-[40px] md:rounded-t-[60px]"
          >
            <div className="relative aspect-[1320/650] w-full overflow-hidden bg-neutral-100">
              {/* Soft park background (blurred), matching Figma Ripple-Animation */}
              <div data-hero-bg className="absolute inset-0 blur-[2px]">
                <img
                  src="/images/narrative/hero-bg.jpg"
                  alt=""
                  className="absolute left-0 top-[-2%] h-[104%] w-full max-w-none object-cover"
                />
              </div>
              {/*
                Foreground is temporarily JPEG. Figma exports a cutout PNG with alpha;
                JPEG flattens transparency to white. See web/docs/narrative-animations-handoff.md
              */}
              <div data-hero-fg className="absolute inset-0">
                <img
                  src="/images/narrative/hero-fg.jpg"
                  alt="Food being shared at a community distribution"
                  className="absolute left-0 top-[-24%] h-[141%] w-full max-w-none object-cover"
                />
              </div>
              {/* Thin white concentric rings centered on the handoff in the photo */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
              >
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    data-ripple-ring
                    className="absolute left-[53%] top-[48%] size-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-000/90 bg-transparent"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={partnersRef}
        className="relative overflow-hidden bg-neutral-000 px-6 py-16 md:px-24 md:py-20"
      >
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center gap-10 md:gap-12">
          <h2
            data-partners-heading
            className="text-center text-2xl font-bold text-kale md:text-[32px] md:leading-[1.1]"
          >
            Lorem ispum dolor sit amet
          </h2>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-6 mix-blend-luminosity md:gap-x-10">
            {PARTNER_LOGOS.map((logo) => (
              <div
                key={logo.src + logo.alt}
                data-partner-logo
                className="flex h-14 items-center justify-center"
              >
                <img src={logo.src} alt={logo.alt} className={cn("object-contain", logo.className)} />
              </div>
            ))}
          </div>
        </div>

        <div
          data-sticker
          className="absolute bottom-4 right-4 hidden md:block lg:right-16 lg:bottom-8"
        >
          <LemonSticker />
        </div>
      </section>
    </div>
  );
}

export default NarrativeShowcase;
