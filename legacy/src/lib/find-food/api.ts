import type { ListPublicFindFoodProfilesResponse, PublicFindFoodProfile } from "./types";
import { getBuildTimeApiBaseUrl } from "../surplus-api-origin";

let cachedProfiles: PublicFindFoodProfile[] | null = null;

export async function fetchProfiles(): Promise<PublicFindFoodProfile[]> {
  if (cachedProfiles) return cachedProfiles;

  const base = getBuildTimeApiBaseUrl();
  const res = await fetch(`${base}/public/free_food/profiles`);
  if (!res.ok) {
    const hint =
      res.status === 404 && base.includes("localhost")
        ? " The free-food routes may be missing from the local Surplus API — restart the API after pulling latest surplus (freeFood must be registered in orpc.ts)."
        : "";
    throw new Error(`Free food profiles failed (${res.status}) from ${base}.${hint}`);
  }

  const data = (await res.json()) as ListPublicFindFoodProfilesResponse;
  cachedProfiles = data.profiles;
  return cachedProfiles;
}

export async function fetchProfile(placeId: string): Promise<PublicFindFoodProfile> {
  const base = getBuildTimeApiBaseUrl();
  const res = await fetch(
    `${base}/public/free_food/profiles/${encodeURIComponent(placeId)}`,
  );
  if (!res.ok) {
    throw new Error(`Free food profile failed (${res.status}) from ${base}.`);
  }

  return (await res.json()) as PublicFindFoodProfile;
}
