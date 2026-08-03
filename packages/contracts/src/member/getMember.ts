import type { MemberContract } from "./profile.js";

/**
 * Another member's profile — the Profile page's own endpoint.
 *
 * `GET /members/me` has always existed and is not this. That one answers "who am
 * I", carries the member's own contact details, and is the body a patch replies
 * with. This answers "who is this", for a reader who tapped a byline.
 *
 * ## The same contract, and the server does the narrowing
 *
 * {@link MemberContract} rather than a slimmer public shape, because inventing a
 * second member type is how two descriptions of one person start to disagree —
 * and the frontend has already paid for that once with a hand-written `MemberDTO`.
 * The server nulls what is nobody else's business: `contactValue`, the address
 * and its place id, the coordinates. Those are already nullable, so a public
 * profile is a legal value of this type rather than a different one.
 *
 * What a reader DOES get is the part the Profile page is made of — the name, the
 * mark or the status word, the taste note, the region, "member since", the
 * avatar and the per-kind counters.
 */
export type GetMemberResponse = {
  item: MemberContract | null;
};
