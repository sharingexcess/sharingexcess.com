import { cn } from "@/lib/cn";
import {
  buttonHoverSpring,
  buttonLabelSpring,
  buttonScaleSpring,
  buttonSecondaryHoverSpring,
  buttonSecondaryScaleSpring,
  buttonSecondaryTextInSpring,
  buttonSecondaryTextOutSpring,
  buttonSimpleLabelHoverSpring,
  buttonSimpleLabelScaleSpring,
  buttonTextInSpring,
  buttonTextOutSpring,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "@/lib/motion";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "tertiary";
  size?: "lg" | "md" | "sm";
  /** Light/dark surface tokens for primary, secondary, and tertiary — ghost is for controls over photo/video backgrounds */
  colorScheme?: "light" | "dark";
  /** Force hover visuals (e.g. open nav dropdown parent) */
  active?: boolean;
  /** Plain label hover — color + scale only, no sliding duplicate text */
  simpleLabel?: boolean;
  href?: string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  role?: React.AriaRole;
}

// Figma node 975:1133
// Primary light: #00843d bg → #00bc57 (bright-kelly) on hover, white text
// Primary dark:  white bg, #003619 text → bright-kelly on hover
// Secondary light: #00843d border + text → kale on hover (no fill)
// Secondary dark: white border + text → bright-kelly on hover (no fill)
// Tertiary light: #00843d text only → kale on hover (no border/fill)
// Tertiary dark: white text only → bright-kelly on hover (no border/fill)
// Ghost (Home Secondary / media controls): tinted dark fill over photography and video

const variantClasses: Record<Exclude<NonNullable<ButtonProps["variant"]>, "ghost" | "tertiary">, string> = {
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

/** Semi-transparent dark fill for ghost buttons over photography — 0.60 is the lightest alpha that keeps white text at AA (4.5:1) over white. */
const GHOST_BG = "rgba(27, 27, 21, 0.60)";
const GHOST_HOVER_BG = "rgba(27, 27, 21, 0.68)";

const ghostShellVariants: Variants = {
  rest: {
    scale: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    backgroundColor: GHOST_BG,
  },
  hover: {
    scale: 1.04,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: GHOST_HOVER_BG,
    transition: {
      scale: buttonScaleSpring,
      borderColor: buttonSecondaryHoverSpring,
      backgroundColor: buttonSecondaryHoverSpring,
    },
  },
};

/** CSS-only ghost hover when reduced motion is preferred */
const ghostFallbackClasses =
  "group relative isolate overflow-hidden border-2 border-white/45 bg-[rgba(27,27,21,0.60)] text-white transition-[border-color,background-color] duration-200 hover:border-white/60 hover:bg-[rgba(27,27,21,0.68)]";

const ghostMotionClasses =
  "group relative isolate overflow-hidden border-2 text-white";

const SECTION_BTN = "var(--section-btn, #00843d)";
const SECTION_BTN_HOVER = "var(--section-btn-hover, #003619)";

const SECONDARY_BG = "var(--btn-bg, transparent)";
const SECONDARY_HOVER_BG = "var(--btn-bg-hover, var(--btn-bg, transparent))";

const secondaryColorScheme = {
  light: {
    base: "border-[var(--section-btn,#00843d)] text-[var(--section-btn,#00843d)] bg-[var(--btn-bg,transparent)]",
    restBorder: SECTION_BTN,
    restColor: SECTION_BTN,
    hoverBorder: SECTION_BTN_HOVER,
    hoverColor: SECTION_BTN_HOVER,
  },
  dark: {
    base: "border-[var(--section-btn,#ffffff)] text-[var(--section-btn,#ffffff)] bg-[var(--btn-bg,transparent)]",
    restBorder: SECTION_BTN,
    restColor: SECTION_BTN,
    hoverBorder: SECTION_BTN_HOVER,
    hoverColor: SECTION_BTN_HOVER,
  },
} as const;

/** CSS-only hover fallback when reduced motion is preferred */
const secondaryColorSchemeFallback = {
  light:
    "border-[var(--section-btn,#00843d)] text-[var(--section-btn,#00843d)] bg-[var(--btn-bg,transparent)] hover:border-[var(--section-btn-hover,#003619)] hover:text-[var(--section-btn-hover,#003619)] hover:bg-[var(--btn-bg-hover,var(--btn-bg,transparent))] transition-colors duration-200",
  dark:
    "border-[var(--section-btn,#ffffff)] text-[var(--section-btn,#ffffff)] bg-[var(--btn-bg,transparent)] hover:border-[var(--section-btn-hover,#00bc57)] hover:text-[var(--section-btn-hover,#00bc57)] hover:bg-[var(--btn-bg-hover,var(--btn-bg,transparent))] transition-colors duration-200",
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
  "relative isolate overflow-hidden border-2 border-white/25 bg-[rgba(27,27,21,0.45)] text-white/50";

const disabledTertiaryClasses: Record<NonNullable<ButtonProps["colorScheme"]>, string> = {
  light: "text-neutral-400",
  dark: "text-white/50",
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
      backgroundColor: SECONDARY_BG,
    },
    hover: {
      scale: 1.04,
      borderColor: hoverBorder,
      color: hoverColor,
      backgroundColor: SECONDARY_HOVER_BG,
      transition: {
        scale: buttonSecondaryScaleSpring,
        borderColor: buttonSecondaryHoverSpring,
        color: buttonSecondaryHoverSpring,
      },
    },
  };
};

