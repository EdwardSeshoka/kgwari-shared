import type { CanonicalText } from "../text/index.js";

/**
 * Where it is. Proper nouns throughout — a venue's name and its room are the
 * same words in every locale.
 *
 * `room` is carried separately because it is the fact that tells a member which
 * door to walk through, and folding it into the venue name ("The Pot Luck Club,
 * Cellar Room") produces a string no client can render as an address.
 */
export type EventVenueContract = {
  name: CanonicalText;
  /** The specific room, when the venue has more than one. */
  room?: CanonicalText;
  city?: CanonicalText;
  /** ISO 3166-1 alpha-2. */
  countryCode?: string;
};
