import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ScrollPanel } from "./ScrollPanel";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const COPY_WORDS = ["Rescue", "food.", "Feed", "communities.", "Share", "the", "excess."];

const HORIZONTAL_CARDS = [
  {
    title: "Rescue",
    body: "Recover surplus food before it goes to waste.",
  },
  {
    title: "Deliver",
    body: "Move rescued food to the people who need it most.",
  },
  {
    title: "Partner",
    body: "Collaborate with grocers, farms, and community orgs.",
  },
  {
    title: "Impact",
    body: "Turn excess into access across neighborhoods.",
  },
];

const IMPACT_STATS = [
  { value: 1.2, suffix: "M+", label: "Pounds rescued" },
  { value: 80, suffix: "+", label: "Partner organizations" },
  { value: 5, suffix: "K+", label: "Volunteers mobilized" },
];

export function ScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={containerRef}>
      <section
        data-theme="dark"
        className="flex min-h-dvh items-center bg-[var(--section-bg)] px-6 py-16 text-[var(--section-text)]"
      >
        <div className="mx-auto w-full max-w-6xl">
          <Heading level={1}>Scroll animation examples</Heading>
          <Text className="mt-4 max-w-2xl text-lg opacity-90">
            Each section below fills the viewport and animates as a function of how far
            you scroll into it. These patterns are starting points for translating Figma
            motion designs into production-ready GSAP ScrollTrigger timelines.
          </Text>
          <Text className="mt-6 text-sm uppercase tracking-[0.2em] opacity-70">
            Scroll to explore
          </Text>
        </div>
      </section>

      <ScrollPanel
        theme="light"
        id="copy-reveal"
        reducedMotion={reducedMotion}
        buildAnimation={({ content }) => {
          const words = content.querySelectorAll<HTMLElement>("[data-word]");
          gsap.set(words, { opacity: 0, y: 48 });

          const timeline = gsap.timeline();
          timeline.to(words, {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            ease: "power2.out",
          });

          return timeline;
        }}
      >
        <Text className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--section-accent)]">
          Panel A · Copy reveal
        </Text>
        <Heading level={2} className="max-w-4xl text-balance">
          {COPY_WORDS.map((word, index) => (
            <span key={word + index} className="mr-[0.35em] inline-block">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
          ))}
        </Heading>
        <Text className="mt-6 max-w-2xl opacity-80">
          Words rise and fade in sequentially as scroll progress advances through the
          section.
        </Text>
      </ScrollPanel>

      <ScrollPanel
        theme="dark"
        id="scale-zoom"
        reducedMotion={reducedMotion}
        buildAnimation={({ content }) => {
          const zoomTarget = content.querySelector<HTMLElement>("[data-zoom-target]");
          const copy = content.querySelector<HTMLElement>("[data-zoom-copy]");
          if (!zoomTarget || !copy) return gsap.timeline();

          gsap.set(zoomTarget, { scale: 0.35, borderRadius: "9999px" });
          gsap.set(copy, { opacity: 0, y: 32 });

          const timeline = gsap.timeline();
          timeline
            .to(zoomTarget, {
              scale: 1,
              borderRadius: "1.5rem",
              ease: "power2.inOut",
            })
            .to(
              copy,
              {
                opacity: 1,
                y: 0,
                ease: "power2.out",
              },
              0.45,
            );

          return timeline;
        }}
      >
        <div className="grid min-h-[70dvh] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            data-zoom-target
            className="aspect-square w-full max-w-xl origin-center bg-[var(--section-accent)] shadow-2xl"
            aria-hidden="true"
          />
          <div data-zoom-copy>
            <Text className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--section-accent)]">
              Panel B · Scale / zoom
            </Text>
            <Heading level={2}>From detail to full impact</Heading>
            <Text className="mt-4 opacity-90">
              A focal element scales from a small circle into a full panel while supporting
              copy fades in over the same scroll range.
            </Text>
          </div>
        </div>
      </ScrollPanel>

      <ScrollPanel
        theme="light"
        id="horizontal-scroll"
        scrollDistance="+=180%"
        reducedMotion={reducedMotion}
        buildAnimation={({ content }) => {
          const track = content.querySelector<HTMLElement>("[data-horizontal-track]");
          if (!track) return gsap.timeline();

          const cards = track.querySelectorAll<HTMLElement>("[data-horizontal-card]");
          gsap.set(cards, { opacity: 0.35, scale: 0.92 });

          const timeline = gsap.timeline();
          timeline.to(track, {
            x: () => {
              const viewport = track.parentElement?.clientWidth ?? 0;
              const overflow = track.scrollWidth - viewport;
              return overflow > 0 ? -overflow : 0;
            },
            ease: "none",
          });

          cards.forEach((card, index) => {
            timeline.to(
              card,
              {
                opacity: 1,
                scale: 1,
                ease: "power1.out",
              },
              index / cards.length,
            );
          });

          return timeline;
        }}
      >
        <Text className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--section-accent)]">
          Panel C · Horizontal scroll
        </Text>
        <Heading level={2} className="mb-8 max-w-3xl">
          Scroll vertically, move horizontally
        </Heading>
        <div className="overflow-hidden">
          <div
            data-horizontal-track
            className="flex w-max gap-6 will-change-transform"
          >
            {HORIZONTAL_CARDS.map((card) => (
              <article
                key={card.title}
                data-horizontal-card
                className="flex h-[min(52dvh,28rem)] w-[min(80vw,22rem)] shrink-0 flex-col justify-end rounded-3xl bg-se-green-700 p-8 text-neutral-000"
              >
                <Heading level={3} className="text-neutral-000">
                  {card.title}
                </Heading>
                <Text className="mt-3 text-neutral-000/90">{card.body}</Text>
              </article>
            ))}
          </div>
        </div>
      </ScrollPanel>

      <ScrollPanel
        theme="dark"
        id="parallax-layers"
        reducedMotion={reducedMotion}
        buildAnimation={({ content }) => {
          const back = content.querySelector<HTMLElement>("[data-parallax-back]");
          const mid = content.querySelector<HTMLElement>("[data-parallax-mid]");
          const front = content.querySelector<HTMLElement>("[data-parallax-front]");
          if (!back || !mid || !front) return gsap.timeline();

          gsap.set([back, mid, front], { y: (index) => 80 + index * 40, opacity: 0.4 });

          const timeline = gsap.timeline();
          timeline
            .to(back, { y: -80, opacity: 0.35, ease: "none" }, 0)
            .to(mid, { y: -20, opacity: 0.75, ease: "none" }, 0)
            .to(front, { y: 40, opacity: 1, ease: "none" }, 0);

          return timeline;
        }}
      >
        <div className="relative min-h-[70dvh]">
          <div
            data-parallax-back
            className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-56 max-w-5xl rounded-[999px] bg-bright-kelly/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            data-parallax-mid
            className="pointer-events-none absolute inset-x-10 top-24 h-40 rounded-3xl border border-neutral-000/10 bg-neutral-000/5"
            aria-hidden="true"
          />
          <div data-parallax-front className="relative z-10 max-w-3xl pt-24">
            <Text className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--section-accent)]">
              Panel D · Parallax layers
            </Text>
            <Heading level={2}>Depth through layered motion</Heading>
            <Text className="mt-4 opacity-90">
              Background, midground, and foreground elements move at different rates,
              creating depth without leaving the scroll-scrubbed timeline.
            </Text>
          </div>
        </div>
      </ScrollPanel>

      <ScrollPanel
        theme="light"
        id="impact-counter"
        reducedMotion={reducedMotion}
        buildAnimation={({ content }) => {
          const counters = content.querySelectorAll<HTMLElement>("[data-counter-value]");
          if (!counters.length) return gsap.timeline();

          const counterState = Array.from(counters).map((element) => {
            const target = Number(element.dataset.target ?? 0);
            const suffix = element.dataset.suffix ?? "";
            return { element, target, suffix, current: 0 };
          });

          gsap.set(
            counterState.map(({ element }) => element),
            { opacity: 0, y: 24 },
          );

          const timeline = gsap.timeline({
            onUpdate: () => {
              const progress = timeline.progress();
              counterState.forEach(({ element, target, suffix }, index) => {
                const staggerOffset = index * 0.12;
                const localProgress = gsap.utils.clamp(
                  0,
                  1,
                  (progress - staggerOffset) / (1 - staggerOffset),
                );
                const value = target * localProgress;
                const formatted = Number.isInteger(target)
                  ? Math.round(value).toString()
                  : value.toFixed(1);
                element.textContent = `${formatted}${suffix}`;
              });
            },
          });

          timeline.to(
            counterState.map(({ element }) => element),
            {
              opacity: 1,
              y: 0,
              stagger: 0.12,
              ease: "power2.out",
            },
          );

          return timeline;
        }}
      >
        <Text className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--section-accent)]">
          Panel E · Impact counter
        </Text>
        <Heading level={2} className="mb-10 max-w-3xl">
          Numbers that rise with scroll progress
        </Heading>
        <div className="grid gap-8 md:grid-cols-3">
          {IMPACT_STATS.map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl border border-se-green/10 bg-neutral-050 p-8"
            >
              <p
                data-counter-value
                data-target={stat.value}
                data-suffix={stat.suffix}
                className="text-4xl font-bold tracking-tight text-se-green md:text-5xl"
              >
                0{stat.suffix}
              </p>
              <Text className="mt-3 font-medium text-se-green">{stat.label}</Text>
            </article>
          ))}
        </div>
      </ScrollPanel>
    </div>
  );
}

export default ScrollShowcase;
