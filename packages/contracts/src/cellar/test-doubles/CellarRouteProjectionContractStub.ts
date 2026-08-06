import type {
  CellarFirstMetContract as CellarFirstMetContractShape,
  CellarRouteProjectionContract as CellarRouteProjectionContractShape
} from "../routeProjection.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { WineContract } from "../../catalog/test-doubles/index.js";

/**
 * What a member has met on routes and does not hold.
 *
 * ## The one thing every consumer of this must get right
 *
 * `wineCount` is **7** and the cellar beside it holds bottles. A client that adds
 * the two has invented four wines the member does not own, on the one screen whose
 * job is to say what they do. Every double here keeps the two numbers apart, and
 * no shape in this file carries a `bottles` field to be summed in the first place.
 *
 * The base spans TWO routes, because grouping is the shape's whole proposition: a
 * flat list of wines met would answer "what have I tasted" and the question a
 * member actually asks is "where did I have that". A single-group fixture never
 * renders a second heading.
 */

const projectionStub = defineStub<CellarRouteProjectionContractShape>({
  wineCount: 7,
  groups: [
    {
      itineraryId: "collection_the-franschhoek-tram-in-one-day",
      itineraryTitle: "The Franschhoek tram, in one day",
      date: "2026-07-18",
      items: [
        {
          wine: WineContract.StubFactory.make({
            id: "moreson-premium-chardonnay-2021",
            name: "Premium Chardonnay",
            estate: "Môreson",
            producerId: "estate_moreson",
            vintage: 2021,
            region: "Franschhoek"
          }),
          stopId: "stop_4",
          stopOrdinal: 4,
          placeName: { source: "canonical", text: "Môreson" },
          verdict: "Essential"
        },
        {
          wine: WineContract.StubFactory.make({
            id: "grande-provence-chardonnay-2022",
            name: "Grande Provence Chardonnay",
            estate: "Grande Provence",
            producerId: "estate_grande-provence",
            vintage: 2022,
            region: "Franschhoek"
          }),
          stopId: "stop_1",
          stopOrdinal: 1,
          placeName: { source: "canonical", text: "Grande Provence" },
          verdict: "Worth Revisiting"
        },
        /**
         * No verdict. The common case — most wines met on a route are never written
         * up, and a row without one is complete rather than unfinished.
         */
        {
          wine: WineContract.StubFactory.make({
            id: "grande-provence-red-2019",
            name: "The Grande Provence Red",
            estate: "Grande Provence",
            producerId: "estate_grande-provence",
            vintage: 2019,
            region: "Franschhoek"
          }),
          stopId: "stop_5",
          stopOrdinal: 5,
          placeName: { source: "canonical", text: "Grande Provence" }
        }
      ]
    },
    {
      itineraryId: "collection_elgin-slowly",
      itineraryTitle: "Elgin, slowly",
      date: "2026-07-02",
      items: [
        {
          wine: WineContract.StubFactory.make({
            id: "paul-cluver-seven-flags-pinot-noir-2020",
            name: "Seven Flags Pinot Noir",
            estate: "Paul Cluver",
            producerId: "estate_paul-cluver",
            vintage: 2020,
            region: "Elgin"
          }),
          stopId: "stop_elgin-2",
          stopOrdinal: 2,
          placeName: { source: "canonical", text: "Paul Cluver" },
          verdict: "Essential"
        }
      ]
    }
  ]
});

export const CellarRouteProjectionContract = {
  StubFactory: {
    ...projectionStub,

    /**
     * A group whose ordinals skip.
     *
     * Stops 1, 4 and 5 poured; 2 was the tram and 3 was lunch. So `stopOrdinal` runs
     * 1, 4, 5 with no rows between — which is why the ordinal is sent rather than
     * counted from the array. A consumer that numbers these rows itself labels the
     * Môreson wine "stop 2" and sends a member to the wrong estate.
     *
     * This is the base's first group, isolated so the gap is the only thing under
     * test.
     */
    makeWithSkippedStops(
      overrides: Overrides<CellarRouteProjectionContractShape> = {}
    ): CellarRouteProjectionContractShape {
      const [tram] = projectionStub.make().groups;
      return projectionStub.make({ wineCount: 3, groups: [tram!], ...overrides });
    },

    /**
     * A wine met whose catalogue entry has since gone.
     *
     * `wine: null` and the row still stands: withdrawing a wine from the catalogue
     * does not unhappen the afternoon somebody drank it. The row renders from
     * `placeName` and the stop it came from, exactly as a delisted HOLDING renders
     * from what the member typed.
     */
    makeDelisted(
      overrides: Overrides<CellarRouteProjectionContractShape> = {}
    ): CellarRouteProjectionContractShape {
      return projectionStub.make({
        wineCount: 1,
        groups: [
          {
            itineraryId: "collection_the-franschhoek-tram-in-one-day",
            itineraryTitle: "The Franschhoek tram, in one day",
            date: "2026-07-18",
            items: [
              {
                wine: null,
                stopId: "stop_1",
                stopOrdinal: 1,
                placeName: { source: "canonical", text: "Grande Provence" },
                verdict: "Worth Revisiting"
              }
            ]
          }
        ],
        ...overrides
      });
    },

    /**
     * A route with no dates on its stops.
     *
     * `date` absent on the group, which happens when every stop is undated — a draft.
     * A draft has poured nothing, so this group should be empty and in practice will
     * not be sent at all; the double exists so a consumer that formats the group
     * heading's date unconditionally fails here rather than in front of a member.
     */
    makeUndatedRoute(
      overrides: Overrides<CellarRouteProjectionContractShape> = {}
    ): CellarRouteProjectionContractShape {
      return projectionStub.make({
        wineCount: 1,
        groups: [
          {
            itineraryId: "collection_two-days-in-stellenbosch",
            itineraryTitle: "Two days in Stellenbosch",
            items: [
              {
                wine: WineContract.StubFactory.make(),
                stopId: "stop_draft-1",
                stopOrdinal: 1,
                placeName: { source: "canonical", text: "Meerlust Estate" }
              }
            ]
          }
        ],
        ...overrides
      });
    }
  }
};

/**
 * Where a bottle in the cellar was first met.
 *
 * Dated, because the date is the point: ranked by the stop's day this is the
 * earlier afternoon, and ranked by anything else it is whichever route was written
 * up first. A double with no date could not tell a consumer which rule it had
 * implemented.
 */
export const CellarFirstMetContract = {
  StubFactory: {
    ...defineStub<CellarFirstMetContractShape>({
      itineraryId: "collection_the-franschhoek-tram-in-one-day",
      itineraryTitle: "The Franschhoek tram, in one day",
      stopId: "stop_1",
      stopOrdinal: 1,
      date: "2026-07-18"
    }),

    /**
     * The same bottle, met again on a later route.
     *
     * The second meeting, and it must NOT win. Kept as a double so a test can assert
     * that a wine met twice credits the earlier day rather than the more recently
     * published route — the failure the stop's date exists to prevent.
     */
    makeLaterMeeting(
      overrides: Overrides<CellarFirstMetContractShape> = {}
    ): CellarFirstMetContractShape {
      return CellarFirstMetContract.StubFactory.make({
        itineraryId: "collection_a-weekend-in-the-swartland",
        itineraryTitle: "A weekend in the Swartland",
        stopId: "stop_swartland-3",
        stopOrdinal: 3,
        date: "2026-08-22",
        ...overrides
      });
    }
  }
};
