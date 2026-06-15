import { cn } from "@/lib/cn";
import {
  buttonHoverSpring,
  buttonLabelSpring,
  buttonScaleSpring,
  buttonSecondaryHoverSpring,
  buttonSecondaryScaleSpring,
  buttonSecondaryTextInSpring,
  buttonSecondaryTextOutSpring,
  buttonTextInSpring,
  buttonTextOutSpring,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "@/lib/motion";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "lg" | "md" | "sm";
  /** Light/dark surface tokens for primary and secondary — ghost is reserved for photo backgrounds (e.g. home hero) */
  colorScheme?: "light" | "dark";
  href?: string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

// Figma node 975:1133
// Primary light: #00843d bg → #00bc57 (bright-kelly) on hover, white text
// Primary dark:  white bg, #003619 text → bright-kelly on hover
// Secondary light: #00843d border + text → kale on hover (no fill)
// Secondary dark: white border + text → bright-kelly on hover (no fill)
// Ghost (Home Secondary): Figma node 1010:1302 — liquid glass; photo backgrounds only

const variantClasses: Record<Exclude<NonNullable<ButtonProps["variant"]>, "ghost">, string> = {
  primary:   "border-0",
  secondary: "border bg-transparent",
};

const PRIMARY_BG = "var(--section-btn-primary-bg, #00843d)";
const PRIMARY_HOVER_BG = "var(--section-btn-primary-hover-bg, #00bc57)";
const PRIMARY_LABEL = "var(--section-btn-primary-label, #ffffff)";
const PRIMARY_HOVER_LABEL = "var(--section-btn-primary-hover-label, #ffffff)";
const PRIMARY_DARK_LABEL = "var(--section-btn-primary-label, #003619)";

/** CSS-only hover fallback when reduced motion is preferred */
const primaryColorSchemeFallback = {
  light:
    "bg-[var(--section-btn-primary-bg,#00843d)] text-[var(--section-btn-primary-label,#ffffff)]! hover:bg-[var(--section-btn-primary-hover-bg,#00bc57)] hover:text-[var(--section-btn-primary-hover-label,#ffffff)]! transition-colors",
  dark:
    "bg-white text-[var(--section-btn-primary-label,#003619)] hover:bg-[var(--section-btn-primary-hover-bg,#00bc57)] hover:text-[var(--section-btn-primary-hover-label,#ffffff)] transition-colors",
};

const primaryColorScheme = {
  light: {
    base: "text-[var(--section-btn-primary-label,#ffffff)]!",
    restBg: PRIMARY_BG,
    hoverBg: PRIMARY_HOVER_BG,
    restColor: PRIMARY_LABEL,
    hoverColor: PRIMARY_HOVER_LABEL,
  },
  dark: {
    base: "text-[var(--section-btn-primary-label,#003619)]",
    restBg: "#ffffff",
    hoverBg: PRIMARY_HOVER_BG,
    restColor: PRIMARY_DARK_LABEL,
    hoverColor: PRIMARY_HOVER_LABEL,
  },
} as const;

const FILL_LAYERS = [
  { offset: "15%", className: "bg-banana" },
  { offset: "110%", className: "bg-tangerine" },
  { offset: "220%", className: "bg-bright-kelly" },
] as const;

const fillGroupVariants: Variants = {
  rest: { y: "100%" },
  hover: {
    y: "-130%",
    transition: {
      ...buttonHoverSpring,
      visualDuration: 0.48,
    },
  },
};

function circleVariants(yOffset: string, layerIndex: number): Variants {
  const waveSpring: Transition = {
    ...buttonHoverSpring,
    delay: layerIndex * 0.035,
  };

  return {
    rest: { y: yOffset, scale: 1 },
    hover: {
      y: yOffset,
      scale: 2.75,
      transition: waveSpring,
    },
  };
}

const primaryLabelColorVariants = (
  colorScheme: keyof typeof primaryColorScheme,
): Variants => ({
  rest: {
    color: colorScheme === "dark" ? PRIMARY_DARK_LABEL : PRIMARY_LABEL,
  },
  hover: {
    color: PRIMARY_HOVER_LABEL,
    transition: buttonLabelSpring,
  },
});

const labelInVariants = (outTransition: Transition): Variants => ({
  rest: { y: "0%" },
  hover: { y: "-100%", transition: outTransition },
});

const labelOutVariants = (inTransition: Transition): Variants => ({
  rest: { y: "0%" },
  hover: { y: "-100%", transition: inTransition },
});

/**
 * Joby-style dual-layer label.
 * Clip uses relaxed line-height so Poppins ascenders/descenders stay visible;
 * the duplicate sits at `top-full` so it is fully below the mask at rest.
 * Text color is driven by `colorVariants` on primary buttons; secondary/ghost inherit from the shell.
 */
function SlidingButtonLabel({
  children,
  textOutTransition,
  textInTransition,
  colorVariants,
}: {
  children: React.ReactNode;
  textOutTransition: Transition;
  textInTransition: Transition;
  colorVariants?: Variants;
}) {
  return (
    <motion.span
      className="relative z-10 flex h-full items-center"
      variants={colorVariants}
    >
      <span className="relative overflow-hidden leading-[1.25]">
        <motion.span
          className="block whitespace-nowrap will-change-transform"
          variants={labelInVariants(textOutTransition)}
        >
          {children}
        </motion.span>
        <motion.span
          aria-hidden
          className="absolute inset-x-0 top-full block whitespace-nowrap will-change-transform"
          variants={labelOutVariants(textInTransition)}
        >
          {children}
        </motion.span>
      </span>
    </motion.span>
  );
}

const primaryShellVariants = (
  colorScheme: keyof typeof primaryColorScheme,
): Variants => {
  const { restBg, hoverBg, restColor, hoverColor } = primaryColorScheme[colorScheme];
  return {
    rest: { scale: 1, backgroundColor: restBg, color: restColor },
    hover: {
      scale: 1.04,
      backgroundColor: hoverBg,
      color: hoverColor,
      transition: {
        scale: buttonScaleSpring,
        backgroundColor: { ...buttonHoverSpring, delay: 0.12 },
        color: buttonLabelSpring,
      },
    },
  };
};

function ButtonColorRipple() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-clip"
      style={{ transformOrigin: "center bottom" }}
      variants={fillGroupVariants}
    >
      {FILL_LAYERS.map(({ offset, className: layerClass }, index) => (
        <motion.span
          key={offset}
          className={cn(
            "absolute left-1/2 top-0 aspect-square w-[140%] -translate-x-1/2 rounded-full",
            layerClass,
          )}
          style={{ zIndex: index + 1, transformOrigin: "center center" }}
          variants={circleVariants(offset, index)}
        />
      ))}
    </motion.span>
  );
}

