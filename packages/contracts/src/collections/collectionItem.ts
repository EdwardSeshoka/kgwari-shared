import type { WineContract } from "../catalog/index.js";
import type { ProducerContract } from "../provenance/index.js";
import type { ItineraryStopContract } from "./itineraryStop.js";

/**
 * One entry of a collection, as its own detail page renders it.
 *
 * ## Why this is not {@link CollectionPreviewItemContract}
 *
 * The preview is a cover strip: three labels behind a title, so a card can show
 * what is inside without a second request. It carries an id and a name because
 * that is all a strip draws.
 *
 * Opening the list is a different question. A shelf's detail page is a page of
 * WINES — each with its verdict, its estate, its vintage — and a page of ids
 * would be a page of second fetches, one per row. So the item carries the
 * domain's own contract, which also means a row on a shelf and the same wine in
 * a search result cannot disagree about what it is.
 *
 * ## Discriminated by subject, because the members are not interchangeable
 *
 * A collection has exactly one subject and cannot be part one thing and part
 * another, so there is no mixed case. That is the same rule `itemCount` runs on:
 * what it counts is decided by the subject, and a row cannot state a kind of its
 * own.
 *
 * One endpoint holds all three, rather than an itinerary getting a response shape
 * of its own. {@link GetCollectionResponse} is "open a list", the answer is
 * "here it is, in order", and splitting it by subject would give two endpoints
 * that must agree about ordering, emptiness and the not-published case — three
 * agreements that eventually will not hold.
 *
 * The ORDER of these is the author's and is never re-sorted. Whatever ranks
 * wines elsewhere — verdict, note count, price — must not touch a collection's
 * order, because re-sorting somebody's list deletes the part of it they made. For
 * a route the order is stronger than a preference: it is a DIRECTION, and reading
 * the stops backwards describes a different day.
 */
export type CollectionItemContract =
  | { subject: "wines"; wine: WineContract }
  /**
   * An estate, as a derived list of them renders one.
   *
   * The enumerated case left: a member-made route holds `stops`, not estates,
   * because the same estate can be two occasions. What remains is a Lens over
   * producers — "estates you follow" — which is not published and therefore only
   * ever opened by its owner.
   *
   * {@link ProducerContract} rather than a name, because a place needs its region
   * and its own page to open onto, and a row that is a string leads nowhere.
   */
  | { subject: "estates"; producer: ProducerContract }
  /**
   * One occasion on a route — a place, and what happened there.
   *
   * The heterogeneity lives INSIDE this, never across the union: a stop carries
   * wines and notes and an event, and the list is still all stops. See
   * {@link ItineraryStopContract}, which argues why nesting is not mixing.
   */
  | { subject: "stops"; stop: ItineraryStopContract };
