import type { ItineraryStopContract as ItineraryStopContractShape } from "../itineraryStop.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { TastingNoteContract } from "../../social/test-doubles/index.js";

/**
 * A stop on a route — and the four states a consumer has to survive.
 *
 * The base is a DOCUMENTED stop with wines and a note, because that is the case
 * the shape was redesigned for and the one that exercises every branch. The
 * variants are the ones that broke the old estates-only shape:
 *
 * - `makePlanned` — a place and nothing else. Complete, not a draft.
 * - `makeSilent` — lunch. It happened, and nothing was poured or written.
 * - `makeAtEvent` — the tram. An event ref, and no booking anywhere on it.
 * - `makeUnwritten` — wines poured, nothing written up yet.
 * - `makeUndated` — a stop in a draft, before a Saturday has been picked.
 *
 * The stops here are Franschhoek, in tram order, so a consumer stitching several
 * together gets a route that reads like one rather than four unrelated farms.
 */

const stopStub = defineStub<ItineraryStopContractShape>({
  id: "stop_1",
  date: "2026-07-18",
  place: {
    id: "estate_grande-provence",
    name: "Grande Provence",
    regionId: "region_franschhoek",
    regionName: "Franschhoek",
    countryCode: "ZA",
    foundedYear: 1694,
    wineCount: 14
  },
  wines: [
    {
      id: "grande-provence-chardonnay-2022",
      wineLabelId: "grande-provence-chardonnay",
      name: "Grande Provence Chardonnay",
      estate: "Grande Provence",
      producerId: "estate_grande-provence",
      vintage: 2022,
      region: "Franschhoek",
      regionId: "region_franschhoek",
      countryCode: "ZA"
    },
    {
      id: "grande-provence-amphora-chenin-2021",
      wineLabelId: "grande-provence-amphora-chenin",
      name: "Amphora Chenin Blanc",
      estate: "Grande Provence",
      producerId: "estate_grande-provence",
      vintage: 2021,
      region: "Franschhoek",
      regionId: "region_franschhoek",
      countryCode: "ZA"
    }
  ],
  /**
   * Composed from the note double's own itinerary variant rather than a literal,
   * so the `origin` block has exactly one definition. Two copies of it would drift,
   * and the field they would drift on is the one the ledger filters by.
   */
  notes: [TastingNoteContract.StubFactory.makeFromItinerary()]
});

export const ItineraryStopContract = {
  StubFactory: {
    ...stopStub,

    /**
     * A stop on a route that has not happened yet.
     *
     * A place and nothing else, and this is a COMPLETE stop — not a draft. A
     * consumer that renders an empty tasting list here, or a "not written up yet"
     * prompt, has read absence as a defect on the one mode where it is the norm.
     * See {@link ItineraryMode}, where the two modes disagree about exactly this.
     */
    makePlanned(overrides: Overrides<ItineraryStopContractShape> = {}): ItineraryStopContractShape {
      return stopStub.make({
        id: "stop_planned-1",
        wines: undefined,
        notes: undefined,
        ...overrides
      });
    },

    /**
     * Lunch. It happened; nothing was poured and nothing was written.
     *
     * The stop the old shape could not hold at all — the fixture's own "one long
     * lunch" had to be counted as an estate. Every optional is REMOVED rather than
     * emptied: `wines: []` would let a client that draws an empty tasting list pass.
     *
     * Structurally identical to a planned stop, which is the point. Nothing on a
     * stop says which mode it is in, so a consumer that infers tense from emptiness
     * gets this row backwards.
     */
    makeSilent(overrides: Overrides<ItineraryStopContractShape> = {}): ItineraryStopContractShape {
      return stopStub.make({
        id: "stop_3",
        place: {
          id: "estate_le-lude",
          name: "Le Lude",
          regionId: "region_franschhoek",
          regionName: "Franschhoek",
          countryCode: "ZA",
          wineCount: 8
        },
        wines: undefined,
        notes: undefined,
        ...overrides
      });
    },

    /**
     * The tram itself — a stop that was an event.
     *
     * The ref carries a title, its language and a start time, and NOTHING that
     * resembles admission, price or a seat. Kgwari does not take the booking, and a
     * consumer that finds a way to book from this fixture has found a field that
     * should not exist.
     *
     * The title is {@link NegotiatedText} carrying `af`, because the name is prose
     * somebody wrote in Afrikaans — a consumer that defaults every title to English
     * mislabels it here first. The tag rides WITH the text rather than beside it, so
     * there is no second field to forget to read.
     */
    makeAtEvent(overrides: Overrides<ItineraryStopContractShape> = {}): ItineraryStopContractShape {
      return stopStub.make({
        id: "stop_2",
        place: {
          id: "estate_rickety-bridge",
          name: "Rickety Bridge",
          regionId: "region_franschhoek",
          regionName: "Franschhoek",
          countryCode: "ZA",
          wineCount: 11
        },
        wines: undefined,
        notes: undefined,
        event: {
          eventId: "event_wynhuis-tramrit",
          title: { source: "negotiated", text: "Wynhuis tramrit", languageTag: "af" },
          startDateTime: "2026-07-18T12:00:00.000Z"
        },
        ...overrides
      });
    },

    /**
     * Wines poured, nothing written up.
     *
     * The overwhelmingly common documented stop: a member tastes four things and
     * writes about none of them. A card whose sub-line counts notes has to read
     * correctly when that count is zero, and a detail page has to render a tasting
     * list with no prose under it.
     */
    makeUnwritten(overrides: Overrides<ItineraryStopContractShape> = {}): ItineraryStopContractShape {
      return stopStub.make({ id: "stop_4", notes: undefined, ...overrides });
    },

    /**
     * The same estate again, at dinner.
     *
     * Two stops, one place — the case that broke the old shape, where a route
     * returning to where it started could only duplicate a row or lose the evening.
     * The `id` differs and the `place.id` does not, which is exactly what
     * {@link CollectionPreviewItemContract.contentId} keys on and why it keys on the
     * stop.
     */
    makeRevisit(overrides: Overrides<ItineraryStopContractShape> = {}): ItineraryStopContractShape {
      return stopStub.make({
        id: "stop_5",
        wines: undefined,
        notes: undefined,
        ...overrides
      });
    },

    /**
     * A stop in a draft, before a Saturday has been picked.
     *
     * The one state with no `date`, and the reason the field is optional: a member
     * adds Meerlust before deciding which weekend. Every other double here carries
     * the tram's day, so a consumer that assumes a stop is dated passes on all of
     * them and fails on this one — which is the draft, the most common stop there is
     * while a route is being written.
     *
     * A consumer needing a day here falls back to the ITINERARY's `createdAt`. It
     * must not infer one from the stop's position, and it must not render an empty
     * date line.
     */
    makeUndated(overrides: Overrides<ItineraryStopContractShape> = {}): ItineraryStopContractShape {
      return stopStub.make({
        id: "stop_draft-1",
        date: undefined,
        place: {
          id: "estate_meerlust-estate",
          name: "Meerlust Estate",
          regionId: "region_stellenbosch",
          regionName: "Stellenbosch",
          countryCode: "ZA",
          foundedYear: 1693,
          wineCount: 9
        },
        wines: undefined,
        notes: undefined,
        ...overrides
      });
    }
  }
};