/** Figma liquid glass — light frost; minimal blur for label legibility over photos */
function GhostGlassLayers() {
  const frostClass =
    "pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-white/[0.08] backdrop-blur-[2px]";
  const sheenClass =
    "pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-gradient-to-br from-white/10 via-transparent to-black/[0.04]";

  return (
    <>
      <span
        aria-hidden
        className={cn(
          frostClass,
          "transition-[background-color] duration-200 group-hover:bg-white/[0.10]",
        )}
      />
      <span
        aria-hidden
        className={cn(sheenClass, "transition-opacity duration-200 group-hover:from-white/12")}
      />
    </>
  );
}

const ghostShellVariants: Variants = {
  rest: {
    scale: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    backgroundColor: "transparent",
  },
  hover: {
    scale: 1.04,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "transparent",
    transition: {
      scale: buttonScaleSpring,
      borderColor: buttonSecondaryHoverSpring,
    },
  },
};

/** CSS-only ghost hover when reduced motion is preferred */
const ghostFallbackClasses =
  "group relative isolate overflow-hidden border-2 border-white/45 bg-transparent text-white transition-[border-color] duration-200 hover:border-white/60";

const ghostMotionClasses =
  "group relative isolate overflow-hidden border-2 bg-transparent text-white";

const SECTION_BTN = "var(--section-btn, #00843d)";
const SECTION_BTN_HOVER = "var(--section-btn-hover, #003619)";

const secondaryColorScheme = {
  light: {
    base: "border-[var(--section-btn,#00843d)] text-[var(--section-btn,#00843d)] bg-transparent",
    restBorder: SECTION_BTN,
    restColor: SECTION_BTN,
    hoverBorder: SECTION_BTN_HOVER,
    hoverColor: SECTION_BTN_HOVER,
  },
  dark: {
    base: "border-[var(--section-btn,#ffffff)] text-[var(--section-btn,#ffffff)] bg-transparent",
    restBorder: SECTION_BTN,
    restColor: SECTION_BTN,
    hoverBorder: SECTION_BTN_HOVER,
    hoverColor: SECTION_BTN_HOVER,
  },
} as const;

/** CSS-only hover fallback when reduced motion is preferred */
const secondaryColorSchemeFallback = {
  light:
    "border-[var(--section-btn,#00843d)] text-[var(--section-btn,#00843d)] bg-transparent hover:border-[var(--section-btn-hover,#003619)] hover:text-[var(--section-btn-hover,#003619)] transition-colors duration-200",
  dark:
    "border-[var(--section-btn,#ffffff)] text-[var(--section-btn,#ffffff)] bg-transparent hover:border-[var(--section-btn-hover,#00bc57)] hover:text-[var(--section-btn-hover,#00bc57)] transition-colors duration-200",
};

/** Disabled — no Figma spec; muted neutrals, no hover/motion */
const disabledPrimaryClasses: Record<
  NonNullable<ButtonProps["colorScheme"]>,
  string
