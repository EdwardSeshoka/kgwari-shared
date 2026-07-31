import type { MemberContract } from "./profile.js";

/**
 * Response body of `GET /members/me`. `null` when no profile exists yet.
 *
 * Also served at `GET /user/profile`, which is a deprecated read-only alias kept
 * so already-shipped clients keep working. New callers use `/members/me`.
 */
export type GetMemberProfileResponse = MemberContract | null;

/**
 * Response body of `PATCH /members/me` — the profile as it now stands.
 *
 * The whole member comes back rather than an acknowledgement, so a client never
 * has to guess what its patch produced. Server-owned fields (`noteCount`, a
 * system-assigned `profileType`) can change as a side effect of a write, and a
 * `{ success: true }` would leave the client holding a stale copy it believed
 * was current.
 */
export type PatchMemberProfileResponse = MemberContract;

/**
 * Response body of `POST /user/profile`.
 *
 * @deprecated The route is gone. See {@link PatchMemberProfileResponse}, which
 * returns the updated member rather than a bare success flag.
 */
export type SaveMemberProfileResponse = {
  success: boolean;
};
