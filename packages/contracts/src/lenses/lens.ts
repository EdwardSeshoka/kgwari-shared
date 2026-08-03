import type { LensKey } from "./lensKey.js";

/**
 * One chip: a word, and how many rows it would leave standing.
 *
 * ## The count is on the wire because the client cannot compute it
 *
 * Not merely should not — CANNOT, for the case that matters. The authorship
 * lenses have to tell the house's lists from a member's, and a byline gives no
 * structural way to do it: Kgwari is `{ name: "Kgwari" }` with no tier, and a
 * member byline with no `status` is the same shape. Bucketing on the literal
 * string "Kgwari" is worse than not bucketing at all.
 *
 * So the server decides which rows fall in which lens, and the count is the
 * visible half of that decision. A client that counted for itself would also be
 * counting only the page it holds, and a chip has to say how many it would show
 * if you tapped it.
 */
export type LensContract = {
  key: LensKey;
  /**
   * How many rows this lens leaves.
   *
   * ABSENT while the corpus is still being counted — which is a real state, not
   * a loading placeholder. The chip WORDS are known before the rows are (they
   * are chrome, rendered from the key), so the row draws immediately and only
   * the counts arrive late. A skeleton where a real word could stand is a lie
   * about latency.
   *
   * Never 0. A lens with nothing in it is not rendered at all — see
   * {@link LensRowContract}.
   */
  count?: number;
};
