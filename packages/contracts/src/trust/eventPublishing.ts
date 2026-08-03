import type { BusinessPersona, MemberStatus } from "./trust.js";

/**
 * Who may PUBLISH an evening, and who may only keep one.
 *
 * ## The rule
 *
 * An enthusiast can create an event and invite people to it; they cannot put it
 * on Discover. Everyone else can — a collector, and every verified business
 * account.
 *
 * ## Why the line sits there
 *
 * A published event asks strangers to turn up somewhere at a time, and often to
 * pay for it. That is a promise about a room, and it is the one kind of content
 * on the platform where being wrong costs somebody an evening and a drive rather
 * than a scroll. So the capability tracks standing that was EARNED or VERIFIED:
 * "collector" is assigned by the system for sustained activity, and every
 * business persona has been through onboarding with a real name attached.
 * "enthusiast" is what a new account is on the day it signs up, and it is the one
 * state where nothing has been demonstrated or checked.
 *
 * Nothing is taken away from an enthusiast in the process. A private event is
 * the whole feature minus the audience — see {@link ../events!EventVisibility} —
 * so the restriction is on REACH, not on the verb.
 *
 * ## Producers and distributors are publishers
 *
 * Stated because the shorthand "collectors and professionals" could be read to
 * exclude them, and that reading breaks a settled design: the editorial model is
 * literally titled *What Estates Publish* and its event piece embeds an evening
 * an estate is hosting. A producer who could announce a dinner but not publish it
 * would be a producer whose announcement links to nothing.
 *
 * The honest statement of the rule is therefore a NEGATIVE one — every profile
 * except `enthusiast` — and it is written that way below so a persona added later
 * is a publisher by default. That default is deliberate: a new BUSINESS persona
 * has been verified, and forgetting to add it to an allowlist would silently take
 * a capability away from an account that had paid for it.
 */
export type EventPublisherProfile = MemberStatus | BusinessPersona;

/**
 * The one profile that cannot publish.
 *
 * A list of one, which is worth having anyway: it is the thing to add to when
 * the rule changes, and it makes {@link canPublishEvents} read as the rule
 * rather than as a comparison somebody has to interpret.
 */
export const NON_PUBLISHING_PROFILES: readonly EventPublisherProfile[] = ["enthusiast"];

/**
 * Whether this profile may publish an event to Discover.
 *
 * A pure rule derived from fields the contract already defines, published here
 * for the reason {@link personaTier} is: two apps deriving it separately is two
 * chances to disagree about who is allowed to fill a room.
 */
export function canPublishEvents(profile: EventPublisherProfile): boolean {
  return !NON_PUBLISHING_PROFILES.includes(profile);
}
