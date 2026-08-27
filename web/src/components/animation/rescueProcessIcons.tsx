import { cn } from "@/lib/cn";

/** Shared baseline — all scene icons align feet / wheels to this edge. */
export const ICON_BASELINE_CLASS = "block leading-none";

/** Monochrome SVG assets — invert to white on the dark green scene. */
const SCENE_ICON_WHITE_CLASS = "brightness-0 invert";

function SceneSvgIcon({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className={cn(ICON_BASELINE_CLASS, SCENE_ICON_WHITE_CLASS, className)}
    />
  );
}

const SE_TRUCK_ICON_SRC = "/svg/icon-SEtruck.svg";

export function VanIcon({ className }: { className?: string }) {
  return (
    <img
      src={SE_TRUCK_ICON_SRC}
      alt=""
      aria-hidden
      draggable={false}
      className={cn(ICON_BASELINE_CLASS, "h-10 w-auto", className)}
    />
  );
}

export function WarehouseIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-warehouse.svg" className={className} />;
}

export function GroupIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-group.svg" className={className} />;
}

export function WorshipIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-worship.svg" className={className} />;
}

export function FridgeIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-fridge.svg" className={className} />;
}

export function AppleIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-apple.svg" className={className} />;
}

export function LeafyGreenIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-leafy-green.svg" className={className} />;
}

export function CarrotIcon({ className }: { className?: string }) {
  return <SceneSvgIcon src="/svg/icon-carrot.svg" className={className} />;
}
