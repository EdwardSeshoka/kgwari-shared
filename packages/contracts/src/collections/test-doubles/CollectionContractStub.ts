import type {
  CollectionContract as CollectionContractShape,
  PublishedCollectionContract as PublishedCollectionContractShape
} from "../collection.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * One record, four nouns.
 *
 * A factory per kind, because the kinds differ in what they can DO and a
 * consumer that only ever sees shelves has never rendered the two rows that
 * behave differently: a Lens, which offers freeze where ordering and publishing
 * would be, and a Selection, which keeps moving after somebody follows it.
 *
 * The lens factory returns the WIDER {@link CollectionContractShape} while the
 * other three return {@link PublishedCollectionContractShape}, and that is not
 * an oversight — it is the invariant in the signatures. A lens cannot be handed
 * to anything that renders published collections, and the type says so at the
 * only place it can: where the double is used.
 */

const shelfStub = defineStub<PublishedCollectionContractShape>({
  id: "collection_cape-bordeaux",
  kind: "shelf",
  subject: "wines",
  title: "Cape Bordeaux",
  description: "Cabernet-led blends built to reward a decade in the cellar.",
  author: { name: "Nomsa Dlamini", tier: "professional", role: "sommelier" },
  itemCount: 9,
  saveCount: 214,
  preview: [
    { contentId: "rubicon-2018", title: "Rubicon 2018" },
    { contentId: "de-toren-book-xvii-2016", title: "Book 17 XVII 2016" },
    { contentId: "paul-sauer-2011-kanonkop-est", title: "Paul Sauer 2011" }
  ],
  createdAt: "2026-05-04T08:00:00.000Z"
});

const itineraryStub = defineStub<PublishedCollectionContractShape>({
  id: "collection_two-days-in-stellenbosch",
  kind: "itinerary",
  subject: "estates",
  title: "Two days in Stellenbosch",
  description: "Three cellar doors, one long lunch, and one designated driver.",
  author: { name: "Thandi Nkosi", tier: "professional", role: "sommelier" },
  itemCount: 5,
  saveCount: 87,
  preview: [
    { contentId: "estate_meerlust-estate", title: "Meerlust Estate" },
    { contentId: "estate_kanonkop-estate", title: "Kanonkop Estate" },
    { contentId: "estate_rust-en-vrede", title: "Rust en Vrede" }
  ],
  createdAt: "2026-06-11T12:00:00.000Z"
});

const selectionStub = defineStub<PublishedCollectionContractShape>({
  id: "collection_cape-chenin-the-long-game",
  kind: "selection",
  subject: "wines",
  title: "Cape Chenin, the long game",
  description: "What the office is laying down, and why.",
  cover: {
    url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1200&auto=format&fit=crop&q=80",
    alt: { source: "negotiated", text: "Three white wine glasses against a window.", languageTag: "en" }
  },
  author: { name: "Kgwari" },
  itemCount: 7,
  saveCount: 1_402,
  preview: [
    { contentId: "palladius-2010", title: "Palladius 2010" },
    { contentId: "mullineux-elandskloof-chardonnay-2016", title: "Elandskloof Chardonnay 2016" }
  ],
  createdAt: "2026-05-21T11:15:00.000Z"
});

const lensStub = defineStub<CollectionContractShape>({
  id: "collection_ready-this-year",
  kind: "lens",
  subject: "wines",
  title: "Ready this year",
  author: { name: "Alexandra Meyer", status: "enthusiast" },
  itemCount: 12,
  createdAt: "2026-07-02T19:40:00.000Z"
});

export const CollectionContract = {
  StubFactory: {
    ...shelfStub,

    /**
     * An itinerary — estates, in the order she means to drive them.
     *
     * No `cover`, and none of its preview entries carries an `image`. An estate
     * has no label to show, so the card draws monogram plates from the titles;
     * a fixture that handed it artwork would let a consumer that only renders
     * images pass.
     */
    makeItinerary(overrides: Overrides<PublishedCollectionContractShape> = {}): PublishedCollectionContractShape {
      return itineraryStub.make(overrides);
    },

    /**
     * Editorial's own, and visibly so. The byline is a NAME and nothing else —
     * Kgwari does not wear a verification mark on its own content, and a
     * consumer that renders a mark whenever `author` is present gets it wrong
     * here first.
     */
    makeSelection(overrides: Overrides<PublishedCollectionContractShape> = {}): PublishedCollectionContractShape {
      return selectionStub.make(overrides);
    },

    /**
     * A lens — the kind that can never be shown to anybody but its owner.
     *
     * Deliberately typed as the wider contract, so passing it where a published
     * collection is expected does not compile. Note what is absent as well as
     * the kind: no `saveCount`, because nothing derived is followable, and no
     * `description`, because a rule explains itself.
     */
    makeLens(overrides: Overrides<CollectionContractShape> = {}): CollectionContractShape {
      return lensStub.make(overrides);
    },

    /**
     * A member's first shelf, an hour old: no blurb, no cover, no strip.
     *
     * The card still has to render, and this is the double that says so. Every
     * optional is removed rather than emptied — `preview: []` would let a client
     * that draws an empty strip pass.
     */
    makeUndescribed(overrides: Overrides<PublishedCollectionContractShape> = {}): PublishedCollectionContractShape {
      return shelfStub.make({
        id: "collection_things-to-try",
        title: "things to try",
        description: undefined,
        cover: undefined,
        preview: undefined,
        author: { name: "Alexandra Meyer", status: "enthusiast" },
        itemCount: 2,
        saveCount: undefined,
        ...overrides
      });
    }
  }
};
