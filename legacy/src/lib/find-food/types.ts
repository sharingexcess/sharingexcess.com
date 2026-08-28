export interface PublicFindFoodProfile {
  name: string;
  city: string;
  state: string;
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

export interface PublicFindFoodPlaceAccessibilityOptions {
  wheelchairAccessibleParking?: boolean | null;
  wheelchairAccessibleEntrance?: boolean | null;
  wheelchairAccessibleRestroom?: boolean | null;
  wheelchairAccessibleSeating?: boolean | null;
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
  accessibilityOptions: PublicFindFoodPlaceAccessibilityOptions | null;
  regularOpeningHours: PublicFindFoodPlaceOpeningHours | null;
  currentOpeningHours: PublicFindFoodPlaceOpeningHours | null;
  photos: PublicFindFoodPlacePhoto[];
}
