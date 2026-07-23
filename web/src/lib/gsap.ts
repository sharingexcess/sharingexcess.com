/**
 * GSAP entry point — import animation primitives from here
 * so plugin registration and re-exports stay centralized.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

/** Register GSAP plugins once (client-only). Safe to call multiple times. */
export function registerGsapPlugins() {
  if (pluginsRegistered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  pluginsRegistered = true;
}

export { gsap, ScrollTrigger, useGSAP };

/** Default easing — smooth deceleration (pairs with Framer `motionEase`) */
export const gsapMotionEase = "power2.out";

/** Apple-style ease-out — no overshoot, refined deceleration */
export const gsapAppleEase = "power3.out";

/** Figma Quick spring feel — 600ms, zero bounce */
export const gsapQuickSpring = {
  duration: 0.6,
  ease: gsapAppleEase,
} as const;

/** Scroll-triggered fade-in-up — use with ScrollTrigger or from() */
export const fadeInUpFrom = {
  autoAlpha: 0,
  y: 24,
  duration: 0.5,
  ease: gsapMotionEase,
} as const;

/** Default tween vars for site-wide GSAP animations */
export const gsapDefaults = {
  duration: 0.5,
  ease: gsapMotionEase,
} as const;
