import type { ItineraryStopEventRefContract } from "./itineraryStop.js";

/**
 * What is on at a place, so a stop being planned can be booked from.
 *
 * ## The idea this exists for
 *
 * A member adds Kanonkop to a draft route and the stop immediately offers the
 * evenings on there — so planning the day and booking it are one pass instead of
 * two. That is the whole feature, and the shape it needs is the smallest one:
 * ask a place what is on, get back the exact rows a stop's `event` field takes.
 *
 * ## A LOOKUP, never a field
 *
 * This is deliberately not stored on {@link ItineraryStopContract}. If a stop
 * carried its place's programme, every route would hold a cache of somebody
 * else's calendar — stale the moment a host moves an evening, and duplicated
 * across every draft that named the same estate. So a stop stores nothing until
 * one is taken, and then stores the one that was.
 *
 * That is what keeps a stop referential, which is the reason the whole itinerary
 * redesign fits: the route owns no content, and this endpoint owns no route.
 *
 * ## Forward only, and structurally so
 *
 * There is no `until`, no `before`, and no way to ask for a window. The only
 * bound a caller may state is where to START, and the server clamps that to today
 * — so the earliest thing this can return is the next one.
 *
 * The reason is {@link ItineraryMode}. A documented route names evenings that are
 * over, and a Book button on a past evening is the one thing this feature must not
 * be able to produce. A symmetrical query would let a client fetch a documented
 * route's dates and render exactly that, so the shape declines to express it. The
 * check a server would otherwise have to remember is a parameter that does not
 * exist.
 */
export type ListPlaceProgrammeRequest = {
  /**
   * Whose programme. A producer id — the same one the stop's `place` carries, so
   * a draft asks with what it already holds.
   */
  producerId: string;
  /**
   * ISO-8601 calendar day to start from. Absent means today.
   *
   * A member planning a specific Saturday wants that Saturday, not the next thing
   * on. Clamped forward: a day in the past is read as today rather than refused,
   * because a draft left open overnight would otherwise start failing at midnight
   * and a member has done nothing wrong.
   *
   * A DAY and not an instant, matching {@link ItineraryStopContract.date} — the
   * two are compared, and comparing a day to a timestamp is how an evening lands
   * on the wrong side of a boundary for a reader in another zone.
   */
  from?: string;
  limit?: number;
};

/**
 * A place's programme, soonest first.
 *
 * `items` are {@link ItineraryStopEventRefContract} — the identical shape a stop's
 * `event` takes — so taking one is a COPY rather than a transform. Nothing is
 * mapped between asking and booking, which is the only way to be sure the evening
 * a member tapped is the evening the stop records.
 *
 * It follows that this carries no admission, no price and no seat count. Kgwari
 * does not take the booking; `eventId` opens the event's own page, where the host
 * does — see {@link SavableKind}, which draws the same line.
 *
 * Empty is a real and common answer, not an error: most estates have nothing
 * listed for most weekends, and a stop with no programme is still a complete stop.
 * A client that renders "no results" as a failure has turned a walk-in into a
 * broken screen.
 */
export type ListPlaceProgrammeResponse = {
  items: ItineraryStopEventRefContract[];
  /** Opaque. Absent when this is the last page. */
  nextCursor?: string;
};
