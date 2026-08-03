import type { TastingMetricKey } from "../vocabulary/index.js";

/**
 * One answer on one 1–5 scale.
 *
 * `value` is a rung, not a score, and the literal union says so — 1 through 5
 * and nothing between, because the picker offers five marks and a 3.5 is an
 * answer nobody gave. The register's own `value` IS a decimal, and that
 * asymmetry is correct: a mean of readings is a different quantity from a
 * reading.
 *
 * Positional against {@link TASTING_SCALES}: rung `n` is `TASTING_SCALES[key][n - 1]`.
 */
export type NoteScaleAnswerContract = {
  key: TastingMetricKey;
  value: 1 | 2 | 3 | 4 | 5;
};
