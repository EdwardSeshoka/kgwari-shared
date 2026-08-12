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
      distribution: [2, 6, 18, 41, 33],
      /**
       * The band and its mark, together — they are one object precisely so a
       * fixture cannot hand a consumer quartiles with nothing to mark them with.
       *
       * `median` is 4.1 and `value` is 4.2, and the small gap is the point: this
       * register leans high, so its mean sits above its median. A consumer that
       * marks the band with `value` is drawing a mean over quartiles, and on a
       * skewier metric than this one that mark lands outside its own middle half.
       */
      spread: { middleHalf: [3.7, 4.8], median: 4.1 }
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
        /* One reading has neither a spread nor quartiles to take one from. */
        spread: undefined,
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
        spread: undefined,
        ...overrides
      });
    },

    /**
     * Plenty of readings, a distribution, and still NO spread.
     *
     * The combination that proves the two are independent judgements rather than one
     * switch. Five bars is a shape and can be drawn from a few hundred answers;
     * quartiles are a statistic, and whether there are enough readings to state one
     * is the server's call — made per metric, not per register.
     *
     * A consumer that reaches for `spread.median` whenever `distribution` is present
     * throws here. That is the whole reason this double exists.
     */
    makeUnspread(
      overrides: Overrides<RegisterScaleMetricContractShape> = {}
    ): RegisterScaleMetricContractShape {
      return RegisterScaleMetricContract.StubFactory.make({
        key: "body",
        wordKey: "tasting.medium",
        value: 3.4,
        noteCount: 96,
        scaleWordKeys: ["tasting.light", "", "tasting.medium", "", "tasting.full"],
        distribution: [4, 12, 39, 33, 12],
        spread: undefined,
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
        /**
         * Hard against the floor, and the mark sits BELOW the mean — 1.2 against
         * 1.4. Seven in ten answered the bottom rung, which is what a skewed
         * register does to the two statistics, and it is why the mark travels
         * rather than being inferred from `value`.
         */
        spread: { middleHalf: [1, 1.8], median: 1.2 },
        ...overrides
      });
    }
  }
};
