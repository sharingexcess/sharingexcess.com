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

export type { MotionProps, MotionValue, Transition, Variants } from "framer-motion";

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

/** Video testimonial carousel — smooth glide with zero bounce */
export const carouselSlideSpring: Transition = {
  type: "spring",
  visualDuration: 0.48,
  bounce: 0,
};

/** StatCard hover tilt — snappier than the fill expand */
export const statCardTiltSpring: Transition = {
  type: "spring",
  visualDuration: 0.28,
  bounce: 0.28,
};

/** StatCard text variant arrow — bouncy scale on hover */
export const statCardArrowSpring: Transition = {
  type: "spring",
  visualDuration: 0.36,
  bounce: 0.62,
};

/** Nav featured card hover tilt — subtle settle */
export const navFeaturedTiltSpring: Transition = {
  type: "spring",
  visualDuration: 0.36,
  bounce: 0.38,
};

/** Nav featured card arrow — bouncy scale on hover */
export const navFeaturedArrowSpring: Transition = {
  type: "spring",
  visualDuration: 0.34,
  bounce: 0.42,
};

/** Nav dropdown panel — smooth drop with light Phantom-style overshoot */
export const navDropdownSpring: Transition = {
  type: "spring",
  visualDuration: 0.46,
  bounce: 0.26,
};

/** Nav dropdown close — quicker settle, minimal bounce */
export const navDropdownExitSpring: Transition = {
  type: "spring",
  visualDuration: 0.28,
  bounce: 0.06,
};

/** Nav dropdown links — staggered spring settle */
export const navDropdownLinkSpring: Transition = {
  type: "spring",
  visualDuration: 0.38,
  bounce: 0.2,
};

/** Nav dropdown stacked column — expand one card, collapse siblings */
export const navStackedExpandSpring: Transition = {
  type: "spring",
  visualDuration: 0.32,
  bounce: 0.12,
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

/** Arrow button — springy scale on hover */
export const arrowButtonScaleSpring: Transition = {
  type: "spring",
  visualDuration: 0.36,
  bounce: 0.42,
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

/** Nav menu items — snappier scale + color (no sliding label) */
export const buttonSimpleLabelScaleSpring: Transition = {
  type: "spring",
  visualDuration: 0.14,
  bounce: 0,
};

export const buttonSimpleLabelHoverSpring: Transition = {
  duration: 0.12,
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

/** Display heading — soft focus resolve, slower than Quick spring */
export const blurInSpring: Transition = {
  type: "spring",
  visualDuration: 1.1,
  bounce: 0,
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(16px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: blurInSpring,
  },
};

export const blurWordVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: blurInSpring,
  },
};

export const blurWordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.25 },
  },
};

/** Section headings — wait until the block is well into view before revealing */
export const sectionHeadingInViewOptions = {
  once: true,
  margin: "-55% 0px -40% 0px",
  amount: 0.65,
} as const;

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

/** ~667px travel on 1630px circle — extra inset keeps arc edge off-screen during glide */
export const roundImageGlideOffset = "48%";

/** Figma 1068:6608 → 1068:6755 — image layer scales ~2399px → ~2835px inside the mask */
export const roundImageGlideScaleStart = 0.846;

export const roundImageGlideVariants = (
  fromLeft: boolean,
  offset = roundImageGlideOffset,
): Variants => ({
  hidden: {
    opacity: 0,
    x: fromLeft ? `-${offset}` : offset,
    scale: roundImageGlideScaleStart,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: roundImageGlideSpring,
  },
});

/** Desktop bleed — translate + opacity only so the circle never scales past the frame. */
export const roundImageBleedGlideVariants = (
  fromLeft: boolean,
  offset = roundImageGlideOffset,
): Variants => ({
  hidden: {
    opacity: 0,
    x: fromLeft ? `-${offset}` : offset,
  },
  visible: {
    opacity: 1,
    x: 0,
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

/** Home hero intro — longer pause before the headline begins revealing */
export const homeHeroRevealDelay = 0.55;
export const homeHeroRevealStagger = 0.14;

/** Home page load — nav bar fades and settles from above */
export const homeNavEnterSpring: Transition = {
  type: "spring",
  visualDuration: 0.55,
  bounce: 0,
};

export const homeNavEnterDelay = 0.12;

/** Home page load — hero video frame rises from below */
export const homeHeroVideoEnterSpring: Transition = {
  type: "spring",
  visualDuration: 0.85,
  bounce: 0,
};

export const homeHeroVideoEnterDelay = 0.28;

/** TextImage carousel — snappy spring with bounce for stack enter */
export const textImageStackEnterSpring: Transition = {
  type: "spring",
  visualDuration: 0.42,
  bounce: 0.38,
};

/** TextImage carousel — prior front card settling behind */
export const textImageStackSettleSpring: Transition = {
  type: "spring",
  visualDuration: 0.36,
  bounce: 0.22,
};

/** TextImage inactive title fade */
export const textImageTitleSpring: Transition = {
  duration: 0.4,
  ease: appleEase,
};

/** TextImage background carousel — subtle crossfade between slides */
export const textImageBackgroundFade: Transition = {
  duration: 0.65,
  ease: appleEase,
};

/** Slot-machine metric — full reel cycles before each digit settles */
export const slotMachineReelCycles = 2;

/** Per-digit reel duration — long ease-out for a weighted landing */
export const slotMachineDigitDuration = 1.55;

/** Reel easing — gentle acceleration so the spin doesn't kick in abruptly */
export const slotMachineDigitEase = [0.52, 0, 0.22, 1] as const;

/** Brief pause after scroll trigger before the first digit moves */
export const slotMachineStartDelay = 0.18;

/** Left-to-right stagger between digit columns */
export const slotMachineDigitStagger = 0.08;

/** Scroll trigger — negative margins shrink the viewport so the reel starts later */
export const slotMachineInViewOptions = {
  once: true,
  margin: "-45% 0px -40% 0px",
  amount: 0.6,
} as const;
