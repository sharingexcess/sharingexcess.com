import { cn } from "@/lib/cn";
import {
  figmaQuickSpring,
  motion,
  motionEase,
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
    colorHoverText: "group-hover:text-kale",
    tilt: TILT_LEFT,
  },
  yellow: {
    accent: "bg-banana",
    colorHoverText: "group-hover:text-dark-cherry",
    tilt: TILT_RIGHT,
  },
  orange: {
    accent: "bg-tangerine",
    colorHoverText: "group-hover:text-dark-cherry",
    tilt: TILT_LEFT,
  },
} as const;

/** Figma — accent circle and arrow share this 88px box */
const ACTION_BOTTOM = 15;
const ACTION_RIGHT = 23;
const ACTION_SIZE = 88;

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

export type StatCardColorVariant = keyof typeof colorVariants;
/** @deprecated Use StatCardColorVariant */
export type StatCardVariant = StatCardColorVariant;

export type StatCardImageTilt = "tiltLeft" | "tiltRight";

const imageTiltDegrees: Record<StatCardImageTilt, number> = {
  tiltLeft: TILT_LEFT,
  tiltRight: TILT_RIGHT,
};

type StatCardBaseProps = {
  value: string;
  label: string;
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
        variant?: never;
      }
  );

function ArrowRight() {
  return (
    <svg
      width="43"
      height="43"
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
    className,
    type = "color",
    ...rest
  } = props;

  const isImage = type === "image";
  const imageSrc = isImage ? rest.imageSrc : undefined;
  const tilt = isImage ? rest.tilt ?? "tiltLeft" : undefined;
  const variant = !isImage ? rest.variant ?? "green" : "green";

  const color = colorVariants[variant];
  const reduceMotion = useReducedMotion();

  const hoverRotate = isImage
    ? imageTiltDegrees[tilt!]
    : color.tilt;

  const textClass = "text-[var(--section-text)]";
  const hoverTextClass = isImage
    ? "group-hover:text-white"
    : color.colorHoverText;
  const arrowHoverClass = isImage ? "" : color.colorHoverText;

  return (
    <motion.div
      className={cn("group w-full @container cursor-pointer", className)}
      whileHover={
        reduceMotion
          ? undefined
          : { rotate: hoverRotate, transition: statCardTiltSpring }
      }
    >
      <motion.div
        className={cn(
          "relative h-[432px] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--section-surface)] p-[42px]",
          "flex flex-col",
          isImage ? "gap-2" : "gap-[178px]",
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
            variants={imageAccentVariants}
            style={{
              ...actionButtonStyle,
              transformOrigin: "center",
            }}
          />
        )}

        {isImage && imageSrc && (
          <motion.div
            className="pointer-events-none absolute z-0 overflow-hidden rounded-full"
            variants={imageFillVariants}
            style={{
              width: IMAGE_CIRCLE_SIZE,
              height: IMAGE_CIRCLE_SIZE,
              left: IMAGE_CIRCLE_LEFT,
              top: IMAGE_CIRCLE_TOP,
            }}
          >
            <img src={imageSrc} alt="" className="size-full object-cover" />
          </motion.div>
        )}

        {/* Figma 980:1057 — top scrim for metric legibility (darkened for readability) */}
        {isImage && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[-12px] z-[1] flex h-[340px] w-[924px] max-w-[calc(100%+80px)] -translate-x-1/2 items-center justify-center mix-blend-multiply"
            variants={imageScrimVariants}
          >
            <div
              className="h-full w-full -scale-y-100"
              style={{
                backgroundImage:
                  "linear-gradient(0.59deg, rgba(27,27,21,0.62) 52%, rgba(27,27,21,0.48) 72%, rgba(23,23,23,0) 96%)",
              }}
            />
          </motion.div>
        )}

        <p
          className={cn(
            "relative z-10 font-display text-[clamp(3.5rem,28.8cqw,8rem)] font-bold leading-[1.06] tracking-[-0.04em] transition-colors duration-[600ms] shrink-0",
            textClass,
            hoverTextClass,
          )}
        >
          {value}
        </p>

        <p
          className={cn(
            "relative z-10 min-w-full pr-[120px] text-[clamp(1.25rem,7cqw,2rem)] font-medium leading-[1.2] tracking-[-0.04em] transition-colors duration-[600ms]",
            textClass,
            hoverTextClass,
          )}
        >
          {label}
        </p>

        <div className={actionButtonClass} style={actionButtonStyle}>
          {isImage && (
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              variants={imageButtonVariants}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex items-center justify-center transition-colors duration-[600ms]",
              textClass,
              arrowHoverClass,
            )}
          >
            <ArrowRight />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StatCard;
