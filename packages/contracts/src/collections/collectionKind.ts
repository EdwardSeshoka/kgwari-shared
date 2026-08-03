/**
 * The two axes that make a collection's type, and the four nouns they produce.
 *
 * ## One record, four nouns
 *
 * "Collection" is the abstract base type — `membership · author · subject ·
 * visibility` — and it stays in the code and leaves the interface. A member
 * never holds the word. What they see are four concrete things, and `shelf` is
 * the one that translates from real life: a shelf holds bottles.
 *
 *                  ENUMERATED                      DERIVED
 *                  (someone put each thing in)     (a rule decides)
 *   MEMBER-MADE    Shelf · Itinerary               Lens
 *   EDITORIAL      Selection                       Index
 *
 * `index` is not here. It is the catalogue cut by a facet — nobody authored it
 * and nobody owns it, which makes it browse rather than a collection, and it
 * needs no member-facing noun at all.
 */
export type CollectionKind = "shelf" | "itinerary" | "lens" | "selection";

export const COLLECTION_KINDS = [
  "shelf",
  "itinerary",
  "lens",
  "selection"
] as const satisfies readonly CollectionKind[];

/**
 * How the contents got in.
 *
 * The axis that decides what a collection can DO. Enumerated contents were put
 * there by a person one at a time, so they can be ordered and they can be
 * published. Derived contents are whatever the rule currently returns, which is
 * why a Lens can be neither — see {@link PublishedCollectionContract}.
 *
 * Not sent on the wire. It is a function of {@link CollectionKind} — `lens` is
 * the derived one and the other three are enumerated — and two fields that must
 * agree are two fields that eventually will not.
 */
export type CollectionMembership = "enumerated" | "derived";

/**
 * What kind of thing is in it.
 *
 * A FIELD, never a type, and that is the whole economy of this taxonomy: "a
 * collection of estates" needs no new concept, only a better noun. Estates are
 * genuinely enumerable objects, so a member-made set of them is real — it just
 * cannot be called a shelf, so the same type takes a place-shaped noun.
 *
 * Regions and vintages are absent on purpose. Neither is a thing you collect: a
 * region is a facet, so "Swartland + Piekenierskloof" is a RULE over wines and
 * lands in `lens`, correctly losing ordering and publishing on the way.
 *
 * ## Why there is no "mixed"
 *
 * Wines and stories and evenings together is the SAVE mechanism — a one-tap
 * bookmark across everything — and it is a different verb on a different object.
 * Letting a shelf hold a story would collapse the two, and the collapse is
 * one-way: once mixed containers exist, nothing tells a member why the thing
 * they saved is not on a shelf.
 *
 * The subject also does display work. It decides what a cover is made of —
 * overlapping wine labels, or monogram plates for estates — and what the
 * sub-line counts, which is how one index holds every type without labelling a
 * single row.
 */
export type CollectionSubject = "wines" | "estates";
