import type { MemberContract } from "./profile.js";

/**
 * Body accepted by `PATCH /members/me`.
 *
 * **A patch, not a replacement, and the distinction is the reason it exists.**
 * The `POST` this replaced took a whole profile, so it could only ever express
 * "replace everything" — a client that omitted a field silently reset it. A
 * member editing their taste note lost their address. Sending only what changed
 * is what makes a partial edit expressible at all.
 *
 * **Derived from {@link MemberContract} rather than restated**, so a field added
 * to the profile is patchable without anyone remembering to add it here, and a
 * field removed cannot linger.
 *
 * Four fields are omitted because they are not the member's to set:
 *  · `userId` comes from the authenticated JWT — a body that could name a
 *    different member is a body that can edit one.
 *  · `createdAt` is server-assigned on first write.
 *  · `noteCount`, `storyCount` and `tastingsAttendedCount` are denormalised
 *    counters maintained by the features that own what they count. A member who
 *    could patch their own note count could patch their own standing.
 *  · `profileType` is earned or chosen at onboarding ("collector" is assigned by
 *    the system for activity), so it is not a profile field a member edits.
 *
 * `avatar` IS patchable and is one of the few fields where `null` is the point:
 * removing a picture is an edit a member makes, and a shape that could only set
 * one would leave them stuck with it.
 *
 * A `null` is meaningful here and is NOT the same as omitting the key: `null`
 * clears the value, omission leaves it alone. That is what a nullable optional
 * buys, and it is why the server distinguishes "absent" from "present and null".
 */
export type PatchMemberProfileRequest = Partial<
  Omit<
    MemberContract,
    | "userId"
    | "createdAt"
    | "noteCount"
    | "storyCount"
    | "tastingsAttendedCount"
    | "profileType"
  >
>;

/**
 * Body accepted by `POST /user/profile`.
 *
 * `userId` is derived from the authenticated JWT on the server, so it is not
 * required here; `createdAt` is server-assigned on first write and therefore
 * optional. Clients may still send the full {@link MemberContract} — the server
 * ignores fields it owns.
 *
 * @deprecated The route is gone, not merely renamed. `POST /user/profile` could
 * only express "replace everything", which silently reset any field the caller
 * omitted. Use {@link PatchMemberProfileRequest} against `PATCH /members/me`.
 * The member RESOURCE moved to `/members/me`; `GET /user/profile` survives as a
 * read-only alias for already-shipped clients, but nothing writes to the old
 * address any more.
 */
export type SaveMemberProfileRequest = Omit<
  MemberContract,
  "userId" | "createdAt"
> & {
  createdAt?: string;
};
