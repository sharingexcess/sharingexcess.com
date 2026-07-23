import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/cn";
import type { SectionTheme } from "@/lib/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface ScrollPanelAnimationContext {
  panel: HTMLElement;
  content: HTMLElement;
}

export interface ScrollPanelProps {
  theme?: SectionTheme;
  id?: string;
  className?: string;
  scrollDistance?: string;
  scrub?: boolean | number;
  reducedMotion?: boolean;
  buildAnimation: (ctx: ScrollPanelAnimationContext) => gsap.core.Timeline;
  children: React.ReactNode;
}

export function ScrollPanel({
  theme = "light",
  id,
  className,
  scrollDistance = "+=100%",
  scrub = 1,
  reducedMotion = false,
  buildAnimation,
  children,
}: ScrollPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const content = contentRef.current;
      if (!panel || !content) return;

      if (reducedMotion) return;

      const timeline = buildAnimation({ panel, content });

      ScrollTrigger.create({
        trigger: panel,
        start: "top top",
        end: scrollDistance,
        pin: true,
        scrub,
        animation: timeline,
      });
    },
    {
      scope: panelRef,
      dependencies: [reducedMotion, scrollDistance, scrub],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      ref={panelRef}
      id={id}
      data-theme={theme}
      className={cn(
        "relative flex min-h-dvh w-full items-center overflow-hidden bg-[var(--section-bg)] px-6 py-16 text-[var(--section-text)]",
        className,
      )}
    >
      <div ref={contentRef} className="relative mx-auto w-full max-w-6xl">
        {children}
      </div>
    </section>
  );
}

export default ScrollPanel;
