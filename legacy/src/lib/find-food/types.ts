export interface PublicFindFoodProfile {
  name: string;
  /** Street address line 1. Optional at runtime until the Surplus API ships it. */
  address1?: string | null;
  address2?: string | null;
  city: string;
  state: string;
  zip?: string | null;
  lat: number;
  lng: number;
  googlePlaceId: string;
  lastSharingExcessDistribution?: number | null;
}

export interface ListPublicFindFoodProfilesResponse {
  profiles: PublicFindFoodProfile[];
}

export interface PublicFindFoodPlaceOpeningHoursPeriod {
  openDay?: number;
  openHour?: number;
  openMinute?: number;
  closeDay?: number;
  closeHour?: number;
  closeMinute?: number;
}

export interface PublicFindFoodPlaceOpeningHours {
  weekdayDescriptions?: string[];
  periods?: PublicFindFoodPlaceOpeningHoursPeriod[];
}

export interface PublicFindFoodPlacePhotoAttribution {
  displayName?: string | null;
  uri?: string | null;
  photoUri?: string | null;
}

export interface PublicFindFoodPlacePhoto {
  uri: string;
  widthPx?: number | null;
  heightPx?: number | null;
  attributions?: PublicFindFoodPlacePhotoAttribution[];
}

export interface PublicFindFoodPlaceDetails {
  placeId: string;
  displayName: string | null;
  formattedAddress: string | null;
  nationalPhoneNumber: string | null;
  internationalPhoneNumber: string | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  primaryTypeDisplayName: string | null;
  businessStatus: string | null;
  utcOffsetMinutes: number | null;
  regularOpeningHours: PublicFindFoodPlaceOpeningHours | null;
  currentOpeningHours: PublicFindFoodPlaceOpeningHours | null;
  photos: PublicFindFoodPlacePhoto[];
}
