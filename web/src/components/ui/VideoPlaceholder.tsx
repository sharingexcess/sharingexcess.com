import { cn } from "@/lib/cn";
import { buildVideoEmbedUrl, isEmbeddableVideo } from "@/lib/toVideoEmbedSrc";
import { useState } from "react";

const coverClass = "absolute inset-0 size-full object-cover";

function PlayIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="ml-1 size-8"
    >
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

export interface VideoPlaceholderProps {
  posterSrc: string;
  posterAlt?: string;
  /** YouTube URL or direct mp4 path */
  videoSrc?: string;
  /** Autoplay muted video when `videoSrc` is set (matches home hero). */
  autoplay?: boolean;
  className?: string;
}

export function VideoPlaceholder({
  posterSrc,
  posterAlt = "",
  videoSrc,
  autoplay = false,
  className,
}: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedSrc = videoSrc ? buildVideoEmbedUrl(videoSrc, { autoplay: true }) : null;
  const isMp4 = Boolean(videoSrc && !isEmbeddableVideo(videoSrc));
  const canPlay = Boolean(videoSrc);
  const shouldAutoplay = autoplay && canPlay;

  const playButton = (
    <span
      className={cn(
        "flex size-[clamp(56px,10vw,75px)] items-center justify-center rounded-full",
        "bg-[var(--color-se-green)] text-white shadow-md",
        canPlay && "transition-transform duration-200 group-hover:scale-105",
      )}
    >
      <PlayIcon />
    </span>
  );

  if (shouldAutoplay && isMp4 && videoSrc) {
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden", className)}>
        <img src={posterSrc} alt="" aria-hidden className={coverClass} />
        <video autoPlay loop muted playsInline aria-hidden className={coverClass}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
    );
  }

  if (shouldAutoplay && embedSrc) {
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden", className)}>
        <iframe
          src={embedSrc}
          title="Video"
          className="size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={cn("group relative aspect-video w-full overflow-hidden", className)}>
      {isPlaying && embedSrc ? (
        <iframe
          src={embedSrc}
          title="Video"
          className="size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : isPlaying && isMp4 && videoSrc ? (
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          controls
          playsInline
          className="size-full object-cover"
        />
      ) : (
        <>
          <img
            src={posterSrc}
            alt={posterAlt}
            className="size-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[rgba(27,27,21,0.12)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {canPlay ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Play video"
                className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-se-green)]"
              >
                {playButton}
              </button>
            ) : (
              <div aria-hidden>{playButton}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPlaceholder;
