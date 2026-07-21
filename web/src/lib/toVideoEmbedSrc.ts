/** Normalize YouTube watch/shorts URLs to an embeddable iframe src. */
export function toVideoEmbedSrc(src: string): string | null {
  if (src.includes("youtube.com/embed/")) return src;

  const shortsMatch = src.match(/youtube\.com\/shorts\/([^?&/]+)/);
  if (shortsMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  try {
    const url = new URL(src, "https://sharingexcess.com");
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function isEmbeddableVideo(src: string): boolean {
  return toVideoEmbedSrc(src) !== null;
}

/** Build an embed URL with optional autoplay (muted — required by browsers). */
export function buildVideoEmbedUrl(
  src: string,
  {
    autoplay = false,
    hideChrome = false,
    origin,
  }: { autoplay?: boolean; hideChrome?: boolean; origin?: string } = {},
): string | null {
  const embed = toVideoEmbedSrc(src);
  if (!embed) return null;

  const params = new URLSearchParams({ rel: "0" });
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  if (hideChrome) {
    params.set("controls", "0");
    params.set("modestbranding", "1");
    // 3 suppresses captions more reliably than 0 on Shorts embeds.
    params.set("cc_load_policy", "3");
    params.set("iv_load_policy", "3");
    params.set("fs", "0");
    params.set("disablekb", "1");
    params.set("playsinline", "1");
    params.set("enablejsapi", "1");
    if (origin) params.set("origin", origin);
  }

  return `${embed}?${params.toString()}`;
}
