/**
 * What a contribution can be. Ordered as the filter chips read, not as the
 * corpus is weighted.
 *
 * ## The collection kind, and why it is here now
 *
 * It was parked twice. First because the cellar had not named the object — it
 * has since, and {@link ../collections!CollectionContract} is the shape. Then
 * because a LEDGER question remained open: whether publishing a list is a
 * contribution to the corpus in the way a note or a story is, given that a
 * collection arranges things other people made.
 *
 * The Latest design answers it. The ledger is cut to carry every kind, and a
 * fixture exercising only notes ships its other branches untested. Publishing a
 * list is an act with a date and an author, which is all the ledger has ever
 * asked of a row.
 *
 * ## One `collection`, not `shelf` and `itinerary`
 *
 * The design says the MARK names the concrete noun — shelf, itinerary — and
 * never "Collection", because that word is the abstract base type and a ledger
 * is where it would leak first. That is a rule about the rendered word, and
 * `collection.kind` supplies it.
 *
 * Splitting the discriminant instead would make this the only place in the union
 * where the abstract type does not carry its own noun: `editorial` already works
 * exactly this way, with `contentType` naming article, story or guide. It would
 * also need a third member the day a Selection is published, and Selections
 * belong in the ledger — the house's lists sort by date beside everyone else's,
 * which is the whole argument for Kgwari being a lens rather than a band.
 */
export type ContributionKind = "note" | "editorial" | "tasting" | "collection";

export const CONTRIBUTION_KINDS = [
  "note",
  "editorial",
  "tasting",
  "collection"
] as const satisfies readonly ContributionKind[];
