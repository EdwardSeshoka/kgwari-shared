import type { WineContract } from "../catalog/index.js";
import type { ProducerContract } from "../provenance/index.js";

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
 * ## Discriminated by subject, because the two are not interchangeable
 *
 * A collection has exactly one subject and cannot be part one thing and part
 * another, so the union has two members and no mixed case. That is the same rule
 * `itemCount` runs on: what it counts is decided by the subject, and there is
 * never a second count.
 *
 * The ORDER of these is the author's and is never re-sorted. Whatever ranks
 * wines elsewhere — verdict, note count, price — must not touch a collection's
 * order, because re-sorting somebody's list deletes the part of it they made.
 */
export type CollectionItemContract =
  | { subject: "wines"; wine: WineContract }
  /**
   * An estate on a route.
   *
   * {@link ProducerContract} rather than a name, because a stop is somewhere you
   * are going: it needs its region and its own page to open onto, and a route
   * whose stops are strings is a route you cannot follow.
   */
  | { subject: "estates"; producer: ProducerContract };
