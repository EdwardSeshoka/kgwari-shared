import type { RecordFieldKey } from "./vocabulary/index.js";

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
