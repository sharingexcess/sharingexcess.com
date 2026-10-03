import type { PublicFindFoodProfile } from "./types";

function clean(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Street line(s) from Surplus data, e.g. "123 Main St, Suite 4". Empty when address1 is missing. */
export function streetAddress(profile: PublicFindFoodProfile): string {
  const line1 = clean(profile.address1);
  if (!line1) return "";
  const line2 = clean(profile.address2);
  return line2 ? `${line1}, ${line2}` : line1;
}

/** Full one-line address ("123 Main St, Philadelphia, PA 19104"), or "" when address1 is missing. */
export function formatProfileAddress(profile: PublicFindFoodProfile): string {
  const street = streetAddress(profile);
  if (!street) return "";
  const city = clean(profile.city);
  const region = [clean(profile.state), clean(profile.zip)].filter(Boolean).join(" ");
  return [street, city, region].filter(Boolean).join(", ");
}
