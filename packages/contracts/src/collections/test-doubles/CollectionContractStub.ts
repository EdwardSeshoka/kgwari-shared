import type {
  CollectionContract as CollectionContractShape,
  PublishedCollectionContract as PublishedCollectionContractShape
} from "../collection.js";
import type { ItineraryCollectionContract as ItineraryCollectionContractShape } from "../itinerary.js";
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
 *
 * The itinerary factories go the other way, returning the NARROWER
 * {@link ItineraryCollectionContractShape} — and there are two of them, because a
 * route is the one kind whose card has a tense. A plan and a write-up are the same
 * record pointed in opposite directions, and the calls to action on them are
 * opposites too; a suite that only ever built one of the two has never rendered the
 * other. See {@link ItineraryMode}.
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

const documentedItineraryStub = defineStub<ItineraryCollectionContractShape>({
  id: "collection_the-franschhoek-tram-in-one-day",
  kind: "itinerary",
  subject: "stops",
  mode: "documented",
  title: "The Franschhoek tram, in one day",
  description: "Five stops, one of them twice, and the tram in between.",
  author: { name: "Thandi Nkosi", tier: "professional", role: "sommelier" },
  itemCount: 5,
  contents: { wines: 9, notes: 4 },
  saveCount: 87,
  preview: [
    { contentId: "stop_1", title: "Grande Provence" },
    { contentId: "stop_2", title: "Rickety Bridge" },
    { contentId: "stop_3", title: "Le Lude" }
  ],
  createdAt: "2026-07-18T21:30:00.000Z"
});

const plannedItineraryStub = defineStub<ItineraryCollectionContractShape>({
  id: "collection_two-days-in-stellenbosch",
  kind: "itinerary",
  subject: "stops",
  mode: "planned",
  title: "Two days in Stellenbosch",
  description: "Three cellar doors, one long lunch, and one designated driver.",
  author: { name: "Thandi Nkosi", tier: "professional", role: "sommelier" },
  itemCount: 5,
  saveCount: 12,
  preview: [
    { contentId: "stop_planned-1", title: "Meerlust Estate" },
    { contentId: "stop_planned-2", title: "Kanonkop Estate" },
    { contentId: "stop_planned-3", title: "Rust en Vrede" }
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
     * An itinerary — a day that HAPPENED, written up afterwards.
     *
     * The default itinerary double, because documented is the mode the shape was
     * redesigned for and the only one that exercises `contents`. Five stops calling
     * at four places: `itemCount` is 5, the strip names three of them, and a
     * consumer that assumes the stop count equals the number of distinct estates
     * gets it wrong here — which is the whole reason a route counts stops.
     *
     * The sub-line has a tally and the card has NO notes on it. Nine notes were
     * written on this day; embedding them would give back everything
     * {@link CollectionPreviewItemContract} bought, so the card says "5 stops · 9
     * wines · 4 notes" and the notes live on the detail page.
     *
     * No `cover`, and none of its preview entries carries an `image`. A place has no
     * label to show, so the card draws monogram plates from the titles; a fixture
     * that handed it artwork would let a consumer that only renders images pass.
     */
    makeItinerary(overrides: Overrides<ItineraryCollectionContractShape> = {}): ItineraryCollectionContractShape {
      return documentedItineraryStub.make(overrides);
    },

    /**
     * An itinerary that has not happened yet — stops in the order she means to
     * drive them.
     *
     * No `contents`, and its absence is CORRECT rather than missing: nothing has
     * been poured and nothing written, so there is nothing to tally and the sub-line
     * reads stops only. A consumer that renders "0 wines · 0 notes" here has turned
     * a plan into an empty diary.
     *
     * The tense difference is the reason this double exists separately. Any call to
     * action a stop offers — booking the evening it names — is live on this card and
     * must be absent from {@link makeItinerary}, and the only field that says which
     * is `mode`.
     */
    makePlannedItinerary(overrides: Overrides<ItineraryCollectionContractShape> = {}): ItineraryCollectionContractShape {
      return plannedItineraryStub.make(overrides);
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
