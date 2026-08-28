import { slugify } from "./slugify";
import { stateSlug } from "./states";
import type { PublicFindFoodProfile } from "./types";

export function statePath(abbr: string): string {
  return `/free-food/${stateSlug(abbr)}`;
}

export function cityPath(abbr: string, city: string): string {
  return `${statePath(abbr)}/${slugify(city)}`;
}

export function profilePath(profile: PublicFindFoodProfile): string {
  return `${cityPath(profile.state, profile.city)}/${encodeURIComponent(profile.googlePlaceId)}`;
}
