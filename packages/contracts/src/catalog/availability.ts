/**
 * Availability — the claimant's own block, and the only place commerce appears
 * on a wine record.
 *
 * Two rules shape this module, and both are about keeping Kgwari out of the
 * sale. First, the price belongs to the claimant, not to the page: a community
 * record reads "No price on record" because nobody accountable has quoted one,
 * and an unowned price on a page whose whole argument is provenance is exactly
 * the kind of unattributed fact this model exists to remove. Second, a request
 * goes to the claimant. Kgwari holds no stock and takes no payment, and the
 * contract says so rather than leaving it to a client's footnote.
 *
 * Availability exists only where a claim does — an unclaimed record has nobody
 * to receive the request. That gating is not only principled, it is the concrete
 * reward for claiming.
 *
 * ## Localisation
 *
 * Nothing here is a composed line. "per 750 ml · cellar door" is a formatted
 * measurement, a separator and a translated noun; "usually within two days" is a
 * duration with an English plural rule baked in. Both are sent as data so the
 * client renders one full-sentence key per case.
 */

import type { TrustTier } from "../trust/index.js";
import type { MoneyContract } from "../money/index.js";
import type { CanonicalText, Measurement } from "../text/index.js";

/** Where the claimant sells from. A closed set, rendered as chrome. */
export type SalesChannelContract =
  | "cellar_door"
  | "warehouse"
  | "allocation_list"
  | "trade_only";

/**
 * How the claimant answers requests, shown under the action — "Replied to 9 of
 * 11 requests · usually within two days."
 *
 * This is the accountability the rest of the record insists on, applied to
 * commerce: a claimant who does not answer should look like one. Absent until
 * there are enough requests for the ratio to mean anything.
 *
 * `typicalResponseHours` is a duration, not a phrase — the client turns it into
 * "two days", "twee dae" or "deux jours" with its own plural rules, and decides
 * for itself whether hours or days is the natural unit at that magnitude.
 */
export type ClaimantResponseRecordContract = {
  requestsReceived: number;
  requestsAnswered: number;
  typicalResponseHours?: number;
};

/**
 * What one unit of the offer is — a 750 ml bottle at the cellar door, a
 * six-bottle case from a warehouse.
 *
 * `minimumBottles` is the claimant's own rule and is theirs to enforce; it is
 * carried so the block can state it, not so the client can block a request.
 */
export type OfferUnitContract = {
  /** Bottle volume, e.g. 750 ml. A measurement — never the string "750 ml". */
  volume: Measurement;
  channel?: SalesChannelContract;
  minimumBottles?: number;
};

/**
 * The claimant's block: who they are, what they charge, and how to ask.
 *
 * Rendered as an enclosed block rather than a fourth button in Kgwari's action
 * stack. It is prominent because it is enclosed, never because it is the loudest
 * thing on the page — a record that out-shouts itself with a buy button has
 * stopped being a record.
 */
export type ClaimantAvailabilityContract = {
  /**
   * The estate or the distributor, never truncated.
   *
   * `CanonicalText` rather than a bare string, matching every other proper noun
   * on the wire — a claimant's name is the same word in every locale, and the
   * carrier is what says so. It was the one place in this module that declared a
   * proper noun without saying it was one.
   */
  claimantName: CanonicalText;
  /**
   * The claimant's tier. The role line ("Producer · claimed this record") is
   * composed by the client from this, not sent as a sentence.
   */
  claimantTier: Extract<TrustTier, "producer" | "distributor">;

  price?: MoneyContract;
  unit?: OfferUnitContract;

  /**
   * True when the bottle is allocated rather than simply sold — the action reads
   * "Request an allocation", which is a different and more accurate promise.
   */
  isAllocation?: boolean;
  /** False when the claimant has paused requests; the block still renders. */
  acceptsRequests: boolean;
  responseRecord?: ClaimantResponseRecordContract;
};

/**
 * Ask the claimant for the bottle. The request is relayed; no order is created,
 * no payment is taken and no stock is held.
 */
export type RequestAvailabilityRequest = {
  wineVintageId: string;
  /** Bottles wanted. The claimant's minimum is theirs to enforce, not ours. */
  quantity?: number;
  /** The member's own words to the claimant. */
  message?: string;
};

export type RequestAvailabilityResponse = {
  requestId: string;
  /** UTC ISO 8601. Formatted at the presentation edge. */
  submittedAt: string;
  /** Echoed so the client can show who it actually went to. */
  sentTo: string;
};
