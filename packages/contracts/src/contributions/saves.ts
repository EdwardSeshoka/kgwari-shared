import type { SavableKind } from "./savableKind.js";

/**
 * Saving — the one action offered on every unit in the app.
 *
 * ## Why the mutation is generic and the counts are not
 *
 * Each read contract carries its own `saveCount`, because a count is a fact
 * about that unit and belongs beside it. The WRITE is generic, because "save
 * this" is one verb the member performs identically on a note, a wine, an
 * evening and a piece of writing — and four endpoints for one verb is four
 * places for the idempotence rule to be implemented differently.
 *
 * IDEMPOTENT in both directions, and the response returns the resulting state
 * rather than a delta — the same rule
 * {@link ../catalog!ConfirmRecordFieldRequest} runs on, for the same reason: a
 * client that retries on a flaky connection must not double-count.
 */
export type SaveRequest = {
  kind: SavableKind;
  /** The unit's own id. For a wine this is the VINTAGE id, never the label's. */
  id: string;
};

export type SaveResponse = {
  kind: SavableKind;
  id: string;
  /** Whether the requesting member has it saved, after this call. */
  savedByMe: boolean;
  /**
   * The unit's count, after this call.
   *
   * Returned so a client can render the new number without refetching the unit,
   * and so it never has to increment its own copy — a client that guesses the
   * count is a client that shows a different number from the next reader's.
   */
  saveCount: number;
};
