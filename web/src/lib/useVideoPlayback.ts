import { useEffect, useRef } from "react";

/** Programmatic play/pause for hero background videos (avoids autoplay before reveal). */
export function useVideoPlayback(shouldPlay: boolean) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (shouldPlay) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return ref;
}
