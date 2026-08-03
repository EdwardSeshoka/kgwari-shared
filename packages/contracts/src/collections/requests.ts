import type { CollectionLensKey, LensRowContract } from "../lenses/index.js";
import type { PublishedCollectionContract } from "./collection.js";
import type { CollectionSubject } from "./collectionKind.js";

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
   * Bottles or estates — which landing this is.
   *
   * REQUIRED, because there is no combined list. A shelf and an itinerary read
   * in different treatments (a cover of labels against monogram plates, a count
   * of bottles against a count of places), and one page holding both would need
   * a legend to tell a reader which row was which.
   */
  subject: CollectionSubject;
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
