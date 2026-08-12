import type { ResolveLensResponse as ResolveLensResponseShape } from "../resolveLens.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { CollectionContract } from "../../collections/test-doubles/index.js";
import { WineContract } from "../../catalog/test-doubles/index.js";
import { ProducerContract } from "../../provenance/test-doubles/index.js";

/**
 * One of a member's own lenses, opened.
 *
 * ## Why the base page is SHORT of its count
 *
 * `count` is 31 and `items` holds three. Deliberately, and it is the single
 * most important thing this double asserts: a lens's count is the whole match
 * set, never the page, and a consumer that renders `items.length` next to the
 * title will disagree with the number the cellar home showed one click earlier.
 * A fixture whose page happened to equal its count would let that consumer pass
 * — and the bug it hides only appears once a member's cellar outgrows one page,
 * which is exactly when nobody is testing.
 *
 * `nextCursor` is present for the same reason. A double with no second page is
 * a double that never exercises paging.
 */
const resolvedStub = defineStub<ResolveLensResponseShape>({
  lens: CollectionContract.StubFactory.makeLens(),
  items: [
    { subject: "wines", wine: WineContract.StubFactory.make() },
    {
      subject: "wines",
      wine: WineContract.StubFactory.make({
        id: "kanonkop-pinotage-2019",
        name: "Pinotage",
        estate: "Kanonkop Estate",
        producerId: "estate_kanonkop",
        vintage: 2019
      })
    },
    {
      subject: "wines",
      wine: WineContract.StubFactory.make({
        id: "sadie-palladius-2021",
        name: "Palladius",
        estate: "Sadie Family Wines",
        producerId: "estate_sadie-family-wines",
        vintage: 2021
      })
    }
  ],
  count: 31,
  nextCursor: "cursor_lens-all-wines-2"
});

export const ResolveLensResponse = {
  StubFactory: {
    ...resolvedStub,

    /**
     * A lens over PRODUCERS — "estates you follow".
     *
     * The other subject a lens is written over, and the one
     * {@link ../../collections!CollectionItemContract}'s estate arm exists for.
     * Kept as a double because a consumer that switch-cases on `subject` and
     * handles only `wines` renders an empty page here rather than throwing, and
     * an empty page is indistinguishable from a lens that matched nothing.
     */
    makeOverEstates(
      overrides: Overrides<ResolveLensResponseShape> = {}
    ): ResolveLensResponseShape {
      return resolvedStub.make({
        lens: CollectionContract.StubFactory.makeLens({
          id: "collection_estates-you-follow",
          title: "Estates you follow",
          subject: "estates"
        }),
        items: [
          { subject: "estates", producer: ProducerContract.StubFactory.make() },
          {
            subject: "estates",
            producer: ProducerContract.StubFactory.make({
              id: "estate_sadie-family-wines",
              name: "Sadie Family Wines"
            })
          }
        ],
        count: 4,
        nextCursor: undefined,
        ...overrides
      });
    },

    /**
     * A rule that currently matches nothing.
     *
     * NOT the same as a lens that does not exist, and the difference is the
     * whole reason `lens` is sent separately from `items`. "Ready this year"
     * with an empty cellar is a real lens with a real rule and no matches —
     * the page still has a title, still has a rule to state, and reads
     * "nothing yet". A consumer that treats zero items as absence shows a
     * not-found page for a lens the member can see on her own home.
     */
    makeMatchingNothing(
      overrides: Overrides<ResolveLensResponseShape> = {}
    ): ResolveLensResponseShape {
      return resolvedStub.make({
        lens: CollectionContract.StubFactory.makeLens({
          id: "collection_ready-this-year",
          title: "Ready this year"
        }),
        items: [],
        count: 0,
        nextCursor: undefined,
        ...overrides
      });
    },

    /**
     * No such lens — or one belonging to somebody else.
     *
     * Deliberately the same double for both, because the contract makes them
     * the same answer: an id nobody can tell apart is an id nobody can probe
     * with. A consumer must not try to distinguish them.
     */
    makeAbsent(
      overrides: Overrides<ResolveLensResponseShape> = {}
    ): ResolveLensResponseShape {
      return resolvedStub.make({
        lens: null,
        items: [],
        count: 0,
        nextCursor: undefined,
        ...overrides
      });
    }
  }
};
