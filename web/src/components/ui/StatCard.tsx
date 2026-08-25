import { cn } from "@/lib/cn";
import { useFitText } from "@/lib/useFitText";
import { bodyLgClassName, statCardTextHeaderClassName } from "@/lib/typography";
import {
  figmaQuickSpring,
  motion,
  motionEase,
  statCardArrowSpring,
  statCardTiltSpring,
  useReducedMotion,
  type Variants,
} from "@/lib/motion";

/** Figma hover tilt — node 967:1028 */
const TILT_LEFT = -3.38;
const TILT_RIGHT = 2.46;

const colorVariants = {
  green: {
    accent: "bg-bright-kelly",
    arrowButtonHover: "group-hover:bg-bright-kelly",
    colorHoverText: "group-hover:text-kale",
    tilt: TILT_LEFT,
  },
  yellow: {
    accent: "bg-banana",
    arrowButtonHover: "group-hover:bg-banana",
    colorHoverText: "group-hover:text-dark-cherry",
    tilt: TILT_RIGHT,
  },
  orange: {
    accent: "bg-tangerine",
    arrowButtonHover: "group-hover:bg-tangerine",
    colorHoverText: "group-hover:text-dark-cherry",
    tilt: TILT_LEFT,
  },
} as const;

/** Figma — accent circle and arrow share this 88px box */
const ACTION_BOTTOM = 15;
const ACTION_RIGHT = 23;
const ACTION_SIZE = 88;

/** Text image cards — smaller arrow control */
const TEXT_ACTION_BOTTOM = 20;
const TEXT_ACTION_RIGHT = 28;
const TEXT_ACTION_SIZE = 64;
const TEXT_ARROW_SIZE = 32;

/** Resting color dot — scaled down from 88px */
const COLOR_REST_SCALE = 0.7;

/** Scale from circle center to cover the card corners on hover */
const COLOR_FILL_SCALE = 18;

const actionButtonStyle = {
  bottom: ACTION_BOTTOM,
  right: ACTION_RIGHT,
  width: ACTION_SIZE,
  height: ACTION_SIZE,
} as const;

const actionButtonClass =
  "absolute z-10 flex items-center justify-center pointer-events-none";

const colorFillVariants: Variants = {
  rest: { scale: COLOR_REST_SCALE },
  hover: {
    scale: COLOR_FILL_SCALE,
    transition: figmaQuickSpring,
  },
};

/** Figma image hover — 893px circle at left -157, top -227 */
const IMAGE_CIRCLE_SIZE = 893;
const IMAGE_CIRCLE_LEFT = -157;
const IMAGE_CIRCLE_TOP = -227;

/** Image reveal — quick ease-out fade (no spring overshoot) */
const imageFadeTransition = { duration: 0.32, ease: motionEase };

const imageFillVariants: Variants = {
  rest: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: imageFadeTransition,
  },
};

const imageScrimVariants: Variants = {
  rest: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: imageFadeTransition,
  },
};

const imageAccentVariants: Variants = {
  rest: { scale: 1, opacity: 1 },
  hover: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15, ease: motionEase },
  },
};

const imageButtonVariants: Variants = {
  rest: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { ...imageFadeTransition, delay: 0.1 },
  },
};

const textArrowButtonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.16,
    transition: statCardArrowSpring,
  },
};

const IMAGE_SCRIM_GRADIENT =
  "linear-gradient(0.59deg, rgba(27,27,21,0.62) 52%, rgba(27,27,21,0.48) 72%, rgba(23,23,23,0) 96%)";

const IMAGE_SCRIM_GRADIENT_SUBTLE =
  "linear-gradient(to top, rgba(27,27,21,0.58) 0%, rgba(27,27,21,0.42) 38%, rgba(23,23,23,0) 78%)";

export type StatCardColorVariant = keyof typeof colorVariants;
/** @deprecated Use StatCardColorVariant */
export type StatCardVariant = StatCardColorVariant;

export type StatCardImageTilt = "tiltLeft" | "tiltRight";

const imageTiltDegrees: Record<StatCardImageTilt, number> = {
  tiltLeft: TILT_LEFT,
  tiltRight: TILT_RIGHT,
};

export type StatCardContentVariant = "metric" | "text";

