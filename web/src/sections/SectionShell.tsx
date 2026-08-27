import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { ARCH_RISE, computeArchRise, useArchDesktop } from "@/lib/archScroll";
import { cn } from "@/lib/cn";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "@/lib/motion";
import { ROUND_IMAGE_SECTION_ATTR } from "@/lib/roundSectionScroll";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import type { SectionProps } from "@/lib/types";

/**
 * Only the animated arch visual — no content wrapper and no negative marginTop.
 * Use this when archTop is needed on a scroll-pinned section where wrapping sticky
 * content would conflict with the pinned layout.
 */
export function SectionArchVisual() {
  const archRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const archDesktop = useArchDesktop();
  const archEnabled = archDesktop && !reduceMotion;

  const rise = useMotionValue(ARCH_RISE);
  const y = useTransform(rise, (v) => -v);
  const radiusX = `${ARCH_WIDTH_VW / 2}vw`;
  const borderTopLeftRadius = useTransform(rise, (v) => `${radiusX} ${v}px`);
  const borderTopRightRadius = useTransform(rise, (v) => `${radiusX} ${v}px`);

  useLayoutEffect(() => {
    const section = archRef.current?.closest("section");
    section?.setAttribute("data-arch-hydrated", "");
    return () => section?.removeAttribute("data-arch-hydrated");
  }, []);

  useLayoutEffect(() => {
    if (!archEnabled) {
      rise.set(0);
      return;
    }

    const update = () => {
      if (!archDesktop) {
        rise.set(0);
        return;
      }
      const section = archRef.current?.closest("section");
      if (!section) return;
      rise.set(computeArchRise(section.getBoundingClientRect().top));
    };

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", update);
    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, [archDesktop, archEnabled, lenis, rise]);

  return (
    <div
      ref={archRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] hidden overflow-x-clip lg:block"
      style={{ height: ARCH_RISE + 32 }}
    >
      <motion.div
        style={{
          y,
          width: `${ARCH_WIDTH_VW}vw`,
          borderTopLeftRadius,
          borderTopRightRadius,
          height: ARCH_RISE + 32,
        }}
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 bg-[var(--section-bg)] will-change-[transform,border-radius]"
      />
    </div>
  );
}

/** Zero slope at t=0 and t=1 — avoids a jerk when flatten begins after the hold. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Arch element width. Matches Figma's SHAPE node (2433 / 1512 ≈ 161vw) so the
 * viewport edges show visible curvature rather than appearing flat.
 */
const ARCH_WIDTH_VW = 162;

/** Scroll progress where corner flattening begins — full radius held before this. */
const ROUNDED_TOP_FLATTEN_START = 0.5;
/** Scroll progress where corners finish flattening to 0. */
const ROUNDED_TOP_FLATTEN_END = 1;
const ROUNDED_TOP_RADIUS_MOBILE = 40;
const ROUNDED_TOP_RADIUS_DESKTOP = 40;

function roundedTopFlattenProgress(scrollProgress: number): number {
  if (scrollProgress <= ROUNDED_TOP_FLATTEN_START) return 0;
  if (scrollProgress >= ROUNDED_TOP_FLATTEN_END) return 1;
  return (
    (scrollProgress - ROUNDED_TOP_FLATTEN_START) /
    (ROUNDED_TOP_FLATTEN_END - ROUNDED_TOP_FLATTEN_START)
  );
}

function roundedTopMaxRadiusPx(): number {
  if (typeof window === "undefined") return ROUNDED_TOP_RADIUS_MOBILE;
  return window.matchMedia("(min-width: 1024px)").matches
    ? ROUNDED_TOP_RADIUS_DESKTOP
    : ROUNDED_TOP_RADIUS_MOBILE;
}

function useRoundedTopScrollRadius(enabled: boolean) {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const radiusPx = useMotionValue(
    enabled && !reduceMotion ? ROUNDED_TOP_RADIUS_MOBILE : 0,
  );
  const borderTopLeftRadius = useTransform(radiusPx, (r) => `${r}px`);
  const borderTopRightRadius = useTransform(radiusPx, (r) => `${r}px`);
  const animate = enabled && !reduceMotion;

  useEffect(() => {
    if (!animate) {
      radiusPx.set(0);
      return;
    }

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const max = roundedTopMaxRadiusPx();
      const viewport = window.innerHeight || 1;
      const top = section.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, 1 - top / viewport));
      const flatten = roundedTopFlattenProgress(progress);
      radiusPx.set(max * (1 - flatten));
    };

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", update);
    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, [animate, lenis, radiusPx]);

  return { borderTopLeftRadius, borderTopRightRadius, animate, sectionRef };
}

/**
 * How far above the section boundary the content sits when the arch is fully
 * peaked. The section's own paddingTop (64px from py-16) plus this value gives
 * the total negative marginTop applied at full rise.
 */
const ARCH_SECTION_PT = 64;
const ARCH_CONTENT_PULLUP = 80;

