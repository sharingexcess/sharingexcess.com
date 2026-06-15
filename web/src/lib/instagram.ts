import type { SocialMediaItem } from "@/sections/SocialMediaSection";

const GRAPH_API_VERSION = "v22.0";

/** Placeholder items when Instagram env vars are missing or the API is unavailable. */
export const SOCIAL_MEDIA_FALLBACK_ITEMS: SocialMediaItem[] = [
  { src: "/images/peppers.jpg", alt: "", aspect: "story" },
  { src: "/images/tomatoes.jpg", alt: "", aspect: "post" },
  { src: "/images/oranges.jpg", alt: "", aspect: "story" },
  { src: "/images/bananas.png", alt: "", aspect: "story" },
];

interface InstagramChildMedia {
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  children?: { data?: InstagramChildMedia[] };
}

interface InstagramMediaResponse {
  data?: InstagramMedia[];
  error?: { message: string; type: string; code: number };
}

function truncateCaption(caption: string | undefined, maxLength = 120): string {
  if (!caption) return "";
  const trimmed = caption.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

function mediaAspect(mediaType: string): SocialMediaItem["aspect"] {
  return mediaType === "VIDEO" || mediaType === "REELS" ? "story" : "post";
}

function mediaImageSrc(media: InstagramChildMedia | InstagramMedia): string | undefined {
  if (media.media_type === "VIDEO" || media.media_type === "REELS") {
    return media.thumbnail_url ?? media.media_url;
  }
  return media.media_url ?? media.thumbnail_url;
}

function mapMediaToItem(media: InstagramMedia): SocialMediaItem | null {
  const permalink = media.permalink;
  if (!permalink) return null;

  let src: string | undefined;
  let aspect = mediaAspect(media.media_type);

  if (media.media_type === "CAROUSEL_ALBUM") {
    const firstChild = media.children?.data?.[0];
    if (firstChild) {
      src = mediaImageSrc(firstChild);
      aspect = mediaAspect(firstChild.media_type ?? "IMAGE");
    }
  } else {
    src = mediaImageSrc(media);
  }

  if (!src) return null;

  const alt = truncateCaption(media.caption);

  return {
    id: media.id,
    src,
    alt,
    aspect,
    href: permalink,
  };
}

/**
 * Fetches recent Instagram posts at build time via the Instagram Graph API.
 * Returns null when credentials are missing or the request fails.
 */
export async function getInstagramFeed(limit = 4): Promise<SocialMediaItem[] | null> {
  const token = import.meta.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = import.meta.env.INSTAGRAM_USER_ID;

  if (!token || !userId) return null;

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "permalink",
    "timestamp",
    "thumbnail_url",
    "children{media_type,media_url,thumbnail_url}",
  ].join(",");

  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[instagram] Graph API request failed (${response.status})`);
      return null;
    }

    const payload = (await response.json()) as InstagramMediaResponse;

    if (payload.error) {
      console.warn(`[instagram] ${payload.error.message}`);
      return null;
    }

    const items = (payload.data ?? [])
      .map(mapMediaToItem)
      .filter((item): item is SocialMediaItem => item !== null);

    return items.length > 0 ? items : null;
  } catch (error) {
    console.warn("[instagram] Failed to fetch feed:", error);
    return null;
  }
}
