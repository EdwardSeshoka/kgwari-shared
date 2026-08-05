import type {
  GetCollectionResponse,
  ListCollectionsResponse,
  PublishedCollectionContract
} from "@edwardseshoka/contracts/collections";

import rawCollections from "./collections.json" with { type: "json" };
import rawShelves from "./shelves-landing.json" with { type: "json" };
import rawItineraries from "./itineraries-landing.json" with { type: "json" };
import rawDetails from "./collection-details.json" with { type: "json" };

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
 * - **`collection_two_days_in_stellenbosch`** — an Itinerary that HAPPENED:
 *   subject `stops`, `mode: "documented"`, with a `contents` tally so the
 *   sub-line can read "5 stops · 11 wines · 4 notes". Its five stops call at
 *   four places, which is the arithmetic the old estates-subject shape could not
 *   express — the route ends where it started, and counting places would lose
 *   the evening.
 * - **`collection_a_weekend_in_the_swartland`** — an Itinerary that has NOT:
 *   `mode: "planned"`, and therefore no `contents` at all. Its absence is
 *   correct rather than missing; a consumer that renders "0 wines · 0 notes"
 *   here has turned somebody's plan into an empty diary. The two routes are
 *   deliberately in opposite modes, because they read in opposite tenses and
 *   only one of them may offer a way to book the evenings it names.
 *
 *   Neither carries a cover, and no preview entry anywhere carries an image: a
 *   place has no label to show, so the card draws monogram plates from the
 *   titles. The strips are keyed on the STOP and captioned with the place, which
 *   is what keeps a route that doubles back from drawing one plate for two stops.
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
  /** The ITINERARIES landing — the same record, subject `stops`, both modes present. */
  itinerariesLanding: rawItineraries as unknown as ListCollectionsResponse,
  /**
   * OPENING a list — every collection's own detail page, keyed by id.
   *
   * The card has always said the ordered list belongs to the collection's own
   * endpoint, and that endpoint had no seed: every surface could show a route and
   * none could open one. Prefer {@link createCollectionDetail}, which fails loudly
   * on an id nothing carries rather than handing back `undefined`.
   */
  collectionDetails: rawDetails as unknown as Record<string, GetCollectionResponse>
} as const;

/**
 * One collection's detail page.
 *
 * ## Why this throws rather than returning `undefined`
 *
 * A missing fixture is a bug in the fixture, and the version that returns nothing
 * makes it surface as a blank page three layers away from the cause. Every id in
 * `collectionsSamples.collections` has a detail by construction — the generator
 * builds one per row — so an id this cannot resolve is an id nothing carries.
 *
 * ## What the routes' details are shaped like
 *
 * `items` is discriminated by `subject`. A route's rows are `stops` — a place, the
 * day, and whatever happened there — and a shelf's are `wines`. The `estates` arm
 * is absent from the fixture on purpose: it is reachable only from a Lens, which is
 * derived, unpublishable, and deliberately not seeded anywhere.
 *
 * The counts on the card are DERIVED from these rows rather than written beside
 * them, so `item.itemCount` is the number of stops and `item.contents` counts what
 * is nested inside them. They cannot drift, because the card was never told them.
 */
export function createCollectionDetail(collectionId: string): GetCollectionResponse {
  const detail = collectionsSamples.collectionDetails[collectionId];
  if (detail === undefined) {
    throw new Error(
      `collections samples: no detail for "${collectionId}" — every seeded collection ` +
        `has one, so this id is not in the fixture`
    );
  }
  return detail;
}

/** Every route's detail, in the landing's order. The `stops` arm, and only it. */
export function createRouteDetails(): GetCollectionResponse[] {
  return collectionsSamples.itinerariesLanding.items.map((route) =>
    createCollectionDetail(route.id)
  );
}
