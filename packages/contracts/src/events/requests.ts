import type { CalendarLensKey, LensRowContract } from "../lenses/index.js";
import type { PublishedEventContract } from "./publishedEvent.js";

/**
 * The CALENDAR landing — the diary, newest first, narrowed in place.
 *
 * A diary is asked WHEN, which is why its lens set is time-shaped where the
 * collection landings' is authorship-shaped. `lens.seatsLeft` is the exception
 * that proves the mechanism generalises: an attribute lens sitting in a row of
 * time lenses, needing no new shape to do it.
 */
export type ListEventsRequest = {
  /** Absent means `lens.all`. See {@link CALENDAR_LENSES}. */
  lens?: CalendarLensKey;
  cursor?: string;
  limit?: number;
};

/**
 * A page of the diary.
 *
 * {@link PublishedEventContract}, because this landing faces strangers: a
 * private evening reaching it would put a member's address in front of people
 * they never invited. The type is the guard, not a filter somebody remembers.
 *
 * Ordered by `startDateTime`, soonest first — a calendar reads forward, unlike
 * every other landing here, which reads back from now. A cancelled evening still
 * appears: it is a fact about a room somebody may have been planning around, and
 * dropping it silently is how a member turns up to a locked door.
 */
export type ListEventsResponse = {
  items: PublishedEventContract[];
  lenses: LensRowContract;
  /** Opaque. Absent when this is the last page. */
  nextCursor?: string;
};
