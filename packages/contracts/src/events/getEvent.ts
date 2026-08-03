import type { EventContract } from "./event.js";

/**
 * Opening one evening.
 *
 * {@link EventContract} and not {@link PublishedEventContract}, deliberately: a
 * private event HAS a detail page — it is the whole feature minus the audience,
 * and the people invited see everything a public attendee would. What guards it
 * is authorization on the request, not the shape of the reply.
 *
 * That is the opposite call from the calendar landing, which takes the published
 * type because it faces strangers by definition. A list is a broadcast; a
 * detail is a request for one thing by id, and the two need different guards.
 *
 * `null` when the evening does not exist or the caller may not see it — the same
 * fact to a reader, and distinguishing them would confirm that a private event
 * is there.
 */
export type GetEventResponse = {
  item: EventContract | null;
};
