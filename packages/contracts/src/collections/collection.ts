import type { MediaRefContract } from "../media/index.js";
import type { TrustBylineContract } from "../trust/index.js";
import type { CollectionKind, CollectionSubject } from "./collectionKind.js";
import type { CollectionPreviewItemContract } from "./collectionPreviewItem.js";
import type { CollectionRuleContract } from "./collectionRule.js";

/**
 * A collection — a shelf, an itinerary, a lens or a selection — as a surface
 * renders the CARD.
 *
 * One record underneath all four. The member never sees the word "collection";
 * they see the noun {@link CollectionKind} names, and the four nouns differ only
 * in what they can DO. That is why `kind` is on the wire and the axes behind it
 * are not: capability is the reader's question, and deriving it from two other
 * fields is a table every client would have to own.
 *
 * ## Sent, not derived — the same call `SearchFacet` makes
 *
 * `kind` is a function of membership × author × subject, computed on the server.
 * Sending it explicitly means a client never owns the 2×2, and a kind can later
 * split or merge without a client release. See
 * {@link ../search!SearchFacet}, which states the identical trade.
 *
 * ## What is deliberately NOT here
 *
 * **`visibility`.** A card that reaches a reader has already passed the gate:
 * published, and — for a Discover band — authored by somebody whose tier carries
 * reach. Sending the flag invites every client to re-implement that filter, and
 * a client-side privacy filter is one bug away from rendering a member's private
 * list. A member's own index needs private rows and therefore needs a
 * member-scoped contract, exactly as `CellarTonightRowContract` is member-scoped
 * — it does not need this one loosened.
 *
 * **`items`.** The card shows a {@link preview}; the ordered list belongs to the
 * collection's own endpoint.
 *
 * **The frozen-from provenance.** A Shelf made by freezing a Lens carries the
 * rule that made it, as inert text that is displayed and never executed. It is
 * real and it is owed — but it belongs to the cellar's own sheet, where a member
 * reads it, and inventing its shape from the card's side would repeat the
 * mistake this taxonomy just corrected.
 *
 * {@link rule} below is NOT that field and must not be pressed into service as
 * it. A live Lens's rule is executed on every read; a frozen Shelf's is a dead
 * record of how the list came to exist. One optional carrying both would make
 * "present" mean either "this is running" or "this once ran", which is the whole
 * distinction freezing exists to draw — and a client offering "refresh from rule"
 * on the second is the cycle {@link PublishedCollectionContract} forbids.
 *
 * **A house variant.** `author` is a byline, so Kgwari's Selection is
 * `{ name: "Kgwari" }` with no tier, exactly as an in-house
 * {@link ../editorial!EditorialContract} is attributed.
 *
 * ## The order is the author's
 *
 * A shelf is hers to drag and an itinerary is a route with a direction. Whatever
 * ranks wines elsewhere — verdict, note count, price — must not touch a
 * collection's order, on the card or in the full list. Re-sorting somebody's
 * list is deleting the part of it they made.
 */
export type CollectionContract = {
  id: string;
  /** Which of the four this is. Decides capability, and nothing else does. */
  kind: CollectionKind;
  /**
   * What is inside — wines or estates.
   *
   * A field rather than a type, so "a collection of estates" costs a noun and
   * not a concept. It decides what the cover is made of and what the sub-line
   * counts, which is how one index holds every type without a legend.
   */
  subject: CollectionSubject;
  /**
   * The author's own words.
   *
   * CONTENT, never a chrome key. "Six bottles for a Cape winter" was typed by a
   * person; it is not a vocabulary member and there is no catalog to look it up
   * in. This is the line between a collection and a
   * {@link ../catalog!WineCollectionContract}, which is a derived grouping and
   * therefore travels as a key with no words at all.
   */
  title: string;
  description?: string;
  /**
   * What a Lens selects.
   *
   * **Present if and only if `kind === "lens"`** — always on one, never on any
   * other. That biconditional is the field's whole contract and it cannot be
   * stated in the type without splitting `CollectionContract` into four, which
   * would cost every consumer a union to render one sub-line. It is asserted
   * instead, in `CELLAR_INDEX_RULES.lensStatesItsRule` and its negative twin, so a
   * composer that omits one or attaches one to a shelf fails a build rather than
   * shipping a row that cannot explain itself.
   *
   * A lens is the one kind a reader cannot see the contents of from the card, so
   * this is what its row shows where a shelf shows its holdings split. See
   * {@link CollectionRuleContract} for why it is a key and operands rather than a
   * sentence, and for the frozen-Shelf case this is not.
   */
  rule?: CollectionRuleContract;
  /**
   * The card's image, where one exists.
   *
   * {@link MediaRefContract} rather than a bare url, because a cover is
   * frequently a member's own photograph and its alt text is prose somebody
   * wrote in a language. Absent is common and not a defect: a wines card builds
   * its cover from the strip's labels, and an estates card from monogram plates.
   */
  cover?: MediaRefContract;
  /**
   * Who made it. The byline does all the trust work — there is no other
   * authorship field, and a member-made collection carries one only once it is
   * published.
   */
  author: TrustBylineContract;
  /**
   * How many things are in it.
   *
   * Denormalized for the card, and a display fact rather than truth — see
   * {@link CollectionPreviewItemContract}. What it counts is decided by
   * `subject`: bottles on a shelf, STOPS on an itinerary. There is no separate
   * wine count, because a collection has exactly one subject and cannot be part
   * one thing and part another.
   *
   * Counting stops rather than estates is what made the number honest. A route
   * that has lunch where it started called at four places and made five stops, and
   * the old shape could report that only by listing an estate twice. The wines and
   * notes nested under those stops are tallied separately and are not a second
   * subject — see {@link ItineraryContentsContract}, which is the one place a
   * collection carries a count beyond this one and says why it may.
   */
  itemCount: number;
  /** A few of the items, in the author's order, for the cover strip. */
  preview?: CollectionPreviewItemContract[];
  /**
   * How many members have saved it.
   *
   * Following a collection IS saving it — the same verb, the same count, and the
   * reason there is no separate follower model: a list you follow stays live
   * because its author curates it, which is what a save on a live unit already
   * means.
   */
  saveCount?: number;
  /** ISO-8601. When the collection was created, not when it was last edited. */
  createdAt: string;
};

/**
 * A collection that somebody can be shown — every kind except a Lens.
 *
 * ## Why this is a type and not a runtime check
 *
 * **A published thing's contents are only ever changed by a person.** A Lens is
 * derived: its contents are whatever the rule returns right now, so a published
 * one would keep changing after publication without its author touching it, and
 * a stranger following it and the member whose name is on it would both be
 * looking at something neither has seen.
 *
 * A member can still get there — by FREEZING the lens, which runs the rule once,
 * fixes the result, and discards the rule (a wines lens yields a Shelf, an
 * estates lens an Itinerary). What comes out is enumerated and hers, so it is
 * publishable by the ordinary route. Freeze is one-directional and the rule
 * survives only as inert provenance: keep it attached and somebody will ask for
 * "refresh from rule", which rebuilds a live rule inside a shelf and is exactly
 * the cycle the invariant forbids.
 *
 * So "no lens in a feed" is not a policy a server remembers to apply — it is a
 * shape a producer cannot construct.
 */
export type PublishedCollectionContract = CollectionContract & {
  kind: Exclude<CollectionKind, "lens">;
};
