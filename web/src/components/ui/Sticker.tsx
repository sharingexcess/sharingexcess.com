import { cn } from "@/lib/cn";

export type StickerName = "waste-less" | "sunrise" | "free-food" | "lemon";

const SVG_MAP: Record<StickerName, string> = {
  "waste-less": "/svg/Sticker-Waste-Less.svg",
  sunrise: "/svg/Sticker-Sunrise.svg",
  "free-food": "/svg/Sticker-Free-Food.svg",
  lemon: "/svg/Sticker-Lemon.svg",
};

const SPIN_STATIC_MAP: Partial<Record<StickerName, string>> = {
  "free-food": "/svg/Sticker-Free-Food-static.svg",
  "waste-less": "/svg/Sticker-Waste-Less-static.svg",
};

const SPIN_RING_MAP: Partial<Record<StickerName, string>> = {
  "free-food": "/svg/Sticker-Free-Food-spin.svg",
  "waste-less": "/svg/Sticker-Waste-Less-spin.svg",
};

/** Circular text stickers — ring spins while the center heart stays static. */
const SPINNING_STICKERS = new Set<StickerName>(["free-food", "waste-less"]);

const STICKER_DROP_SHADOW =
  "drop-shadow-[0px_2px_6px_rgba(0,0,0,0.12)] drop-shadow-[0px_2.56px_3.2px_rgba(0,0,0,0.25)]";

/** Figma — 150px on 1320px content width */
export const STICKER_SIZE_CLASS = "size-[clamp(100px,11.36vw,150px)]";

/** Smaller sticker for stat card gutters */
export const STICKER_SIZE_SM_CLASS = "size-[clamp(64px,8.5vw,112px)]";

/** Overlap container top edge — hero image, section intro, etc. */
export const STICKER_OVERLAP_TOP_CLASS =
  "pointer-events-none absolute top-0 right-[clamp(40px,14.85%,196px)] z-10 -translate-y-1/2";

/** Overlap the top-left corner of a stat card */
export const STICKER_OVERLAP_CARD_TOP_LEFT_CLASS =
  "pointer-events-none absolute top-3 left-4 z-20 -translate-x-1/2 -translate-y-1/2";

/** Overlap the top-right corner of a card — position on a wrapper sibling, not inside the card */
export const STICKER_OVERLAP_CARD_TOP_RIGHT_CLASS =
  "absolute top-4 right-2 z-20 translate-x-1/2 -translate-y-[40%]";

/** Centered over a media frame */
export const STICKER_OVERLAP_CENTER_CLASS =
  "pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2";

/** Centered on the top edge of a media frame */
export const STICKER_OVERLAP_TOP_CENTER_CLASS =
  "pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 -translate-y-1/2";

/** Centered in the gutter between the 2nd and 3rd cards of a 3-up stat grid */
export const STICKER_BETWEEN_STAT_CARDS_CLASS =
  "pointer-events-none absolute z-20 left-1/2 top-[calc(864px+4.5rem)] -translate-x-1/2 -translate-y-1/2 sm:left-[calc(66.666667%+0.25rem)] sm:top-0";

/** Hearts rendered above the spin layer — needed when the ring is a solid disc. */
const SPIN_HEART_OVERLAY: Partial<
  Record<StickerName, { d: string; fill: string; viewBox: string }>
> = {
  "free-food": {
    viewBox: "0 0 250 251",
    d: "M149.43 116.068C149.43 108.703 143.624 102.908 136.471 102.908C130.694 102.908 125.807 106.888 124.133 112.265C122.458 106.889 117.571 103.047 111.794 103.047C104.639 103.047 98.8391 108.677 98.8391 116.044C98.8391 119.762 100.32 122.388 102.704 125.199L124.145 147.303L145.561 125.199C147.947 122.388 149.43 119.783 149.43 116.068Z",
    fill: "#00843D",
  },
};

interface StickerProps {
  name: StickerName;
  size?: number;
  className?: string;
  alt?: string;
  /** When true on circular stickers, the ring text rotates and the heart stays static. */
  spin?: boolean;
  /** Size to the parent box instead of the `size` pixel dimensions. */
  fillContainer?: boolean;
}

function StickerHeartOverlay({ name }: { name: StickerName }) {
  const heart = SPIN_HEART_OVERLAY[name];
  if (!heart) return null;

  return (
    <svg
      aria-hidden
      viewBox={heart.viewBox}
      className="pointer-events-none absolute inset-0 size-full"
    >
      <path d={heart.d} fill={heart.fill} />
    </svg>
  );
}

function SpinningSticker({
  name,
  size,
  className,
  alt,
  fillContainer,
}: {
  name: StickerName;
  size: number;
  className?: string;
  alt?: string;
  fillContainer?: boolean;
}) {
  const staticSrc = SPIN_STATIC_MAP[name];
  const spinSrc = SPIN_RING_MAP[name];
  if (!staticSrc || !spinSrc) return null;

  return (
    <div
      className={cn(
        "relative shrink-0",
        fillContainer ? "size-full" : undefined,
        STICKER_DROP_SHADOW,
        className,
      )}
      style={fillContainer ? undefined : { width: size, height: size }}
    >
      <img
        src={staticSrc}
        alt={alt ?? name}
        className="absolute inset-0 block size-full"
      />
      <img
        src={spinSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 block size-full animate-sticker-spin"
      />
      <StickerHeartOverlay name={name} />
    </div>
  );
}

export function Sticker({
  name,
  size = 200,
  className,
  alt,
  spin = true,
  fillContainer = false,
}: StickerProps) {
  const spinning = spin && SPINNING_STICKERS.has(name);
  const dimensionProps = fillContainer
    ? { className: cn("size-full", className) }
    : {
        width: size,
        height: size,
        className: cn("block", className),
      };

  if (spinning) {
    return (
      <SpinningSticker
        name={name}
        size={size}
        className={className}
        alt={alt}
        fillContainer={fillContainer}
      />
    );
  }

  return (
    <img
      src={SVG_MAP[name]}
      alt={alt ?? name}
      {...dimensionProps}
      className={cn(dimensionProps.className, STICKER_DROP_SHADOW)}
    />
  );
}
