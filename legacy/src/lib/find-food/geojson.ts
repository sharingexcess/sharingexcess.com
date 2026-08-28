import { profilePath } from "./urls";
import type { PublicFindFoodProfile } from "./types";

export interface FindFoodGeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    city: string;
    state: string;
    googlePlaceId: string;
    profileUrl: string;
    lastSharingExcessDistribution: number | null;
  };
}

export interface FindFoodGeoJsonCollection {
  type: "FeatureCollection";
  features: FindFoodGeoJsonFeature[];
}

export function profilesToGeoJson(
  profiles: PublicFindFoodProfile[],
): FindFoodGeoJsonCollection {
  return {
    type: "FeatureCollection",
    features: profiles.map((profile) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [profile.lng, profile.lat],
      },
      properties: {
        name: profile.name,
        city: profile.city,
        state: profile.state,
        googlePlaceId: profile.googlePlaceId,
        profileUrl: profilePath(profile),
        lastSharingExcessDistribution: profile.lastSharingExcessDistribution ?? null,
      },
    })),
  };
}
