import type { ContributionCountContract as ContributionCountContractShape } from "../contributionCount.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * The filter chips, and the one number on them that needs a sentence.
 *
 * A member who wrote nine notes on the tram and twelve on their own has written
 * twenty-one notes and will see a chip reading twelve. Both facts are right —
 * publishing the route was one act, so the day is one row — but a bare `12` is
 * indistinguishable from four notes having gone missing.
 *
 * So the note chip carries a second number and a client is expected to SAY
 * something with it rather than print it: "12 · 4 on routes", or twelve with "four
 * more written on itineraries" beneath. `makeChipRow` is the double that puts the
 * whole row together, because the bug is a relationship between chips and cannot be
 * seen one chip at a time.
 */

const noteCountStub = defineStub<ContributionCountContractShape>({
  kind: "note",
  count: 12,
  nestedCount: 4
});

export const ContributionCountContract = {
  StubFactory: {
    ...noteCountStub,

    /**
     * A kind with nothing nested — which is every kind except `note`.
     *
     * `nestedCount` is ABSENT rather than zero, and the difference is a rendered
     * sentence: with nothing nested there is no second clause, and "· 0 on routes" is
     * a sentence about nothing. A client that formats the clause whenever the field is
     * present gets this right; one that formats it whenever the number is falsy does
     * not.
     */
    makeUnnested(
      overrides: Overrides<ContributionCountContractShape> = {}
    ): ContributionCountContractShape {
      return noteCountStub.make({
        kind: "collection",
        count: 2,
        nestedCount: undefined,
        ...overrides
      });
    },

    /**
     * A member who has only ever written on routes.
     *
     * Zero rows and four writings — the state that looks most like a bug and is not
     * one. The chip must not read "0" alone, and the stream behind it is genuinely
     * empty: every note this member wrote is reachable under a route and nowhere else.
     */
    makeAllNested(
      overrides: Overrides<ContributionCountContractShape> = {}
    ): ContributionCountContractShape {
      return noteCountStub.make({ count: 0, nestedCount: 4, ...overrides });
    },

    /**
     * The whole chip row, as a profile receives it.
     *
     * The arithmetic only reads as wrong across chips: `All` counts rows, so it is the
     * sum of the `count`s and NOT of the writings. Four notes are represented by the
     * itinerary row already counted under `collection`, and adding them again is
     * putting the tram back in the ledger.
     */
    makeChipRow(): ContributionCountContractShape[] {
      return [
        noteCountStub.make(),
        noteCountStub.make({ kind: "editorial", count: 3, nestedCount: undefined }),
        noteCountStub.make({ kind: "tasting", count: 2, nestedCount: undefined }),
        noteCountStub.make({ kind: "collection", count: 7, nestedCount: undefined })
      ];
    }
  }
};
