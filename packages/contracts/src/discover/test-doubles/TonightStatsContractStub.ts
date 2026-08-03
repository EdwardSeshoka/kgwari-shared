import type { TonightStatsContract as TonightStatsContractShape } from "../tonightStats.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { CellarTonightRowContract } from "./CellarTonightRowContractStub.js";

/**
 * The room's standing record for one evening.
 *
 * `makeQuiet()` is the state that matters. A slow Tuesday is a real evening, and
 * a "most opened" wine with one opening behind it is a claim the data does not
 * support — so `mostOpened` is absent rather than degenerate, and a consumer
 * that assumes it exists renders an empty superlative on exactly the night
 * there is nothing to say.
 */
export const TonightStatsContract = {
  StubFactory: {
    ...defineStub<TonightStatsContractShape>({
      window: { from: "2026-06-23T16:00:00.000Z", to: "2026-06-24T00:00:00.000Z" },
      bottlesOpened: 148,
      notesWritten: 92,
      notesByProfessionals: 31,
      mostOpened: CellarTonightRowContract.StubFactory.make({ activityCount: 11 })
    }),

    /** A quiet evening — counts, and nothing worth calling most-opened. */
    makeQuiet(
      overrides: Overrides<TonightStatsContractShape> = {}
    ): TonightStatsContractShape {
      return TonightStatsContract.StubFactory.make({
        bottlesOpened: 4,
        notesWritten: 2,
        notesByProfessionals: 0,
        mostOpened: undefined,
        ...overrides
      });
    }
  }
};
