import type { LensRowContract as LensRowContractShape } from "../lensRow.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A row of chips.
 *
 * The three factories are the three states the mechanism owes, and two of them
 * are about NOT drawing something:
 *
 *  - `make()` — the ordinary case, four authorship lenses with counts.
 *  - `makeCounting()` — words known, counts not yet. The row renders in full and
 *    only the numbers are missing, because the chip words are chrome and do not
 *    wait on a corpus.
 *  - `makeSuppressed()` — a day when only one kind has published. The row is
 *    EMPTY, not a lone "All", and a consumer that renders `lenses.length === 1`
 *    ships a control that narrows nothing.
 */
export const LensRowContract = {
  StubFactory: {
    ...defineStub<LensRowContractShape>({
      lenses: [
        { key: "lens.all", count: 8 },
        { key: "lens.sommeliers", count: 3 },
        { key: "lens.members", count: 2 },
        { key: "lens.kgwari", count: 3 }
      ],
      active: "lens.all"
    }),

    /** Narrowed to one lens — the heading and its count follow `active`. */
    makeNarrowed(overrides: Overrides<LensRowContractShape> = {}): LensRowContractShape {
      return LensRowContract.StubFactory.make({ active: "lens.sommeliers", ...overrides });
    },

    /**
     * The corpus is still being counted.
     *
     * Every chip has its word and none has its number. A consumer that waits for
     * `count` before drawing the row has turned a fast, honest render into a
     * skeleton.
     */
    makeCounting(overrides: Overrides<LensRowContractShape> = {}): LensRowContractShape {
      return LensRowContract.StubFactory.make({
        lenses: [
          { key: "lens.all" },
          { key: "lens.sommeliers" },
          { key: "lens.members" },
          { key: "lens.kgwari" }
        ],
        ...overrides
      });
    },

    /**
     * Nothing to narrow — the row is not drawn.
     *
     * Sent empty rather than as a single "All", so the suppression rule lives on
     * the server instead of in every client that renders a chip.
     */
    makeSuppressed(overrides: Overrides<LensRowContractShape> = {}): LensRowContractShape {
      return LensRowContract.StubFactory.make({ lenses: [], ...overrides });
    },

    /** The calendar's set — where an attribute lens sits among time lenses. */
    makeCalendar(overrides: Overrides<LensRowContractShape> = {}): LensRowContractShape {
      return LensRowContract.StubFactory.make({
        lenses: [
          { key: "lens.all", count: 59 },
          { key: "lens.thisMonth", count: 3 },
          { key: "lens.later", count: 56 },
          { key: "lens.seatsLeft", count: 41 }
        ],
        ...overrides
      });
    },

    /** The archive's set — two voices at very different volumes. */
    makeArchive(overrides: Overrides<LensRowContractShape> = {}): LensRowContractShape {
      return LensRowContract.StubFactory.make({
        lenses: [
          { key: "lens.all", count: 9 },
          { key: "lens.estates", count: 4 },
          { key: "lens.members", count: 5 }
        ],
        ...overrides
      });
    }
  }
};
