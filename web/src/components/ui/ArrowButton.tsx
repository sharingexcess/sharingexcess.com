import { cn } from "@/lib/cn";
import {
  arrowButtonScaleSpring,
  buttonHoverSpring,
  buttonLabelSpring,
  buttonSecondaryHoverSpring,
  motion,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";

export interface ArrowButtonProps {
  /** Carousel / navigation direction — `prev` rotates the arrow 180° */
  direction?: "prev" | "next";
  variant?: "primary" | "secondary";
  /** Light/dark surface tokens — matches `Button` `colorScheme` */
  colorScheme?: "light" | "dark";
  /** Circle diameter — default matches Figma carousel nav (75px) */
  size?: "default" | "sm";
  /** `scale` enlarges on hover without changing colors */
  hoverEffect?: "default" | "scale";
  /** Accessible label — required for icon-only controls */
  "aria-label": string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// Figma carousel nav — 75px circle, 43px arrow; tokens align with `Button` primary/secondary.

const PRIMARY_BG = "var(--section-btn-primary-bg, #00843d)";
const PRIMARY_HOVER_BG = "var(--section-btn-primary-hover-bg, #00bc57)";
const PRIMARY_LABEL = "var(--section-btn-primary-label, #ffffff)";
const PRIMARY_HOVER_LABEL = "var(--section-btn-primary-hover-label, #ffffff)";
const PRIMARY_DARK_LABEL = "var(--section-btn-primary-label, #003619)";

const SECTION_BTN = "var(--section-btn, #00843d)";
const SECTION_BTN_HOVER = "var(--section-btn-hover, #003619)";

const primaryColorScheme = {
  light: {
    restBg: PRIMARY_BG,
    hoverBg: PRIMARY_HOVER_BG,
    restColor: PRIMARY_LABEL,
    hoverColor: PRIMARY_HOVER_LABEL,
  },
  dark: {
    restBg: "#ffffff",
    hoverBg: PRIMARY_HOVER_BG,
    restColor: PRIMARY_DARK_LABEL,
    hoverColor: PRIMARY_HOVER_LABEL,
  },
} as const;

const secondaryColorScheme = {
  light: {
    restBorder: SECTION_BTN,
    restColor: SECTION_BTN,
    hoverBorder: SECTION_BTN_HOVER,
    hoverColor: SECTION_BTN_HOVER,
  },
  dark: {
    restBorder: SECTION_BTN,
    restColor: SECTION_BTN,
    hoverBorder: SECTION_BTN_HOVER,
    hoverColor: SECTION_BTN_HOVER,
  },
} as const;

/** CSS-only hover fallback when reduced motion is preferred */
const primaryColorSchemeFallback = {
  light:
    "bg-[var(--section-btn-primary-bg,#00843d)] text-[var(--section-btn-primary-label,#ffffff)] hover:bg-[var(--section-btn-primary-hover-bg,#00bc57)] hover:text-[var(--section-btn-primary-hover-label,#ffffff)] transition-colors",
  dark:
    "bg-white text-[var(--section-btn-primary-label,#003619)] hover:bg-[var(--section-btn-primary-hover-bg,#00bc57)] hover:text-[var(--section-btn-primary-hover-label,#ffffff)] transition-colors",
};

const secondaryColorSchemeFallback = {
  light:
    "border border-[var(--section-btn,#00843d)] text-[var(--section-btn,#00843d)] bg-transparent hover:border-[var(--section-btn-hover,#003619)] hover:text-[var(--section-btn-hover,#003619)] transition-colors duration-200",
  dark:
    "border border-[var(--section-btn,#ffffff)] text-[var(--section-btn,#ffffff)] bg-transparent hover:border-[var(--section-btn-hover,#00bc57)] hover:text-[var(--section-btn-hover,#00bc57)] transition-colors duration-200",
};

const disabledPrimaryClasses: Record<
  NonNullable<ArrowButtonProps["colorScheme"]>,
  string
> = {
  light: "bg-neutral-300 text-white",
  dark: "bg-white/20 text-white/50",
};

const disabledSecondaryClasses: Record<
  NonNullable<ArrowButtonProps["colorScheme"]>,
  string
> = {
  light: "border border-neutral-300 text-neutral-400 bg-transparent",
  dark: "border border-white/30 text-white/50 bg-transparent",
};

const shellBaseClasses =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0 box-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--section-btn,#00843d)]";

const shellSizeClasses = {
  default: "size-[75px] max-lg:size-14",
  sm: "size-12",
} as const;

const iconSizeClasses = {
  default: "size-[43px] max-lg:size-8",
  sm: "size-6",
} as const;

const primaryScaleOnlyFallback = {
  light:
    "bg-[var(--section-btn-primary-bg,#00843d)] text-[var(--section-btn-primary-label,#ffffff)] transition-transform duration-300 ease-out hover:scale-[1.08]",
  dark:
    "bg-white text-[var(--section-btn-primary-label,#003619)] transition-transform duration-300 ease-out hover:scale-[1.08]",
};

const scaleOnlyHoverTransition = {
  scale: { type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] },
} as const;

const primaryShellVariants = (
  colorScheme: keyof typeof primaryColorScheme,
  hoverEffect: NonNullable<ArrowButtonProps["hoverEffect"]> = "default",
): Variants => {
  const { restBg, hoverBg, restColor, hoverColor } = primaryColorScheme[colorScheme];

  if (hoverEffect === "scale") {
    return {
      rest: {
        scale: 1,
        backgroundColor: restBg,
        color: restColor,
        transition: scaleOnlyHoverTransition,
      },
      hover: {
        scale: 1.08,
        backgroundColor: restBg,
        color: restColor,
        transition: scaleOnlyHoverTransition,
      },
    };
  }

  return {
    rest: { scale: 1, backgroundColor: restBg, color: restColor },
    hover: {
      scale: 1.08,
      backgroundColor: hoverBg,
      color: hoverColor,
      transition: {
        scale: arrowButtonScaleSpring,
        backgroundColor: { ...buttonHoverSpring, delay: 0.06 },
        color: buttonLabelSpring,
      },
    },
  };
};

const secondaryShellVariants = (
  colorScheme: keyof typeof secondaryColorScheme,
): Variants => {
  const { restBorder, restColor, hoverBorder, hoverColor } =
    secondaryColorScheme[colorScheme];

  return {
    rest: {
      scale: 1,
      borderColor: restBorder,
      color: restColor,
      backgroundColor: "transparent",
    },
    hover: {
      scale: 1.08,
      borderColor: hoverBorder,
      color: hoverColor,
      backgroundColor: "transparent",
      transition: {
        scale: arrowButtonScaleSpring,
        borderColor: buttonSecondaryHoverSpring,
        color: buttonSecondaryHoverSpring,
      },
    },
  };
};

function ArrowIcon({
  direction,
  size = "default",
}: {
  direction: NonNullable<ArrowButtonProps["direction"]>;
  size?: NonNullable<ArrowButtonProps["size"]>;
}) {
  return (
    <svg
      width="43"
      height="43"
      viewBox="0 0 43 43"
      fill="none"
      aria-hidden
      className={cn(
        "block",
        iconSizeClasses[size],
        direction === "prev" && "rotate-180",
      )}
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

export function ArrowButton({
  direction = "next",
  variant = "primary",
  colorScheme = "light",
  size = "default",
  hoverEffect = "default",
  className,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ArrowButtonProps) {
  const reduceMotion = useReducedMotion();
  const isPrimary = variant === "primary";
  const useMotion = !reduceMotion && !disabled;

  const classes = cn(
    shellBaseClasses,
    shellSizeClasses[size],
    disabled
      ? cn(
          isPrimary
            ? disabledPrimaryClasses[colorScheme]
            : disabledSecondaryClasses[colorScheme],
          "pointer-events-none cursor-not-allowed",
        )
      : isPrimary
        ? useMotion
          ? "border-0"
          : hoverEffect === "scale"
            ? primaryScaleOnlyFallback[colorScheme]
            : primaryColorSchemeFallback[colorScheme]
        : useMotion
          ? "border bg-transparent"
          : secondaryColorSchemeFallback[colorScheme],
    className,
  );

  const icon = <ArrowIcon direction={direction} size={size} />;

  if (useMotion) {
    return (
      <motion.button
        type={type}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        className={classes}
        variants={
          isPrimary
            ? primaryShellVariants(colorScheme, hoverEffect)
            : secondaryShellVariants(colorScheme)
        }
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
      >
        {icon}
      </motion.button>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={classes}
    >
      {icon}
    </button>
  );
}

export default ArrowButton;
