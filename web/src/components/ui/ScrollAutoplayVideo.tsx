import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useInView, useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, useState, type RefObject } from "react";

const coverClass = "absolute inset-0 size-full object-cover";

/** Play when most of the frame is visible — 100% blocked autoplay when a sticky header clips the top. */
const IN_VIEW_AMOUNT = 0.5;

function isElementFullyInView(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;

  if (rect.width <= 0 || rect.height <= 0) return false;

  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, vw) - Math.max(rect.left, 0);
  if (visibleHeight <= 0 || visibleWidth <= 0) return false;

  const ratio = (visibleHeight * visibleWidth) / (rect.height * rect.width);
  return ratio >= IN_VIEW_AMOUNT;
}

function useInViewForPlayback(ref: RefObject<Element | null>): boolean {
  const motionInView = useInView(ref, { amount: IN_VIEW_AMOUNT });
  const [fallbackInView, setFallbackInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    const check = () => {
      if (cancelled || !ref.current) return;
      setFallbackInView(isElementFullyInView(ref.current));
    };

    check();
    const raf = requestAnimationFrame(() => requestAnimationFrame(check));

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [ref]);

  return motionInView || fallbackInView;
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3L20 12L6 21V3Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function VolumeOffIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 9l5 6M21 9l-5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeOnIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const controlButtonClass = cn(
  "flex size-11 items-center justify-center rounded-full",
  "bg-[rgba(27,27,21,0.72)] text-white backdrop-blur-sm",
  "transition-colors hover:bg-[rgba(27,27,21,0.88)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
);

export interface ScrollAutoplayVideoProps {
  posterSrc: string;
  posterAlt?: string;
  videoSrc: string;
  className?: string;
}

export function ScrollAutoplayVideo({
  posterSrc,
  posterAlt = "",
  videoSrc,
  className,
}: ScrollAutoplayVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInViewForPlayback(containerRef);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    const tryPlay = () => {
      if (isInView && !isPaused && video.paused) {
        void video.play().catch(() => {});
      }
    };

    if (isInView && !isPaused) {
      tryPlay();
      video.addEventListener("canplay", tryPlay);
      video.addEventListener("loadeddata", tryPlay);
      return () => {
        video.removeEventListener("canplay", tryPlay);
        video.removeEventListener("loadeddata", tryPlay);
      };
    }

    video.pause();
  }, [isInView, isPaused, reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const showPoster = !hasStarted;
  const showControls = hasStarted && !reduceMotion;

  const togglePaused = () => {
    if (!hasStarted) {
      setIsPaused(false);
      void videoRef.current?.play().catch(() => {});
      return;
    }
    setIsPaused((paused) => !paused);
  };

  return (
    <div
      ref={containerRef}
      className={cn("group relative aspect-video w-full overflow-hidden", className)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden={!hasStarted}
        className={coverClass}
        onPlaying={() => setHasStarted(true)}
      />

      <img
        src={posterSrc}
        alt={showPoster ? posterAlt : ""}
        aria-hidden={!showPoster}
        className={cn(
          coverClass,
          "transition-opacity duration-500",
          showPoster ? "opacity-100" : "opacity-0",
        )}
      />

      {!reduceMotion && (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0"
          aria-label={isPaused ? "Play video" : "Pause video"}
          onClick={togglePaused}
        />
      )}

      <div
        className={cn(
          "absolute inset-x-0 top-3 z-20 flex justify-center transition-opacity duration-200",
          isMuted
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          simpleLabel
          type="button"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          onClick={() => setIsMuted((muted) => !muted)}
        >
          <span className="relative z-10 inline-flex items-center gap-1.5">
            {isMuted ? <VolumeOnIcon /> : <VolumeOffIcon />}
            {isMuted ? "Unmute" : "Mute"}
          </span>
        </Button>
      </div>

      {showControls && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 flex justify-end gap-2 p-4",
            "pointer-events-none opacity-0 transition-opacity duration-200",
            "group-hover:pointer-events-auto group-hover:opacity-100",
          )}
        >
          <button
            type="button"
            className={controlButtonClass}
            aria-label={isPaused ? "Play video" : "Pause video"}
            onClick={togglePaused}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      )}
    </div>
  );
}

export default ScrollAutoplayVideo;
