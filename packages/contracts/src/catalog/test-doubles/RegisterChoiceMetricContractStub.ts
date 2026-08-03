import type { RegisterChoiceMetricContract as RegisterChoiceMetricContractShape } from "../register.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A metric answered by PICKING one named option rather than a rung — colour,
 * development, readiness. No mean exists for these; the answer is the split.
 *
 * ## A double for a shape nothing sends yet
 *
 * Nothing in the system has produced a choice metric — which is exactly why the
 * contract leaves `key` an open string rather than closing a set on zero
 * instances, and exactly why this double is worth having. A consumer switching
 * on `shape` has two branches and only one of them has ever been exercised, so
 * the `"choice"` branch is untested code in every reader at once until somebody
 * can build one.
 *
 * The readiness metric the register's conclusion group is designed for is the
 * likely first real instance, so that is what this models. Treat the keys as
 * illustrative: they will be closed the day the first choice metric ships, and
 * a stub is the cheapest place to discover a consumer that assumed they already
 * were.
 */
export const RegisterChoiceMetricContract = {
  StubFactory: {
    ...defineStub<RegisterChoiceMetricContractShape>({
      shape: "choice",
      key: "readiness",
      wordKey: "tasting.medium",
      noteCount: 812,
      choices: [
        { key: "readiness.needsTime", percentage: 24 },
        { key: "readiness.drinkingWell", percentage: 61 },
        { key: "readiness.pastItsBest", percentage: 15 }
      ]
    }),

    /**
     * A split with no majority.
     *
     * The interesting case for a client that renders "most members say X": at 34
     * / 33 / 33 there is no most, and a reader that picks the first entry reports
     * a consensus the numbers do not support.
     */
    makeEvenlySplit(
      overrides: Overrides<RegisterChoiceMetricContractShape> = {}
    ): RegisterChoiceMetricContractShape {
      return RegisterChoiceMetricContract.StubFactory.make({
        choices: [
          { key: "readiness.needsTime", percentage: 34 },
          { key: "readiness.drinkingWell", percentage: 33 },
          { key: "readiness.pastItsBest", percentage: 33 }
        ],
        ...overrides
      });
    }
  }
};
