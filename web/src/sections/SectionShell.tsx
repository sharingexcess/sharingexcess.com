import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/cn";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "@/lib/motion";
import { ROUND_IMAGE_SECTION_ATTR } from "@/lib/roundSectionScroll";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { SectionProps } from "@/lib/types";

/** How far (px) the arch peak rises above the section boundary at the center. */
const ARCH_RISE = 180;

/**
 * How far (px) the section must scroll past the viewport bottom before the
 * arch begins to flatten.
 */
const ARCH_HOLD_PX = 800;

/**
 * Setting this equal to ARCH_RISE keeps the arch peak stationary in the
 * viewport during the flatten phase — only the curvature changes.
 */
const ARCH_FLATTEN_PX = ARCH_RISE;

/**
 * Arch element width. Matches Figma's SHAPE node (2433 / 1512 ≈ 161vw) so the
 * viewport edges show visible curvature rather than appearing flat.
 */
const ARCH_WIDTH_VW = 162;

/**
 * How far above the section boundary the content sits when the arch is fully
 * peaked. The section's own paddingTop (64px from py-16) plus this value gives
 * the total negative marginTop applied at full rise.
 *   -marginTop_max = SECTION_PT + ARCH_CONTENT_PULLUP = 64 + 80 = 144px
 * When rise → 0 the marginTop returns to 0 and the section's paddingTop alone
 * provides the top spacing, keeping the flat state consistent with other sections.
 */
const ARCH_SECTION_PT = 64; // py-16 on the archTop section (LogosBannerSection)
const ARCH_CONTENT_PULLUP = 80; // px above section boundary at full rise

function ArchRoot({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();

  const rise = useMotionValue(ARCH_RISE);
  const top = useTransform(rise, (v) => -v);
  const radiusX = `${ARCH_WIDTH_VW / 2}vw`;
  const borderTopLeftRadius = useTransform(rise, (v) => `${radiusX} ${v}px`);
  const borderTopRightRadius = useTransform(rise, (v) => `${radiusX} ${v}px`);

  // Pull content up into the arch when peaked; return to 0 when flat so the
  // section's own paddingTop takes over — no position jump at either extreme.
  const marginTop = useTransform(rise, (v) =>
    Math.round(-((ARCH_SECTION_PT + ARCH_CONTENT_PULLUP) * v) / ARCH_RISE),
  );

  useEffect(() => {
    if (reduceMotion) {
      rise.set(0);
      return;
    }
    if (!lenis) return;

    const update = () => {
      const section = sectionRef.current?.closest("section");
      if (!section) return;
      const sectionTop = section.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const scrolledPast = vh + ARCH_RISE - sectionTop;
      const progress = Math.max(
        0,
        Math.min(1, (scrolledPast - ARCH_HOLD_PX) / ARCH_FLATTEN_PX),
      );
      rise.set(ARCH_RISE * (1 - progress));
    };

    lenis.on("scroll", update);
    update();
    return () => lenis.off("scroll", update);
  }, [lenis, reduceMotion, rise]);

  return (
    <>
      {/* Arch visual — absolute, extends above section boundary */}
      <div
        ref={sectionRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-x-clip"
        style={{ height: ARCH_RISE + 32 }}
      >
        <motion.div
          style={{
            top,
            width: `${ARCH_WIDTH_VW}vw`,
            borderTopLeftRadius,
            borderTopRightRadius,
            height: ARCH_RISE + 32,
          }}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bg-[var(--section-bg)]"
        />
      </div>

      {/* Content floats inside the arch dome at full rise; marginTop returns to
          0 as arch flattens so the section's paddingTop provides normal spacing */}
      <motion.div
        style={{ marginTop }}
        className={cn(
          "@container mx-auto max-w-6xl relative z-[1]",
          contentClassName,
        )}
      >
        {children}
      </motion.div>
    </>
  );
}

export interface SectionShellProps extends SectionProps {
  children: ReactNode;
  as?: "section" | "div";
  contentClassName?: string;
  /** Round-image layout — enables scroll lock when aligned */
  roundImageSection?: boolean;
  /**
   * Arch-shaped transition at the top of this section — use when a light
   * section immediately follows a dark one.
   */
  archTop?: boolean;
  /**
   * Add clearance at the bottom of this section so the rising arch on the
   * next section does not overlap its content.
   */
  archBottom?: boolean;
}

export function SectionShell({
  theme = "light",
  id,
  className,
  contentClassName,
  children,
  as: Tag = "section",
  roundImageSection = false,
  archTop = false,
  archBottom = false,
  flushTop = false,
  flushBottom = false,
  transparentBg = false,
}: SectionShellProps) {
  const needsOverflowVisible = roundImageSection || archTop;
  return (
    <Tag
      id={id}
      data-section=""
      data-theme={theme}
      {...(roundImageSection ? { [ROUND_IMAGE_SECTION_ATTR]: "" } : undefined)}
      {...(archTop ? { "data-arch-top": "" } : undefined)}
      className={cn(
        "relative px-6 text-[var(--section-text)] lg:px-24",
        transparentBg ? "bg-transparent" : "bg-[var(--section-bg)]",
        flushTop ? "pt-0" : "pt-12 lg:pt-[var(--spacing-xxl)]",
        flushBottom ? "pb-0" : "pb-12 lg:pb-[var(--spacing-xxl)]",
        needsOverflowVisible ? "overflow-visible" : "overflow-hidden",
        className,
      )}
      style={
        archBottom
          ? ({ paddingBottom: `${ARCH_RISE + 140}px` } as CSSProperties)
          : undefined
      }
    >
      {archTop ? (
        <ArchRoot contentClassName={contentClassName}>{children}</ArchRoot>
      ) : (
        <div className={cn("@container mx-auto max-w-6xl", contentClassName)}>
          {children}
        </div>
      )}
    </Tag>
  );
}

export default SectionShell;
