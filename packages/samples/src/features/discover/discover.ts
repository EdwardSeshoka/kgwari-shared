import type { DiscoverContract } from "@edwardseshoka/contracts/discover";

import rawResponse from "./discover-response.json" with { type: "json" };

/**
 * The discover home response — the Masthead v2 page, as the design settled it.
 *
 * A member's note leads, chosen by save count rather than by an editor, so the
 * front page opens in the room's voice. Below it: the Latest ledger interleaving
 * notes, writing and attendance in one chronological run; the wines worth
 * opening; what estates are publishing; what is pouring nearby; the member's own
 * bottles the room is drinking tonight; and the evening's standing record.
 *
 * ## What changed, and what it now expects of the backend
 *
 * This used to be a frozen snapshot of the v1 composition — a wine hero and five
 * sections — and a faithful copy of what the backend actually produced. It is
 * now the v2 design, so the fixture LEADS the backend rather than trailing it:
 * `composeDiscover` has to produce the note hero and the three new sections, and
 * the contract test asserting the two match is what keeps that honest rather
 * than aspirational.
 *
 * Composition still lives in the backend, not here. The double replays this
 * verbatim so the same production mapper runs.
 */
export function createDiscover(): DiscoverContract {
  return rawResponse as unknown as DiscoverContract;
}
