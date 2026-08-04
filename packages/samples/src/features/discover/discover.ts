import type { DiscoverContract } from "@edwardseshoka/contracts/discover";

import { offsetTo, shiftInstants, systemClock } from "../../freshness/Freshness.js";

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
 *
 * ## Why it is dated on the way out
 *
 * A recorded response records its clock too. This one carries a `tonight_stats`
 * window of 2 August, so a double replaying it showed a standing column the
 * server could not reproduce on any other day — the double and the backend
 * disagreeing not about shape but about WHEN, which is the hardest kind of
 * disagreement to notice because both look right on their own.
 *
 * The whole response is therefore slid onto the current evening, anchored on its
 * OWN window rather than on any single row. Anchoring there is what keeps it
 * coherent: the window, the notes counted inside it, the ledger's timestamps and
 * the hero's "9 days ago" all move together, so the page still adds up.
 */
const TONIGHT_STATS = "tonight_stats";

/** The recorded evening this fixture was composed for. */
function recordedWindowStart(): string | undefined {
  const sections = (rawResponse as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) return undefined;

  for (const section of sections) {
    const candidate = section as { type?: unknown; stats?: { window?: { from?: unknown } } };
    if (candidate.type === TONIGHT_STATS && typeof candidate.stats?.window?.from === "string") {
      return candidate.stats.window.from;
    }
  }
  return undefined;
}

// Anchored on the window's OPENING (16:00), not on a row: the response is
// offset by the difference between the evening it recorded and the one being
// looked at, which leaves every instant in the same relative place.
const dated = shiftInstants(
  rawResponse,
  offsetTo(recordedWindowStart(), { hour: 16, minute: 0 }, systemClock())
);

export function createDiscover(): DiscoverContract {
  return dated as unknown as DiscoverContract;
}