type StatCardBaseProps = {
  value: string;
  label: string;
  href?: string;
  /** Metric (default) uses display numerals; text uses eyebrow + lg body */
  contentVariant?: StatCardContentVariant;
  className?: string;
};

export type StatCardProps = StatCardBaseProps &
  (
    | {
        type?: "color";
        variant?: StatCardColorVariant;
        imageSrc?: never;
        tilt?: never;
      }
    | {
        type: "image";
        imageSrc: string;
        tilt?: StatCardImageTilt;
        variant?: StatCardColorVariant;
      }
  );

function ArrowRight({ size = 43 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 43 43"
      fill="none"
      className="block shrink-0"
      aria-hidden
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

export function StatCard(props: StatCardProps) {
  const {
    value,
    label,
    href,
    contentVariant = "metric",
    className,
    type = "color",
    ...rest
  } = props;

  const isText = contentVariant === "text";
  const isImage = type === "image";
  const imageSrc = isImage ? rest.imageSrc : undefined;
  const tilt = isImage ? rest.tilt ?? "tiltLeft" : undefined;
  const variant = rest.variant ?? "green";

  const color = colorVariants[variant];
  const reduceMotion = useReducedMotion();
  const { containerRef: valueContainerRef, textRef: valueRef, fontSizePx } =
    useFitText(isText ? "" : value, { minSizePx: 56 });

  const showImageByDefault = isText && isImage;

  const hoverRotate = isImage
    ? imageTiltDegrees[tilt!]
    : color.tilt;

  const textClass = "text-[var(--section-text)]";
  const arrowHoverClass = isImage ? "" : color.colorHoverText;
  const hoverTextClass = isImage
    ? showImageByDefault
      ? "text-white"
      : "group-hover:text-white"
    : color.colorHoverText;
  // Image text cards — white circle + kale arrow; fixed tokens, not section theme
  const imageTextArrowColorClass =
    "text-kale transition-colors duration-[600ms]";
  const arrowColorClass = isImage
    ? showImageByDefault
      ? imageTextArrowColorClass
      : cn(textClass, "group-hover:text-kale transition-colors duration-[600ms]")
    : cn(textClass, arrowHoverClass);

  const activeActionButtonStyle = showImageByDefault
    ? {
        bottom: TEXT_ACTION_BOTTOM,
        right: TEXT_ACTION_RIGHT,
        width: TEXT_ACTION_SIZE,
        height: TEXT_ACTION_SIZE,
      }
    : actionButtonStyle;

  const activeImageFillVariants: Variants = showImageByDefault
    ? { rest: { opacity: 1 }, hover: { opacity: 1 } }
    : imageFillVariants;

  const activeImageScrimVariants: Variants = showImageByDefault
    ? { rest: { opacity: 1 }, hover: { opacity: 1 } }
    : imageScrimVariants;

  const activeImageButtonVariants: Variants = showImageByDefault
    ? textArrowButtonVariants
    : imageButtonVariants;

  const activeImageAccentVariants: Variants = showImageByDefault
    ? {
        rest: { scale: 0, opacity: 0 },
        hover: { scale: 0, opacity: 0 },
      }
    : imageAccentVariants;

  const contentGap = isImage
    ? isText
      ? "gap-4"
      : "gap-2"
    : isText
      ? "gap-4"
      : "gap-[178px]";

  const card = (
    <motion.div
      className={cn("group w-full", href ? "cursor-pointer" : undefined, className)}
      whileHover={
        reduceMotion
          ? undefined
          : { rotate: hoverRotate, transition: statCardTiltSpring }
      }
    >
      <motion.div
        className={cn(
          "@container relative h-[432px] w-full overflow-hidden rounded-[var(--radius-xl)] bg-[var(--section-surface)] p-[42px]",
          "flex min-w-0 flex-col",
          contentGap,
          isText && !isImage && "justify-between",
          showImageByDefault && "justify-end",
        )}
        initial="rest"
        whileHover={reduceMotion ? undefined : "hover"}
      >
        {!isImage && (
          <motion.div
            className={cn(
              "pointer-events-none absolute rounded-full",
              color.accent,
            )}
            variants={colorFillVariants}
            style={{
              ...actionButtonStyle,
              transformOrigin: "center",
            }}
          />
        )}

        {isImage && (
          <motion.div
            className={cn(
              "pointer-events-none absolute rounded-full bg-bright-kelly",
            )}
            variants={activeImageAccentVariants}
            style={{
              ...actionButtonStyle,
              transformOrigin: "center",
            }}
          />
        )}

        {isImage && imageSrc && showImageByDefault ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[var(--radius-lg)]"
            variants={activeImageFillVariants}
          >
            <img src={imageSrc} alt="" className="size-full object-cover" />
          </motion.div>
        ) : isImage && imageSrc ? (
          <motion.div
            className="pointer-events-none absolute z-0 overflow-hidden rounded-full"
            variants={activeImageFillVariants}
            style={{
              width: IMAGE_CIRCLE_SIZE,
              height: IMAGE_CIRCLE_SIZE,
              left: IMAGE_CIRCLE_LEFT,
              top: IMAGE_CIRCLE_TOP,
            }}
          >
            <img src={imageSrc} alt="" className="size-full object-cover" />
          </motion.div>
        ) : null}

        {isImage && (
          <motion.div
            className={cn(
              "pointer-events-none absolute left-1/2 z-[1] flex h-[340px] w-[924px] max-w-[calc(100%+80px)] -translate-x-1/2 items-center justify-center mix-blend-multiply",
              showImageByDefault ? "bottom-0" : "top-[-12px]",
            )}
            variants={activeImageScrimVariants}
          >
            <div
              className={cn("h-full w-full", !showImageByDefault && "-scale-y-100")}
              style={{
                backgroundImage: showImageByDefault
                  ? IMAGE_SCRIM_GRADIENT_SUBTLE
                  : IMAGE_SCRIM_GRADIENT,
              }}
            />
          </motion.div>
        )}

        {showImageByDefault ? (
          <div className="relative z-10 flex w-full min-w-0 flex-col gap-4">
            <p
              className={cn(
                "w-full min-w-0 text-pretty transition-colors duration-[600ms]",
                statCardTextHeaderClassName,
                textClass,
                hoverTextClass,
              )}
            >
              {value}
            </p>
            <p
              className={cn(
                "w-full min-w-0 pr-[92px] text-pretty transition-colors duration-[600ms]",
                bodyLgClassName,
                textClass,
                hoverTextClass,
              )}
            >
              {label}
            </p>
          </div>
        ) : isText ? (
          <>
            <p
              className={cn(
                "relative z-10 w-full min-w-0 text-pretty transition-colors duration-[600ms]",
                statCardTextHeaderClassName,
                textClass,
                hoverTextClass,
              )}
            >
              {value}
            </p>
            <p
              className={cn(
                "relative z-10 mt-auto w-full min-w-0 pr-[120px] text-pretty transition-colors duration-[600ms]",
                bodyLgClassName,
                textClass,
                hoverTextClass,
              )}
            >
              {label}
            </p>
          </>
        ) : (
          <>
            <div
              ref={valueContainerRef}
              className="relative z-10 min-w-0 max-w-full"
            >
              <p
                ref={valueRef}
                style={fontSizePx != null ? { fontSize: `${fontSizePx}px` } : undefined}
                className={cn(
                  "inline-block w-fit max-w-full whitespace-nowrap font-display text-[clamp(3.5rem,28.8cqw,8rem)] font-bold leading-[1.06] tracking-[-0.04em] transition-colors duration-[600ms]",
                  textClass,
                  hoverTextClass,
                )}
              >
                {value}
              </p>
            </div>
            <p
              className={cn(
                "relative z-10 min-w-full pr-[120px] text-[clamp(1.25rem,7cqw,2rem)] font-medium leading-[1.2] tracking-[-0.04em] transition-colors duration-[600ms]",
                textClass,
                hoverTextClass,
              )}
            >
              {label}
            </p>
          </>
        )}

        <div className={actionButtonClass} style={activeActionButtonStyle}>
          {isImage && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full bg-white transition-colors duration-[600ms]",
                showImageByDefault && color.arrowButtonHover,
              )}
              variants={activeImageButtonVariants}
              style={{ transformOrigin: "center" }}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center",
              arrowColorClass,
            )}
          >
            <ArrowRight size={showImageByDefault ? TEXT_ARROW_SIZE : 43} />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block w-full no-underline">
        {card}
      </a>
    );
  }

  return card;
}

export default StatCard;
