import { slugify } from "./slugify";
import { stateDisplayName, stateSlug } from "./states";
import type { PublicFindFoodProfile } from "./types";

export interface StateGroup {
  abbr: string;
  name: string;
  slug: string;
  profiles: PublicFindFoodProfile[];
}

export interface CityGroup {
  abbr: string;
  stateName: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  profiles: PublicFindFoodProfile[];
}

export function groupByState(profiles: PublicFindFoodProfile[]): StateGroup[] {
  const byAbbr = new Map<string, PublicFindFoodProfile[]>();

  for (const profile of profiles) {
    const abbr = profile.state.trim().toUpperCase();
    const list = byAbbr.get(abbr) ?? [];
    list.push(profile);
    byAbbr.set(abbr, list);
  }

  return [...byAbbr.entries()]
    .map(([abbr, stateProfiles]) => ({
      abbr,
      name: stateDisplayName(abbr),
      slug: stateSlug(abbr),
      profiles: stateProfiles.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function groupByCity(profiles: PublicFindFoodProfile[]): CityGroup[] {
  const byKey = new Map<string, CityGroup>();

  for (const profile of profiles) {
    const abbr = profile.state.trim().toUpperCase();
    const citySlug = slugify(profile.city);
    const key = `${abbr}:${citySlug}`;

    const existing = byKey.get(key);
    if (existing) {
      existing.profiles.push(profile);
      continue;
    }

    byKey.set(key, {
      abbr,
      stateName: stateDisplayName(abbr),
      stateSlug: stateSlug(abbr),
      city: profile.city,
      citySlug,
      profiles: [profile],
    });
  }

  return [...byKey.values()]
    .map((group) => ({
      ...group,
      profiles: group.profiles.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      const stateCompare = a.stateName.localeCompare(b.stateName);
      if (stateCompare !== 0) return stateCompare;
      return a.city.localeCompare(b.city);
    });
}

export function filterProfilesByStateSlug(
  profiles: PublicFindFoodProfile[],
  stateParam: string,
): PublicFindFoodProfile[] {
  return profiles.filter((p) => stateSlug(p.state) === stateParam);
}

export function filterProfilesByStateAndCitySlug(
  profiles: PublicFindFoodProfile[],
  stateParam: string,
  cityParam: string,
): PublicFindFoodProfile[] {
  return profiles.filter(
    (p) => stateSlug(p.state) === stateParam && slugify(p.city) === cityParam,
  );
}

export function findProfileByPlaceId(
  profiles: PublicFindFoodProfile[],
  stateParam: string,
  cityParam: string,
  placeIdParam: string,
): PublicFindFoodProfile | undefined {
  const placeId = decodeURIComponent(placeIdParam);
  return profiles.find(
    (p) =>
      p.googlePlaceId === placeId &&
      stateSlug(p.state) === stateParam &&
      slugify(p.city) === cityParam,
  );
}
