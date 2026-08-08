import type {
  CellarDoorContract as CellarDoorContractShape,
  CellarSectionContract as CellarSectionContractShape,
  CellarSummaryContract as CellarSummaryContractShape,
  GetCellarIndexResponse as GetCellarIndexResponseShape
} from "../cellarIndex.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { CollectionContract } from "../../collections/test-doubles/index.js";

/**
 * A member's cellar home, in the states the design makes claims about.
 *
 * ## Why the base is a DEEP cellar
 *
 * Because every suppression in this contract is an absence, and an absence only
 * proves anything against a fixture that could have carried the thing. A launch
 * cellar as the default would make `figuresAvailable: false` and a missing
 * `priceBand` look like the normal case, and a client that never draws a figure
 * line would pass every test in the suite.
 *
 * ## The two numbers that must never be added
 *
 * `summary.bottles` is **34** and the `metOnRoutes` door counts **7**. They are
 * different units — bottles held against wines met — and 41 is not a fact about
 * anything. Every double below keeps them distinguishable rather than tidy, which
 * is the one thing a consumer of this contract gets wrong first. See
 * {@link CellarRouteProjectionContract}, which carries the argument.
 *
 * ## Composed from the published collection doubles
 *
 * The rows are `CollectionContract.StubFactory` output rather than literals
 * restating a card's shape. A stub that restated one would be a second opinion
 * about `CollectionContract` living inside `cellar`, and it would go stale the
 * first time a card gained a field.
 */

const shelves = [
  CollectionContract.StubFactory.make(),
  CollectionContract.StubFactory.makeUndescribed()
];

const lenses = [
  CollectionContract.StubFactory.makeLens(),
  CollectionContract.StubFactory.makeLensOverPlace()
];

const following = [CollectionContract.StubFactory.makeSelection()];

const routes = [
  CollectionContract.StubFactory.makeItinerary(),
  CollectionContract.StubFactory.makePlannedItinerary()
];

const deepSummary: CellarSummaryContractShape = {
  bottles: 34,
  /**
   * FEWER than `bottles` and MORE than a naive distinct-count of what is drinkable:
   * 34 bottles across 28 wines, two of which are drunk-and-kept. A fixture where
   * wines equalled bottles would let a consumer that conflated the two pass.
   */
  wines: 28,
  estates: 19,
  readyThisYear: 12,
  keepingSince: "2021-03-14T00:00:00.000Z",
  priceBand: {
    low: { amountMinorUnits: 24_500, currency: "ZAR" },
    high: { amountMinorUnits: 89_500, currency: "ZAR" }
  },
  figuresAvailable: true
};

const deepSections: CellarSectionContractShape[] = [
  /**
   * `count` is 15 while `items` holds 2 — the head describes the SECTION and the
   * array is a page of it. A consumer that renders `items.length` under the
   * standfirst reports its own page size, which is the single most likely
   * misreading of this contract and the reason the numbers here disagree on
   * purpose.
   */
  { kind: "shelves", items: shelves, count: 15, nextCursor: "c2hlbHZlczoy" },
  { kind: "lenses", items: lenses, count: 2 },
  { kind: "following", items: following, count: 1 },
  { kind: "routes", items: routes, count: 2 }
];

const deepDoors: CellarDoorContractShape[] = [
  /**
   * The Ready-this-year door, carrying the LENS's own title and rule.
   *
   * Both are copied from `makeLens` above rather than retyped, which is the whole
   * point of denormalising them: the door and the lens are one record read twice,
   * and a fixture that typed the strings again could disagree with itself the way
   * the wire must not.
   */
  {
    target: { kind: "collection", collectionId: "collection_ready-this-year" },
    title: "Ready this year",
    rule: CollectionContract.StubFactory.makeLens().rule,
    count: 12
  },
  /** Wines, not bottles. Never to be summed with `summary.bottles` above. */
  { target: { kind: "metOnRoutes" }, count: 7 },
  /** A door with a count and nowhere to go, until a request ledger exists. */
  { target: { kind: "requests" }, count: 3 }
];

const indexStub = defineStub<GetCellarIndexResponseShape>({
  summary: deepSummary,
  sections: deepSections,
  doors: deepDoors
});