> = {
  light: "border-0 bg-neutral-300 text-white",
  dark: "border-0 bg-white/20 text-white/50",
};

const disabledSecondaryClasses: Record<
  NonNullable<ButtonProps["colorScheme"]>,
  string
> = {
  light: "border border-neutral-300 text-neutral-400 bg-transparent",
  dark: "border border-white/30 text-white/50 bg-transparent",
};

const disabledGhostClasses =
  "relative isolate overflow-hidden border-2 border-white/25 bg-transparent text-white/50";

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
      scale: 1.04,
      borderColor: hoverBorder,
      color: hoverColor,
      backgroundColor: "transparent",
      transition: {
        scale: buttonSecondaryScaleSpring,
        borderColor: buttonSecondaryHoverSpring,
        color: buttonSecondaryHoverSpring,
      },
    },
  };
};

// Figma node 975:1133 — fixed heights (LG 64, MD 48, SM 45) with horizontal padding only;
// vertical centering via flex avoids extra height from Poppins font metrics vs Figma auto-layout.
// Each size steps down one notch below lg for mobile touch-friendly proportions.
const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  lg: "h-12 px-5 text-base leading-[0.82] rounded-[99px] lg:h-16 lg:px-[24px] lg:text-[20px]",
  md: "h-[45px] px-4 text-[16px] leading-[0.82] rounded-[99px] lg:h-12 lg:px-[20px] lg:text-[20px]",
  sm: "h-11 px-3.5 text-sm leading-[0.82] rounded-[99px] lg:h-[45px] lg:px-[16px] lg:text-[16px]",
};

export function Button({
  children,
  variant = "primary",
  size = "lg",
  colorScheme = "light",
  href,
  className,
  type = "button",
  disabled,
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const isGhost = variant === "ghost";
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const usePrimaryMotion = isPrimary && !reduceMotion && !disabled;
  const useSecondaryMotion = isSecondary && !reduceMotion && !disabled;
  const useGhostMotion = isGhost && !reduceMotion && !disabled;
  const useMotionHover = usePrimaryMotion || useSecondaryMotion || useGhostMotion;
  const useSlidingLabel = usePrimaryMotion || useSecondaryMotion || useGhostMotion;

  const primaryScheme = primaryColorScheme[colorScheme];
  const secondaryScheme = secondaryColorScheme[colorScheme];

  const classes = cn(
    "inline-flex items-center justify-center box-border font-sans font-semibold whitespace-nowrap no-underline",
    disabled
      ? cn(
          isGhost
            ? disabledGhostClasses
            : isPrimary
              ? disabledPrimaryClasses[colorScheme]
              : disabledSecondaryClasses[colorScheme],
          "pointer-events-none cursor-not-allowed",
        )
      : cn(
          isGhost && (useGhostMotion ? ghostMotionClasses : ghostFallbackClasses),
          !isGhost && variantClasses[variant as Exclude<typeof variant, "ghost">],
          isPrimary &&
            (usePrimaryMotion
              ? cn(primaryScheme.base, "relative isolate overflow-hidden")
              : primaryColorSchemeFallback[colorScheme]),
          isSecondary &&
            (useSecondaryMotion
              ? secondaryScheme.base
              : secondaryColorSchemeFallback[colorScheme]),
        ),
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      {usePrimaryMotion && <ButtonColorRipple />}
      {isGhost && !disabled && <GhostGlassLayers />}
      {useSlidingLabel ? (
        <SlidingButtonLabel
          textOutTransition={
            useSecondaryMotion
              ? buttonSecondaryTextOutSpring
              : buttonTextOutSpring
          }
          textInTransition={
            useSecondaryMotion
              ? buttonSecondaryTextInSpring
              : buttonTextInSpring
          }
          colorVariants={
            usePrimaryMotion ? primaryLabelColorVariants(colorScheme) : undefined
          }
        >
          {children}
        </SlidingButtonLabel>
      ) : (
        <span className={cn(isGhost && "relative z-10")}>{children}</span>
      )}
    </>
  );

  if (useMotionHover) {
    const motionProps = {
      className: classes,
      variants: usePrimaryMotion
        ? primaryShellVariants(colorScheme)
        : useSecondaryMotion
          ? secondaryShellVariants(colorScheme)
          : ghostShellVariants,
      initial: "rest" as const,
      whileHover: "hover" as const,
      animate: "rest" as const,
    };

    if (href) {
      return (
        <motion.a href={href} {...motionProps}>
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button type={type} disabled={disabled} {...motionProps}>
        {content}
      </motion.button>
    );
  }

  if (disabled) {
    if (href) {
      return (
        <span aria-disabled="true" className={classes}>
          {content}
        </span>
      );
    }

    return (
      <button type={type} className={classes} disabled>
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes}>
      {content}
    </button>
  );
}

export default Button;
