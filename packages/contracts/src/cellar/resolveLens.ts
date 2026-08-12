import type {
  CollectionContract,
  CollectionItemContract
} from "../collections/index.js";

/**
 * Open one of a member's own lenses.
 *
 * ## Why this is not `GetCollectionRequest`
 *
 * Because that endpoint cannot carry a lens and must not learn how.
 * {@link ../collections!GetCollectionResponse} returns a
 * {@link ../collections!PublishedCollectionContract}, which is
 * `CollectionContract & { kind: Exclude<CollectionKind, "lens"> }` — a lens is
 * excluded **by type**, deliberately, because a lens is derived and cannot be
 * published: its contents are whatever its rule returns right now.
 *
 * Widening that response to plain `CollectionContract` would have been the
 * smaller diff and the worse contract. It would make every consumer of the
 * public collection endpoint — feeds, share cards, crawlers — newly capable of
 * receiving somebody's private rule, and the only thing standing between them
 * and it would be server discipline. The type is what stands there today.
 *
 * So the same split the cellar index already makes, one level down: a member's
 * own record is asked for through her own endpoint. `GetCellarIndexResponse`
 * lists the lenses; this resolves one.
 *
 * ## Ownership is not expressible here, and that is the point
 *
 * Whose lens it is comes from the session, not from this request. There is no
 * `memberId` field for the same reason `GetCellarIndexResponse` has no input at
 * all — a parameter naming the owner is a parameter that can name somebody
 * else. A lens belonging to another member is a 404 to everyone but its owner,
 * and that is a server rule this shape makes it impossible to ask to break.
 */
export type ResolveLensRequest = {
  /**
   * The lens, by the id the index gave for it — the same
   * {@link ../collections!CollectionContract.id} that arrives in a cellar
   * section's `items`, and the same one a
   * {@link CellarDoorTargetContract} `collection` arm points at.
   */
  lensId: string;
  /** From the previous page's {@link ResolveLensResponse.nextCursor}. */
  cursor?: string;
  /** A page size hint. The server owns the ceiling. */
  limit?: number;
};

/**
 * A lens's contents, right now.
 *
 * ## `null` rather than an error
 *
 * Mirrors {@link ../collections!GetCollectionResponse.item}. A lens that does
 * not exist, and a lens that exists and belongs to somebody else, are the same
 * answer here — an id nobody can tell apart is an id nobody can probe with.
 */
export type ResolveLensResponse = {
  /**
   * The lens itself, so a cold arrival works.
   *
   * Sent even though the index has already described it, because a lens has a
   * URL: somebody following a link has no index in hand, and a page that could
   * only render after its parent had loaded would be a page that cannot be
   * shared. `CollectionContract` and not the published narrowing, for the
   * reason this whole file exists.
   */
  lens: CollectionContract | null;

  /**
   * What the rule matched — a page of it.
   *
   * Stops are excluded by type. A stop is an occasion on a route and belongs
   * to that route; a rule that returned one would be answering a question
   * about a journey with a row from somebody's itinerary. What is left is the
   * two subjects a lens is actually written over: wines, and the producers a
   * member follows — which is the case
   * {@link ../collections!CollectionItemContract}'s estate arm already names as
   * "a Lens over producers … only ever opened by its owner".
   */
  items: Exclude<CollectionItemContract, { subject: "stops" }>[];

  /**
   * The whole match count — **not `items.length`.**
   *
   * The same rule, and the same reason, as
   * {@link CellarSectionContract.count}: a page is a page, and a client that
   * counts the array it was handed reports its own page size as the size of the
   * set. It matters more here than on the index, because this number has to
   * agree with the one the lens's own row showed a moment ago on the cellar
   * home — two reads of one record, and the drift between them is visible in a
   * single click.
   */
  count: number;

  /** Absent on the last page. */
  nextCursor?: string;
};
