import type { RecordFieldKey } from "../vocabulary/index.js";

/**
 * Confirming and disputing a matched fact — the member's whole job on the
 * factual layer of a record.
 *
 * The record is matched at ingest, not crowdsourced, so members are never asked
 * to fill a fact in. They are asked whether the fact is right. Reference data is
 * wrong sometimes and that is true from the first second a record exists, which
 * is why this is available in every state and not only once an estate has
 * claimed and put its own voice on the page. A trust model that only runs one
 * direction is not a trust model.
 *
 * Two verbs, deliberately distinct:
 *
 *  - CONFIRM is a signal, not an edit. It is idempotent and revocable, stored
 *    per member so the same person cannot affirm a row twice, and it accrues
 *    toward a row reading as settled.
 *  - DISPUTE opens a case. It carries a reason and, where the member has one, a
 *    proposed value. It never silently overwrites: the existing value stays on
 *    screen while the dispute is open, because hiding a fact under review is
 *    worse than showing one that is being argued about.
 *
 * Only `reference` fields accept either. There is nothing to confirm about a
 * fact the estate has not supplied yet, and an estate's own account of its own
 * cellar is not put to a vote — see {@link RecordFieldKind}.
 */

/** Why a member thinks a matched value is wrong. A closed set keeps triage tractable. */
export type DisputeReasonContract =
  | "incorrect_value"
  | "outdated"
  | "wrong_wine"
  | "typo"
  | "other";

/** Where an opened dispute has got to. */
export type DisputeStatusContract =
  | "open"
  | "accepted"
  | "rejected"
  | "withdrawn";

/**
 * Affirm that a matched value is right. Idempotent: confirming twice is the same
 * as confirming once, and the response returns the resulting state rather than a
 * delta, so a client that retries cannot double-count.
 */
export type ConfirmRecordFieldRequest = {
  wineVintageId: string;
  /** {@link RecordFieldContract.key}. */
  fieldKey: RecordFieldKey;
};

export type ConfirmRecordFieldResponse = {
  fieldKey: RecordFieldKey;
  confirmations: number;
  confirmedByMe: boolean;
};

/** Withdraw a confirmation. Same idempotence in the other direction. */
export type WithdrawRecordFieldConfirmationRequest = ConfirmRecordFieldRequest;

/**
 * Open a dispute against a matched value.
 *
 * `currentValue` is echoed back by the client so the server can reject a dispute
 * raised against a value that has since changed — otherwise a stale screen files
 * a case about a fact nobody is showing any more.
 */
export type DisputeRecordFieldRequest = {
  wineVintageId: string;
  fieldKey: RecordFieldKey;
  /** The value the member was looking at when they disputed it. */
  currentValue: string;
  reason: DisputeReasonContract;
  /** What it should say instead, when the member knows. Optional by design. */
  proposedValue?: string;
  /** Free text. Required for `other`, useful everywhere. */
  detail?: string;
};

export type DisputeRecordFieldResponse = {
  disputeId: string;
  fieldKey: RecordFieldKey;
  status: DisputeStatusContract;
  submittedAt: string;
};

/**
 * Suggest a value for a row nobody has answered.
 *
 * The third verb, and the narrow one. Confirm and dispute both need an existing
 * value to act on; this is for a row that has none — which on this record means
 * almost always an `estate_private` field the estate has not filled in.
 *
 * **It does not put the value on the record.** A suggestion goes to the claimant
 * for them to accept, and on an unclaimed record it goes nowhere and the
 * endpoint says so. That is the estate-private rule holding: members are
 * deliberately not asked to guess the yield, because a guessed yield is noise
 * entering a record whose entire value is that it does not guess. What a member
 * can do is tell the estate what they believe they know and let the estate own
 * it — which is a correction to the ESTATE, not to the record.
 *
 * `source` is required for the same reason. "I read it on the back label" and
 * "I think I remember" are different offers, and an anonymous unsourced value is
 * the shape this whole model refuses.
 */
export type SuggestRecordFieldCorrectionRequest = {
  wineVintageId: string;
  fieldKey: RecordFieldKey;
  /** What the member believes it should say. */
  proposedValue: string;
  /** Where they got it — a back label, a cellar visit, a certificate. Free text. */
  source: string;
  detail?: string;
};

export type SuggestRecordFieldCorrectionResponse = {
  suggestionId: string;
  fieldKey: RecordFieldKey;
  submittedAt: string;
  /**
   * Whether there was anybody to send it to.
   *
   * False on an unclaimed record: the suggestion is kept and forwarded if a
   * claim arrives later, and the client says so rather than implying an estate
   * is reading. Silently accepting into a void is how a member learns their
   * contributions go nowhere.
   */
  routedToClaimant: boolean;
};
