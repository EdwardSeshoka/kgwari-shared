import type { CollectionLensKey, LensRowContract } from "../lenses/index.js";
import type { PublishedCollectionContract } from "./collection.js";
import type { CollectionSubject } from "./collectionKind.js";
import type { ItineraryMode } from "./itinerary.js";

/**
 * The SHELVES and ITINERARIES landings — one request, two corpora.
 *
 * They are the same record with a different subject, so they take one endpoint
 * and differ by `subject` rather than by two shapes. That is the same economy
 * the taxonomy already runs on: "a collection of estates" costs a noun, not a
 * concept.
 */
export type ListCollectionsRequest = {
  /**
   * Which landing this is: `wines` for the shelves, `stops` for the itineraries.
   *
   * REQUIRED, because there is no combined list. A shelf and an itinerary read
   * in different treatments (a cover of labels against monogram plates, a count
   * of bottles against a count of stops and what is nested under them), and one
   * page holding both would need a legend to tell a reader which row was which.
   *
   * The itineraries landing asks for `stops`, not `estates` — it was `estates`,
   * and a client still sending that gets an empty page rather than an error,
   * because the value is still valid for a derived list of producers. That is the
   * one silent failure in this change and the reason it ships as a major.
   */
  subject: CollectionSubject;
  /**
   * Which tense, for the itineraries landing. Absent means every route.
   *
   * ## Why the landing asks twice
   *
   * The itineraries page reads as two runs — routes somebody has been on, and
   * routes somebody is going on — and they are two REQUESTS rather than two
   * sections of one response. Not for tidiness: each run scrolls on its own, so
   * each needs its own cursor, and one response cannot carry two.
   *
   * It also repairs {@link ListCollectionsResponse.lenses}. Those chips count what
   * the response holds, so a single response split into two runs by the client
   * would show "Sommeliers · 3" above two runs it is true of neither. Asking per
   * mode makes each chip row count its own run, which is the only way the number
   * under a chip means what it says.
   *
   * Ordering differs per run and that is the honest sort: a plan's date is when it
   * was written, a record's is the day it happened, and one order over both
   * compares two unlike facts.
   *
   * Absent for `subject: "wines"` always — a shelf has no tense. A server that
   * receives one may ignore it rather than fail; there is nothing dangerous about
   * asking a shelf when it happened, only nothing to answer.
   */
  mode?: ItineraryMode;
  /**
   * Which lens is applied. Absent means `lens.all`.
   *
   * Authorship, always — see {@link COLLECTION_LENSES}. The server decides which
   * rows fall in which lens because a byline gives no structural way to tell the
   * house from a member.
   */
  lens?: CollectionLensKey;
  cursor?: string;
  limit?: number;
};

/**
 * A page of a collections landing.
 *
 * Never a Lens: {@link PublishedCollectionContract} is a shape whose contents
 * were enumerated by a person, so a derived list cannot be constructed into this
 * response at all.
 *
 * The order is DATE, newest first — including the house's. Kgwari is a lens and
 * not a band, so a Selection sorts beside a member's shelf and the byline does
 * the distinguishing, exactly as it does on the row. Sorting the house to the
 * top would invent the curated badge the taxonomy refused.
 */
export type ListCollectionsResponse = {
  items: PublishedCollectionContract[];
  /**
   * The chips, and how many rows each leaves. Fewer than two lenses means the
   * row is not drawn — see {@link LensRowContract}.
   */
  lenses: LensRowContract;
  /** Opaque. Absent when this is the last page. */
  nextCursor?: string;
};
