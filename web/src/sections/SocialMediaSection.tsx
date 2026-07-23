import { cn } from "@/lib/cn";
import type { SectionTheme } from "@/lib/types";
import { TextSection } from "@/components/ui/TextSection";
import { SectionShell } from "./SectionShell";

export type SocialMediaAspect = "story" | "post";

export interface SocialMediaItem {
  id?: string;
  src: string;
  alt: string;
  aspect?: SocialMediaAspect;
  /** Link to the post on Instagram */
  href?: string;
}

export interface SocialMediaSectionProps {
  theme?: SectionTheme;
  title: string;
  headingSize?: "h1" | "h2";
  items: SocialMediaItem[];
  /** Shows carousel navigation and elevated highlight card (Figma hover state) */
  showNavigation?: boolean;
  /** Index of the item shown in the elevated hover treatment */
  highlightedIndex?: number;
  className?: string;
  id?: string;
}

const aspectClasses: Record<SocialMediaAspect, string> = {
  story: "h-[540px] w-[304px]",
  post: "h-[540px] w-[432px]",
};

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="43"
      height="43"
      viewBox="0 0 43 43"
      fill="none"
      aria-hidden
      className={cn(direction === "prev" && "rotate-180")}
    >
      <path
        d="M8 21.5H35M24 10.5L35 21.5L24 32.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SocialMediaSection({
  theme = "light",
  title,
  headingSize = "h2",
  items,
  showNavigation = false,
  highlightedIndex = 1,
  className,
  id,
}: SocialMediaSectionProps) {
  const isDark = theme === "dark";

  return (
    <SectionShell theme={theme} className={cn("relative", className)} id={id}>
      {showNavigation && (
        <div className="absolute right-6 top-[197px] z-20 flex gap-6 lg:right-24">
          <button
            type="button"
            aria-label="Previous posts"
            className="flex size-[75px] items-center justify-center rounded-full bg-bright-kelly text-white"
          >
            <ArrowIcon direction="prev" />
          </button>
          <button
            type="button"
            aria-label="Next posts"
            className="flex size-[75px] items-center justify-center rounded-full bg-bright-kelly text-white"
          >
            <ArrowIcon direction="next" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-16">
        <TextSection
          heading={title}
          headingSize={headingSize}
          buttonScheme={isDark ? "dark" : "light"}
          className="max-w-[915px]"
        />

        <div className="relative flex gap-6 overflow-x-auto pb-2">
          {items.map((item, index) => {
            const aspect = item.aspect ?? "story";
            const isHighlighted = showNavigation && index === highlightedIndex;
            const cardClassName = cn(
              "relative block shrink-0 overflow-hidden rounded-[var(--radius-lg)] transition-transform duration-300",
              aspectClasses[aspect],
              showNavigation && !isHighlighted && "opacity-65",
              isHighlighted &&
                "z-10 scale-[1.04] rotate-[-3.39deg] shadow-[0_16px_32px_-4px_rgba(12,12,13,0.1),0_4px_4px_-4px_rgba(12,12,13,0.05)]",
            );
            const image = (
              <img
                src={item.src}
                alt={item.alt}
                className="size-full object-cover"
                loading="lazy"
              />
            );

            return item.href ? (
              <a
                key={item.id ?? `${item.src}-${index}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.alt || "View post on Instagram"}
                className={cardClassName}
              >
                {image}
              </a>
            ) : (
              <div key={item.id ?? `${item.src}-${index}`} className={cardClassName}>
                {image}
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

export default SocialMediaSection;
