import { cn } from "@/lib/cn";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useRef } from "react";
import { InteractiveMap } from "./InteractiveMap";
import type { InteractiveMapProps } from "./types";

/** Mount Mapbox only when the map frame is near the viewport. */
export function DeferredInteractiveMap({ className, ...props }: InteractiveMapProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const isNear = useInViewOnce(frameRef, {
    once: true,
    margin: "0px 0px 25% 0px",
    amount: 0.1,
  });

  return (
    <div ref={frameRef} className={cn(className)}>
      {isNear ? (
        <InteractiveMap className="size-full" {...props} />
      ) : (
        <div className="size-full bg-[var(--section-surface)]" aria-hidden />
      )}
    </div>
  );
}
