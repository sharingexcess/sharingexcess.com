type StickerName = "waste-less" | "sunrise" | "free-food" | "lemon";

const SVG_MAP: Record<StickerName, string> = {
  "waste-less": "/svg/Sticker-Waste-Less.svg",
  "sunrise": "/svg/Sticker-Sunrise.svg",
  "free-food": "/svg/Sticker-Free-Food.svg",
  "lemon": "/svg/Sticker-Lemon.svg",
};

interface StickerProps {
  name: StickerName;
  size?: number;
  className?: string;
  alt?: string;
}

export function Sticker({ name, size = 200, className, alt }: StickerProps) {
  return (
    <img
      src={SVG_MAP[name]}
      alt={alt ?? name}
      width={size}
      height={size}
      className={className}
      style={{ display: "block", filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.12))" }}
    />
  );
}