export function SectionArchRoot({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const archDesktop = useArchDesktop();
  const archEnabled = archDesktop && !reduceMotion;

  const rise = useMotionValue(ARCH_RISE);
  const y = useTransform(rise, (v) => -v);
  const radiusX = `${ARCH_WIDTH_VW / 2}vw`;
  const borderTopLeftRadius = useTransform(rise, (v) => `${radiusX} ${v}px`);
  const borderTopRightRadius = useTransform(rise, (v) => `${radiusX} ${v}px`);

  const contentY = useTransform(
    rise,
    (v) => -((ARCH_SECTION_PT + ARCH_CONTENT_PULLUP) * v) / ARCH_RISE,
  );

  useLayoutEffect(() => {
    const section = sectionRef.current?.closest("section");
    section?.setAttribute("data-arch-hydrated", "");
    return () => section?.removeAttribute("data-arch-hydrated");
  }, []);

  useLayoutEffect(() => {
    if (!archEnabled) {
      rise.set(0);
      return;
    }

    const update = () => {
      if (!archDesktop) {
        rise.set(0);
        return;
      }
      const section = sectionRef.current?.closest("section");
      if (!section) return;
      rise.set(computeArchRise(section.getBoundingClientRect().top));
    };

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", update);
    update();

    return () => {
      if (lenis) {
        lenis.off("scroll", update);
      } else {
        window.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, [archDesktop, archEnabled, lenis, rise]);

  const contentClass = cn(
    "@container mx-auto max-w-7xl relative z-[2]",
    archEnabled && "will-change-transform",
    contentClassName,
  );

  return (
    <>
      {/* Arch visual — absolute, extends above section boundary */}
      <div
        ref={sectionRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden overflow-x-clip lg:block"
        style={{ height: ARCH_RISE + 32 }}
      >
        <motion.div
          style={{
            y,
            width: `${ARCH_WIDTH_VW}vw`,
            borderTopLeftRadius,
            borderTopRightRadius,
            height: ARCH_RISE + 32,
          }}
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 bg-[var(--section-bg)] will-change-[transform,border-radius]"
        />
      </div>

      {/* Content floats inside the arch dome at full rise; translateY returns to
          0 as arch flattens so the section's paddingTop provides normal spacing */}
      {archEnabled ? (
        <motion.div style={{ y: contentY }} className={contentClass}>
          {children}
        </motion.div>
      ) : (
        <div className={contentClass}>{children}</div>
      )}
    </>
  );
}

export interface SectionShellProps extends SectionProps {
  children: ReactNode;
  /** Full-bleed background layer — absolute inset-0, behind section content */
  background?: ReactNode;
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
  /**
   * Rounded top edge — use when a section scrolls over a pinned hero so the
   * handoff matches the hero card radius during parallax.
   */
  roundedTop?: boolean;
}

export function SectionShell({
  theme = "light",
  id,
  className,
  contentClassName,
  children,
  background,
  as: Tag = "section",
  roundImageSection = false,
  archTop = false,
  archBottom = false,
  roundedTop = false,
  flushTop = false,
  flushBottom = false,
  transparentBg = false,
}: SectionShellProps) {
  const showArchTop = archTop;
  const showArchBottom = archBottom; // always reserve clearance; arch animation is desktop-only
  const needsOverflowVisible = (roundImageSection || archTop) && !roundedTop;
  const {
    borderTopLeftRadius,
    borderTopRightRadius,
    animate: animateRoundedTop,
    sectionRef,
  } = useRoundedTopScrollRadius(roundedTop);

  const shellClassName = cn(
    "relative px-4 text-[var(--section-text)] sm:px-6 lg:px-24",
    background && "isolate",
    transparentBg ? "bg-transparent" : "bg-[var(--section-bg)]",
    flushTop ? "pt-0" : "pt-12 lg:pt-[var(--spacing-xxl)]",
    flushBottom ? "pb-0" : "pb-12 lg:pb-[var(--spacing-xxl)]",
    roundedTop &&
      !animateRoundedTop &&
      "rounded-t-[var(--radius-xl)] lg:rounded-t-[var(--radius-2xl)]",
    needsOverflowVisible ? "max-lg:overflow-hidden lg:overflow-visible" : "overflow-hidden",
    className,
  );

  const shellProps = {
    id,
    "data-section": "",
    "data-theme": theme,
    ...(roundImageSection ? { [ROUND_IMAGE_SECTION_ATTR]: "" } : undefined),
    ...(showArchTop ? { "data-arch-top": "" } : undefined),
    ...(showArchBottom ? { "data-arch-bottom": "" } : undefined),
    className: shellClassName,
  };

  const elevatedContentClass = cn(
    background && "relative z-[2]",
    contentClassName,
  );

  const shellChildren = showArchTop ? (
    <SectionArchRoot contentClassName={elevatedContentClass}>
      {children}
    </SectionArchRoot>
  ) : (
    <div
      className={cn(
        "@container mx-auto max-w-7xl",
        elevatedContentClass,
      )}
    >
      {children}
    </div>
  );

  if (animateRoundedTop) {
    return (
      <motion.section
        ref={sectionRef}
        {...shellProps}
        style={{
          borderTopLeftRadius,
          borderTopRightRadius,
        }}
      >
        {background}
        {shellChildren}
      </motion.section>
    );
  }

  return (
    <Tag {...shellProps}>
      {background}
      {shellChildren}
    </Tag>
  );
}

export default SectionShell;