const tertiaryColorScheme = {
  light: {
    base: "text-[var(--section-btn,#00843d)]",
    restColor: SECTION_BTN,
    hoverColor: SECTION_BTN_HOVER,
  },
  dark: {
    base: "text-white",
    restColor: "#ffffff",
    hoverColor: PRIMARY_HOVER_BG,
  },
} as const;

/** CSS-only hover fallback when reduced motion is preferred */
const tertiaryColorSchemeFallback = {
  light:
    "text-[var(--section-btn,#00843d)] hover:text-[var(--section-btn-hover,#003619)] transition-colors duration-200",
  dark:
    "text-white hover:text-[var(--section-btn-primary-hover-bg,#00bc57)] transition-colors duration-200",
};

const tertiaryActiveClasses = {
  light: "text-[var(--section-btn-hover,#003619)]",
  dark: "text-[var(--section-btn-primary-hover-bg,#00bc57)]",
};

const tertiaryShellVariants = (
  colorScheme: keyof typeof tertiaryColorScheme,
  snappy = false,
): Variants => {
  const { restColor, hoverColor } = tertiaryColorScheme[colorScheme];
  const scaleSpring = snappy ? buttonSimpleLabelScaleSpring : buttonSecondaryScaleSpring;
  const colorSpring = snappy ? buttonSimpleLabelHoverSpring : buttonSecondaryHoverSpring;

  return {
    rest: { scale: 1, color: restColor },
    hover: {
      scale: 1.04,
      color: hoverColor,
      transition: {
        scale: scaleSpring,
        color: colorSpring,
      },
    },
  };
};

// Tertiary — text-only; no pill, no border, no fill. Font-size matches primary/secondary at each size.
const tertiarySizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  lg: "text-base leading-[0.82] lg:text-[20px]",
  md: "text-[16px] leading-[0.82] lg:text-[20px]",
  sm: "text-sm leading-[0.82] lg:text-[16px]",
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
  active,
  simpleLabel,
  href,
  className,
  type = "button",
  disabled,
  onClick,
  role,
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const isGhost = variant === "ghost";
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isTertiary = variant === "tertiary";
  const usePrimaryMotion = isPrimary && !reduceMotion && !disabled;
  const useSecondaryMotion = isSecondary && !reduceMotion && !disabled;
  const useGhostMotion = isGhost && !reduceMotion && !disabled;
  const useTertiaryMotion = isTertiary && !reduceMotion && !disabled;
  const useMotionHover = usePrimaryMotion || useSecondaryMotion || useGhostMotion || useTertiaryMotion;
  const useSlidingLabel =
    (usePrimaryMotion || useSecondaryMotion || useGhostMotion || useTertiaryMotion) &&
    !simpleLabel;

  const primaryScheme = primaryColorScheme[colorScheme];
  const secondaryScheme = secondaryColorScheme[colorScheme];

  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center box-border font-sans font-semibold whitespace-nowrap no-underline",
    disabled
      ? cn(
          isGhost
            ? disabledGhostClasses
            : isPrimary
              ? disabledPrimaryClasses[colorScheme]
              : isSecondary
                ? disabledSecondaryClasses[colorScheme]
                : disabledTertiaryClasses[colorScheme],
          "pointer-events-none cursor-not-allowed",
        )
      : cn(
          isGhost && (useGhostMotion ? ghostMotionClasses : ghostFallbackClasses),
          !isGhost && !isTertiary && variantClasses[variant as Exclude<typeof variant, "ghost" | "tertiary">],
          isPrimary &&
            (usePrimaryMotion
              ? cn(primaryScheme.base, "relative isolate overflow-hidden")
              : primaryColorSchemeFallback[colorScheme]),
          isSecondary &&
            (useSecondaryMotion
              ? secondaryScheme.base
              : secondaryColorSchemeFallback[colorScheme]),
          isTertiary &&
            (useTertiaryMotion
              ? tertiaryColorScheme[colorScheme].base
              : cn(
                  tertiaryColorSchemeFallback[colorScheme],
                  simpleLabel && "transition-colors duration-150",
                  active && tertiaryActiveClasses[colorScheme],
                )),
        ),
    isTertiary ? tertiarySizeClasses[size] : sizeClasses[size],
    className,
  );

  const content = (
    <>
      {usePrimaryMotion && <ButtonColorRipple />}
      {useSlidingLabel ? (
        <SlidingButtonLabel
          textOutTransition={
            useSecondaryMotion || useTertiaryMotion
              ? buttonSecondaryTextOutSpring
              : buttonTextOutSpring
          }
          textInTransition={
            useSecondaryMotion || useTertiaryMotion
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
          : useTertiaryMotion
            ? tertiaryShellVariants(colorScheme, simpleLabel)
            : ghostShellVariants,
      initial: "rest" as const,
      whileHover: "hover" as const,
      animate: (active ? "hover" : "rest") as const,
    };

    if (href) {
      return (
        <motion.a href={href} role={role} onClick={onClick} {...motionProps}>
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button type={type} disabled={disabled} role={role} onClick={onClick} {...motionProps}>
        {content}
      </motion.button>
    );
  }

  if (disabled) {
    if (href) {
      return (
        <span aria-disabled="true" role={role} className={classes}>
          {content}
        </span>
      );
    }

    return (
      <button type={type} className={classes} disabled role={role}>
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <a href={href} role={role} onClick={onClick} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} role={role} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export default Button;
