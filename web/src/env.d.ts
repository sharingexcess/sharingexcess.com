/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Long-lived Page access token for the Instagram Graph API (server/build only). */
  readonly INSTAGRAM_ACCESS_TOKEN?: string;
  /** Instagram Business/Creator account user ID from the Graph API. */
  readonly INSTAGRAM_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
