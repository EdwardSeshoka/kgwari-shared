import type { RegisterScaleMetricContract as RegisterScaleMetricContractShape } from "../register.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A metric answered on an ordinal scale — tannin, body, finish.
 *
 * ## The state this double exists for
 *
 * `makeSingleReading()`. When there is exactly one answer, `distribution` is
 * ABSENT and `singleReadingBy` names whose reading it is. One reading is a
 * reading, not a consensus, and drawing a spread behind it would claim an
 * agreement that does not exist — so a client renders the single mark and says
 * who took it.
 *
 * The threshold that decides is SERVER POLICY and never on the wire. It shows up
 * here as an absent field, which is the only form a client should ever see it
 * in: a client holding the number is a client that must ship to change editorial
 * judgement.
 *
 * `value` is a mean on the 1–5 scale, sent as a NUMBER so it is never rendered
 * with the wrong decimal separator — and never rendered as a score.
 */
export const RegisterScaleMetricContract = {
  StubFactory: {
    ...defineStub<RegisterScaleMetricContractShape>({
      shape: "scale",
      key: "tannin",
      wordKey: "tasting.high",
      value: 4.2,
      noteCount: 1180,
      scaleWordKeys: ["tasting.low", "", "tasting.medium", "", "tasting.high"],
      distribution: [2, 6, 18, 41, 33]
    }),

    /**
     * One person has answered this metric. No spread, and their name instead.
     *
     * A consumer that renders a distribution whenever `noteCount > 0` draws a
     * bar chart of a single opinion.
     */
    makeSingleReading(
      overrides: Overrides<RegisterScaleMetricContractShape> = {}
    ): RegisterScaleMetricContractShape {
      return RegisterScaleMetricContract.StubFactory.make({
        key: "finish",
        wordKey: "tasting.long",
        value: 5,
        noteCount: 1,
        scaleWordKeys: ["tasting.short", "", "tasting.medium", "", "tasting.long"],
        distribution: undefined,
        singleReadingBy: "Alexandra Meyer",
        ...overrides
      });
    },

    /**
     * Answered by a handful — enough for a mean, not enough for a spread.
     *
     * The middle state, and the one that proves the threshold is not "more than
     * one": there are eleven readings here and still no distribution, because how
     * many is enough is the server's judgement and not a count the client checks.
     */
    makeThinlyAnswered(
      overrides: Overrides<RegisterScaleMetricContractShape> = {}
    ): RegisterScaleMetricContractShape {
      return RegisterScaleMetricContract.StubFactory.make({
        key: "acidity",
        wordKey: "tasting.medium",
        value: 3.1,
        noteCount: 11,
        scaleWordKeys: ["tasting.low", "", "tasting.medium", "", "tasting.high"],
        distribution: undefined,
        ...overrides
      });
    },

    /**
     * A metric added in 7.0, so the capture screen's newest axis has a double.
     *
     * Sweetness was missing from `TASTING_SCALES` entirely — a member answering
     * "off-dry" had nowhere to put it, and a Chenin's whole argument is on this
     * scale.
     */
    makeSweetness(
      overrides: Overrides<RegisterScaleMetricContractShape> = {}
    ): RegisterScaleMetricContractShape {
      return RegisterScaleMetricContract.StubFactory.make({
        key: "sweetness",
        wordKey: "tasting.boneDry",
        value: 1.4,
        noteCount: 640,
        scaleWordKeys: ["tasting.boneDry", "", "tasting.offDry", "", "tasting.luscious"],
        distribution: [71, 19, 6, 3, 1],
        ...overrides
      });
    }
  }
};
