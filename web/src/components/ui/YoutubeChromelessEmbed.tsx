import { buildVideoEmbedUrl } from "@/lib/toVideoEmbedSrc";
import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";

const CAPTION_SUPPRESS_MS = 8000;
const CAPTION_SUPPRESS_INTERVAL_MS = 400;

function postYoutubeCommand(
  iframe: HTMLIFrameElement,
  func: string,
  args: unknown[] = [],
) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*",
  );
}

function suppressYoutubeCaptions(iframe: HTMLIFrameElement) {
  postYoutubeCommand(iframe, "unloadModule", ["captions"]);
  postYoutubeCommand(iframe, "setOption", ["captions", "track", {}]);
}

function startYoutubePlayback(iframe: HTMLIFrameElement) {
  postYoutubeCommand(iframe, "playVideo");
}

export interface YoutubeChromelessEmbedProps {
  videoSrc: string;
  title: string;
  autoplay?: boolean;
  /** Allow clicks through to the YouTube player (pause/play, etc.). */
  interactive?: boolean;
  onReady?: () => void;
  className?: string;
}

export function YoutubeChromelessEmbed({
  videoSrc,
  title,
  autoplay = false,
  interactive = false,
  onReady,
  className,
}: YoutubeChromelessEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const embedSrc = buildVideoEmbedUrl(videoSrc, {
    autoplay,
    hideChrome: true,
    origin,
  });

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !embedSrc) return;

    const suppress = () => suppressYoutubeCaptions(iframe);
    const handleLoad = () => {
      suppress();
      if (autoplay) startYoutubePlayback(iframe);
      onReady?.();
    };

    iframe.addEventListener("load", handleLoad);
    suppress();

    const interval = window.setInterval(
      suppress,
      CAPTION_SUPPRESS_INTERVAL_MS,
    );
    const timeout = window.setTimeout(
      () => window.clearInterval(interval),
      CAPTION_SUPPRESS_MS,
    );

    return () => {
      iframe.removeEventListener("load", handleLoad);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [autoplay, embedSrc, onReady]);

  if (!embedSrc) return null;

  return (
    <div className={cn("absolute inset-0 z-[1] overflow-hidden", className)}>
      <iframe
        ref={iframeRef}
        key={embedSrc}
        src={embedSrc}
        title={title}
        className={cn(
          "size-full origin-[center_42%] scale-[1.22] border-0",
          interactive ? "pointer-events-auto" : "pointer-events-none",
        )}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

export default YoutubeChromelessEmbed;
