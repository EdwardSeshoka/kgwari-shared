import type {
  ListCollectionsResponse,
  PublishedCollectionContract
} from "@edwardseshoka/contracts/collections";

import rawCollections from "./collections.json" with { type: "json" };
import rawShelves from "./shelves-landing.json" with { type: "json" };
import rawItineraries from "./itineraries-landing.json" with { type: "json" };

/**
 * Sample collections — one record, three of its four nouns.
 *
 * Typed as {@link PublishedCollectionContract} rather than the wider contract,
 * because a fixture is a thing somebody is going to render: a Lens is derived,
 * can never be published, and belongs to a member's own index rather than to any
 * feed. The contracts package ships a lens double for the code that has to hold
 * one; nothing here should.
 *
 * The five cover the states that differ:
 *
 * - **`collection_cape_bordeaux`** — a Shelf published by a COLLECTOR, and the
 *   one the curation's "Cape Bordeaux" doorway points at. It is here so that
 *   doorway resolves; it is deliberately NOT in either band, because a member's
 *   list does not reach Discover on its own. The house pointing a doorway at one
 *   specific list is editorial judgement; a band filling itself is reach, and
 *   only the second is a tiered capability.
 * - **`collection_cape_whites_worth_keeping`** — a Shelf published by a verified
 *   sommelier: member-made, so still a Shelf, but the byline carries a mark. It
 *   also carries no `cover`, so the card has to build one from its labels.
 * - **`collection_six_bottles_cape_winter`** — a Selection. Editorial put the
 *   things in, and the byline is a name with no mark at all.
 * - **`collection_two_days_in_stellenbosch`** and
 *   **`collection_a_weekend_in_the_swartland`** — Itineraries: subject
 *   `estates`, no cover and no preview images anywhere, because an estate has no
 *   label to show and the card draws monogram plates instead.
 *
 * Every `preview` is shorter than its `itemCount`, on purpose: the strip is a
 * handful of the list and never a census of it.
 */
export const collectionsSamples = {
  collections: rawCollections as unknown as PublishedCollectionContract[],
  /**
   * The SHELVES landing — every published list of bottles, newest first, with
   * its chip row.
   *
   * The house's Selections sort among the members' and the sommeliers' rather
   * than above them: Kgwari is a lens, not a band, and the byline does the only
   * distinguishing there is.
   */
  shelvesLanding: rawShelves as unknown as ListCollectionsResponse,
  /** The ITINERARIES landing — the same record, subject `estates`. */
  itinerariesLanding: rawItineraries as unknown as ListCollectionsResponse
} as const;