export const GetCellarIndexResponse = {
  StubFactory: {
    ...indexStub,

    /**
     * A cellar under the threshold — the state the whole `figuresAvailable` field
     * exists for.
     *
     * Six bottles. `figuresAvailable: false` and **no `priceBand`**, because the
     * band is the one field that follows the flag absolutely. The counts are still
     * sent, because the page's opening sentence still needs them; what is suppressed
     * is the figure line.
     *
     * The claim this double exists to check is that the page reads as a DECISION
     * rather than an empty state — a member with six bottles is starting a cellar,
     * not failing to have one — and the only way to check it is to be sent this.
     *
     * `keepingSince` is removed too, and not because the threshold governs it: six
     * bottles bought last month have no year to be deep since, and a fixture that
     * kept a 2021 date under a launch masthead would be describing a cellar nobody
     * has.
     */
    makeLaunch(overrides: Overrides<GetCellarIndexResponseShape> = {}): GetCellarIndexResponseShape {
      return indexStub.make({
        summary: {
          bottles: 6,
          wines: 6,
          estates: 5,
          readyThisYear: 1,
          keepingSince: undefined,
          priceBand: undefined,
          figuresAvailable: false
        },
        sections: [{ kind: "shelves", items: [CollectionContract.StubFactory.makeUndescribed()], count: 1 }],
        doors: [],
        ...overrides
      });
    },

    /**
     * A cellar with nothing in it at all.
     *
     * No sections rather than four empty ones, and no doors rather than doors
     * reading zero. A heading over no rows asks a reader what they have lost and the
     * answer is nothing — they have not made a shelf yet. This is the one response
     * where the masthead carries the whole page.
     *
     * `figuresAvailable: false`, necessarily: there is nothing for a figure line to
     * be about.
     */
    makeEmpty(overrides: Overrides<GetCellarIndexResponseShape> = {}): GetCellarIndexResponseShape {
      return indexStub.make({
        summary: {
          bottles: 0,
          wines: 0,
          estates: 0,
          readyThisYear: 0,
          keepingSince: undefined,
          priceBand: undefined,
          figuresAvailable: false
        },
        sections: [],
        doors: [],
        ...overrides
      });
    },

    /**
     * A member who has never been on a route.
     *
     * No `routes` section and no `metOnRoutes` door — the section is omitted rather
     * than sent empty, and the door goes with it because a door is a figure that
     * names a set and there is no set. Most cellars look like this, which is exactly
     * why the base does not: a consumer that only ever saw this fixture would never
     * have rendered the two rows that carry a route's tense.
     */
    makeWithoutRoutes(overrides: Overrides<GetCellarIndexResponseShape> = {}): GetCellarIndexResponseShape {
      return indexStub.make({
        sections: deepSections.filter((section) => section.kind !== "routes"),
        doors: deepDoors.filter((door) => door.target.kind !== "metOnRoutes"),
        ...overrides
      });
    },

    /**
     * Fifteen shelves, and the page still has to breathe.
     *
     * A section whose `count` and `items` agree, with no cursor — the last page of a
     * long run. The design's claim is that air still separates sections at depth
     * with the running head carrying the group, and that objection is what the whole
     * standfirst direction had to answer, so it is a fixture rather than something
     * to imagine.
     */
    makeSprawling(overrides: Overrides<GetCellarIndexResponseShape> = {}): GetCellarIndexResponseShape {
      const many = Array.from({ length: 15 }, (_unused, index) =>
        CollectionContract.StubFactory.make({
          id: `collection_shelf-${index + 1}`,
          title: `Shelf ${index + 1}`
        })
      );
      return indexStub.make({
        sections: [
          { kind: "shelves", items: many, count: many.length },
          ...deepSections.filter((section) => section.kind !== "shelves")
        ],
        ...overrides
      });
    }
  }
};

/**
 * The masthead on its own, for a consumer rendering only the figure line.
 *
 * Separate from the index factory because the suppression rule is the summary's and
 * a test about it should not have to build four sections to reach it.
 */
export const CellarSummaryContract = {
  StubFactory: {
    ...defineStub<CellarSummaryContractShape>(deepSummary),

    /**
     * Priced in two currencies, so there is no single band.
     *
     * `priceBand` absent while `figuresAvailable` stays TRUE — the one combination
     * that proves the two are not the same switch. A cellar bought across two
     * markets has plenty of bottles and no honest middle, because nothing is ever
     * converted; a consumer that reads a missing band as "suppressed" tells this
     * member their cellar is too small.
     */
    makeUnbanded(overrides: Overrides<CellarSummaryContractShape> = {}): CellarSummaryContractShape {
      return CellarSummaryContract.StubFactory.make({
        priceBand: undefined,
        figuresAvailable: true,
        ...overrides
      });
    },

    /**
     * A cellar nobody has dated.
     *
     * `keepingSince` removed while everything else stands, because
     * {@link CellarEntryContract.acquiredAt} is itself optional and a member who
     * never dates a bottle still has a masthead. A consumer that formats this
     * unconditionally throws here rather than in front of a member.
     */
    makeUndated(overrides: Overrides<CellarSummaryContractShape> = {}): CellarSummaryContractShape {
      return CellarSummaryContract.StubFactory.make({ keepingSince: undefined, ...overrides });
    }
  }
};
