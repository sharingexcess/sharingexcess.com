/**
 * Framer Motion entry point — import animation primitives from here
 * so presets and re-exports stay centralized.
 */
import type { Transition, Variants } from "framer-motion";

export {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export type { MotionProps, Transition, Variants } from "framer-motion";

/** Default easing — smooth deceleration */
export const motionEase = [0.25, 0.1, 0.25, 1] as const;

/** Apple-style ease-out — no overshoot, refined deceleration */
export const appleEase = [0.32, 0.72, 0, 1] as const;

/**
 * Figma prototype — Smart animate + Quick spring, 600ms.
 * `visualDuration` matches the duration shown in Figma; `bounce` maps to Quick’s light spring.
 */
export const figmaQuickSpring: Transition = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0,
};

/** StatCard hover tilt — snappier than the fill expand */
export const statCardTiltSpring: Transition = {
  type: "spring",
  visualDuration: 0.28,
  bounce: 0.28,
};

/** Primary button color ripple — smooth sweep, zero bounce */
export const buttonHoverSpring: Transition = {
  type: "spring",
  visualDuration: 0.4,
  bounce: 0,
};

/** Dark-scheme label color — trails the fill */
export const buttonLabelSpring: Transition = {
  duration: 0.36,
  ease: appleEase,
  delay: 0.06,
};

/** Primary button shell — barely perceptible lift */
export const buttonScaleSpring: Transition = {
  type: "spring",
  visualDuration: 0.34,
  bounce: 0,
};

/** Secondary button — faster scale + border/text (no fill ripple) */
export const buttonSecondaryScaleSpring: Transition = {
  type: "spring",
  visualDuration: 0.22,
  bounce: 0,
};

export const buttonSecondaryHoverSpring: Transition = {
  duration: 0.2,
  ease: appleEase,
};

/** Secondary label slide — matched to faster shell hover */
export const buttonSecondaryTextOutSpring: Transition = {
  duration: 0.2,
  ease: appleEase,
};

export const buttonSecondaryTextInSpring: Transition = {
  duration: 0.2,
  ease: appleEase,
  delay: 0.015,
};

/** Label slide out — ease curve, not spring */
export const buttonTextOutSpring: Transition = {
  duration: 0.42,
  ease: appleEase,
};

/** Label slide in — matched timing, hairline overlap */
export const buttonTextInSpring: Transition = {
  duration: 0.42,
  ease: appleEase,
  delay: 0.025,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: motionEase },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: motionEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** Hero heading — word-by-word reveal; soft spring, no overshoot */
export const heroWordSpring: Transition = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0,
};

/**
 * Round image section — Figma Img-Section-Animation (1068:6602 → 1068:6749).
 * Smart animate + Quick spring, 600ms; circle glides in from off-screen.
 */
export const roundImageGlideSpring: Transition = figmaQuickSpring;

/** ~667px travel on 1630px circle (Figma img-right-round start → end) */
export const roundImageGlideOffset = "41%";

/** Figma 1068:6608 → 1068:6755 — image layer scales ~2399px → ~2835px inside the mask */
export const roundImageGlideScaleStart = 0.846;

export const roundImageGlideVariants = (
  fromLeft: boolean,
  offset = roundImageGlideOffset,
): Variants => ({
  hidden: {
    x: fromLeft ? `-${offset}` : offset,
    scale: roundImageGlideScaleStart,
  },
  visible: {
    x: 0,
    scale: 1,
    transition: roundImageGlideSpring,
  },
});

export const heroWordVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: heroWordSpring,
  },
};

export const heroWordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};
