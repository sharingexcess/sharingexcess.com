/**
 * Page transition curtain — entrance-only sweep.
 *
 * There is no cover phase. When a link is clicked the browser navigates
 * immediately (no blocking). On the new page, each layer sweeps from off-screen
 * below all the way through the viewport and off-screen above in one continuous
 * arc. The page content rises simultaneously. No pause, no hesitation.
 *
 * Layers are staggered so the back (kale) leads and the front (banana) follows,
 * creating a layered cascade. The arch on each layer's top edge is visible as it
 * enters; the edge straightens naturally as it exits off the top.
 *
 * The same entrance animation fires on first page load (Joby-style).
 */

import { getLenisInstance } from "@/lib/lenisInstance";
import { transitionEnabledOnThisPage } from "astro:transitions/client";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

// Each layer's stagger delay for the sweep.
// Back layers (kale, se-green) lead; front/smaller layers follow.
const LAYERS = [
  { color: "var(--color-banana)",       height: "78%",  zIndex: 4, delay: 330 },
  { color: "var(--color-bright-kelly)", height: "89%",  zIndex: 3, delay: 220 },
  { color: "var(--color-se-green)",     height: "100%", zIndex: 2, delay: 110 },
  { color: "var(--color-kale)",         height: "100%", zIndex: 1, delay: 0   },
] as const;

// Each layer travels 110vh → -110vh (through the full viewport).
const SWEEP_DURATION  = 860;
// Gentle symmetric in-out — layers accelerate from below, cruise through the
// viewport at a readable pace, and ease off as they exit above.
const SWEEP_EASE      = "cubic-bezier(0.45, 0, 0.55, 1)";
const CONTENT_EASE    = "cubic-bezier(0.22, 1, 0.36, 1)";
const CONTENT_RISE_PX = 80;

// ─── helpers ─────────────────────────────────────────────────────────────────

function run(
  el: HTMLElement,
  keyframes: Keyframe[],
  opts: KeyframeAnimationOptions,
): Promise<void> {
  return new Promise<void>((resolve) => {
    el.getAnimations().forEach((a) => a.cancel());
    const anim = el.animate(keyframes, { fill: "forwards", ...opts });
    anim.onfinish = () => resolve();
    anim.oncancel = () => resolve();
  });
}

function animateContentEntrance(
  main: HTMLElement | null,
  delay    = 0,
  duration = 1050,
): Promise<void> {
  if (!main) return Promise.resolve();
  // fill: "both" applies the first keyframe immediately (before the delay fires),
  // hiding the content until the wipe has passed over it.
  return run(main, [
    { transform: `translateY(${CONTENT_RISE_PX}px)`, opacity: "0" },
    { transform: "translateY(0px)",                   opacity: "1" },
  ], { duration, delay, easing: CONTENT_EASE, fill: "both" });
}

// ─── component ───────────────────────────────────────────────────────────────

export function PageTransitionCurtain() {
  const reducedMotion  = useReducedMotion();
  const rootRef        = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  const getLayers = useCallback((): HTMLElement[] => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>("[data-layer]"));
  }, []);

  // ─── sweep ─────────────────────────────────────────────────────────────────
  // One continuous motion: 110vh below → -110vh above.
  // No separate cover / reveal phases — no hesitation.

  const sweep = useCallback(async (): Promise<void> => {
    if (reducedMotion || animatingRef.current) return;
    animatingRef.current = true;

    const els = getLayers();
    const main = document.querySelector<HTMLElement>("main");

    // Start all layers off-screen below.
    for (const el of els) {
      el.getAnimations().forEach((a) => a.cancel());
      el.style.transform = "translateY(110vh)";
    }

    // Content is hidden immediately (fill:"both" applies the first keyframe
    // before the delay fires), then rises in after the wipe has passed over it.
    const contentAnim = animateContentEntrance(main, 600, 800);

    // Sweep each layer from below through the viewport and out the top.
    await Promise.all([
      ...els.map((el, i) =>
        run(
          el,
          [{ transform: "translateY(110vh)" }, { transform: "translateY(-110vh)" }],
          { duration: SWEEP_DURATION, delay: LAYERS[i].delay, easing: SWEEP_EASE },
        ),
      ),
      contentAnim,
    ]);

    // Reset layers for next navigation.
    for (const el of els) {
      el.getAnimations().forEach((a) => a.cancel());
      el.style.transform = "translateY(110vh)";
    }

    // Clear inline animation styles so content isn't stuck hidden or offset.
    if (main) {
      main.getAnimations().forEach((a) => a.cancel());
      main.style.removeProperty("transform");
      main.style.removeProperty("opacity");
    }

    animatingRef.current = false;
  }, [getLayers, reducedMotion]);

  // ─── wire up Astro navigation ───────────────────────────────────────────────

  useEffect(() => {
    if (!transitionEnabledOnThisPage() || reducedMotion) return;

    const onAfterSwap = () => {
      getLenisInstance()?.scrollTo(0, { immediate: true, force: true });
      void sweep();
    };

    document.addEventListener("astro:after-swap", onAfterSwap);
    return () => document.removeEventListener("astro:after-swap", onAfterSwap);
  }, [reducedMotion, sweep]);

  if (reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden"
    >
      {LAYERS.map((layer, i) => (
        <span
          key={i}
          data-layer
          style={{
            position:             "absolute",
            bottom:               0,
            left:                 0,
            width:                "100%",
            height:               layer.height,
            zIndex:               layer.zIndex,
            backgroundColor:      layer.color,
            transform:            "translateY(110vh)",
            willChange:           "transform",
            borderTopLeftRadius:  "50% 40px",
            borderTopRightRadius: "50% 40px",
          }}
        />
      ))}
    </div>
  );
}
