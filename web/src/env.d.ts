/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Long-lived Page access token for the Instagram Graph API (server/build only). */
  readonly INSTAGRAM_ACCESS_TOKEN?: string;
  /** Instagram Business/Creator account user ID from the Graph API. */
  readonly INSTAGRAM_USER_ID?: string;
  /** Public Mapbox token for interactive maps (client-side). */
  readonly PUBLIC_MAPBOX_ACCESS_TOKEN?: string;
}

interface Window {
  __SE_SURPLUS_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
