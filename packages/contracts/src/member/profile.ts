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
 *  - the backend `MemberDto` (DynamoDB serialization) and `GET /user/profile` response
 *  - the frontend `MemberDTO` (network) and `MemberRepositoryAppDouble` mock
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
};
