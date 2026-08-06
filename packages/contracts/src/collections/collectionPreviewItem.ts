import type { MediaRefContract } from "../media/index.js";

/**
 * One entry in a collection card's cover strip — enough to show WHAT is inside,
 * and deliberately not enough to render the thing itself.
 *
 * ## It carries no kind, and that is the rule
 *
 * The collection's `subject` says whether these are wines, estates or stops, so
 * an entry cannot state a kind of its own — which makes a mixed collection
 * inexpressible rather than merely discouraged. Mixing is the Save mechanism's
 * job; a shelf that could hold a story is the collapse this taxonomy exists to
 * prevent, and the surest way to prevent it is to leave nowhere to write it
 * down.
 *
 * A stops strip does not weaken that. It draws one entry per stop, captioned with
 * the place — never a wine from inside a stop beside a place from another. The
 * mixture on an itinerary is nested and stays on the detail page; the strip flattens
 * it to what a cover can honestly show, which is where the route went.
 *
 * ## Why the card carries this instead of the items
 *
 * A card that resolved its refs would fan out across the catalogue and the
 * provenance domain per card, on the app's most-requested endpoint, to draw
 * three thumbnails. So the card carries a small denormalized strip and the
 * ordered list is fetched when the collection is opened — the same trade a
 * search row makes, and for the same reason.
 *
 * ## It is a display fact, not truth
 *
 * The strip is written when the collection is written and can lag the entities
 * behind it. Nothing may reconcile it against a resolved list at read time — a
 * card that refetches to check its own thumbnails has given back everything this
 * shape bought.
 */
export type CollectionPreviewItemContract = {
  /**
   * The id in its own domain: a wine VINTAGE id, a producer id, or a STOP id —
   * `subject` says which.
   *
   * A stops strip keys on the stop and not on the place it calls at, because a
   * route can call at one estate twice and two entries sharing an id is a strip
   * that silently draws one plate. The caption is still the place's name; only the
   * key is the stop's.
   */
  contentId: string;
  /**
   * The caption under the image.
   *
   * A bare string rather than a {@link ../text!CanonicalText}, matching
   * {@link ../discover!DiscoverDoorwayContract.title} beside it on the same
   * screen: the strip is a caption, and the authoritative name arrives with the
   * entity when the collection is opened.
   */
  title: string;
  /**
   * The label or the plate.
   *
   * Absent for an estate or a stop is the normal case, not a gap — a place has no
   * label to show, and the cover draws a monogram from `title` instead. Inventing
   * a building or a vine would be inventing imagery the product does not have.
   *
   * A stop is not an exception because wines were poured there. Borrowing a label
   * from inside a stop would make one arbitrary bottle stand for the morning, and
   * the two stops that poured nothing would be the only plates on the strip.
   */
  image?: MediaRefContract;
};
