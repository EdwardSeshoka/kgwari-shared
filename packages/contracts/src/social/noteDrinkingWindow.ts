import type { YearRange } from "../text/index.js";

/**
 * When the member thinks it should be drunk — their opinion, not the estate's.
 *
 * Deliberately distinct from the estate-private drink window on the record. That
 * one is a producer's statement about their own wine; this is one taster's read
 * on one evening, and the register aggregates many of them into the readiness
 * picture. Collapsing the two would let the crowd overwrite the estate, or the
 * estate silence the crowd.
 */
export type NoteDrinkingWindowContract = {
  window?: YearRange;
  /**
   * Whether the member thinks it is drinking at its peak NOW.
   *
   * Not derivable from `window` containing this year — a member can say "2024 to
   * 2036" and still think it needs another two years. The two answer different
   * questions and the second is the one a reader deciding what to open tonight
   * actually wants.
   */
  atPeak?: boolean;
};
