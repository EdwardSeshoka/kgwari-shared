import type { MediaRefContract } from "../media/index.js";
import type { BusinessPersona, MemberStatus, TrustTier } from "../trust/index.js";
import { personaTier } from "../trust/index.js";

/**
 * The kind of account: for a regular member their earned standing, otherwise the
 * business persona chosen at onboarding.
 *   · {@link MemberStatus} — "enthusiast" → "collector": regular members, no mark
 *     (a burgundy status word). "collector" is an activity-earned upgrade,
 *     assigned by the system — not an onboarding choice.
 *   · {@link BusinessPersona} — estate · winemaker · importer · distributor ·
 *     sommelier · venue · wine_club: verified business accounts. Each earns a
 *     {@link TrustTier} mark via {@link tierForProfile}; several personas share
 *     one mark (see personaTier).
 */
export type MemberProfileType = MemberStatus | BusinessPersona;

/** The trust mark a profile earns — null for a regular member (enthusiast/collector). */
export function tierForProfile(profile: MemberProfileType): TrustTier | null {
  return (personaTier as Record<string, TrustTier | undefined>)[profile] ?? null;
}

export type MemberContactMethod = "mobile" | "email";

/**
 * Canonical wire shape of a member profile as exchanged over HTTP.
 * Dates are ISO-8601 strings; absent optional values are `null`.
 *
 * This is the single source of truth shared by:
 *  - the backend `MemberDto` (DynamoDB serialization) and its profile response
 *  - the frontend's member service, mappers and `MemberRepositoryAppDouble`
 *
 * The frontend's `MemberDTO` alias is gone. It named nothing this type had not
 * already named, and an alias in that position is where a hand-written copy
 * eventually grows — so consumers import this type directly, and take their
 * doubles from `@edwardseshoka/contracts/member/test-doubles`.
 */
export type MemberContract = {
  userId: string;
  name: string;
  profileType: MemberProfileType;
  contactMethod: MemberContactMethod;
  contactValue: string;
  tasteNote: string | null;
  professionalRole: string | null;
  organization: string | null;
  organizationPlaceId: string | null;
  businessName: string | null;
  businessPlaceId: string | null;
  address: string | null;
  addressPlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  region: string | null;
  country: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  /**
   * How many tasting notes this member has written.
   *
   * A denormalised counter, maintained on the record rather than aggregated on
   * read — the same shape as `Producer.wineCount` and `Region.wineCount`, and
   * for the same reason: search projects a member into a row and cannot run an
   * aggregate over the social table while doing it.
   *
   * **Not optional, and 0 is a true statement.** A member who has written
   * nothing has written nothing — unlike a price, where 0 and "not listed" are
   * different facts. So a missing value reads as 0 rather than as unknown, and
   * records written before this field existed need no migration.
   */
  noteCount: number;
  /**
   * The member's own picture.
   *
   * The profile renders one and nothing carried it — `ActivityUser` had
   * `initials` and the member contract had nothing at all, so every surface that
   * wanted a face either derived initials again or invented a field.
   *
   * `null` rather than absent when there is no avatar, matching every other
   * nullable on this contract: absent means the server did not send the key,
   * null means the member has no picture, and initials are the fallback in
   * exactly that case.
   */
  avatar?: MediaRefContract | null;
  /**
   * How many editorial STORIES this member has published.
   *
   * Beside `noteCount` and for the identical reason, stated on the contract
   * rather than left to be rediscovered: a profile heading reads "Writing (1,412)"
   * and a filter chip reads "Stories (21)", and neither surface can run an
   * aggregate over the editorial table while projecting a member row.
   *
   * The ratio is why the counts are per kind at all — notes outnumber stories by
   * roughly seventy to one, so one total would be a number about notes wearing a
   * label about writing.
   *
   * OPTIONAL, unlike `noteCount`, and only because it is newer: a member record
   * written before this field existed genuinely does not know, and 0 would state
   * something it has not checked. Treat absent as unknown, not as none.
   */
  storyCount?: number;
  /**
   * Tastings this member has ATTENDED — not hosted.
   *
   * The attendance relation has no other wire shape, which is why the count
   * arrives before the list does. See
   * {@link ../contributions!MemberContributionsResponse} for the list.
   */
  tastingsAttendedCount?: number;
};
