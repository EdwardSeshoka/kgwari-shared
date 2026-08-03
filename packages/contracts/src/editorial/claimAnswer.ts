import type { RecordFieldKey } from "../vocabulary/index.js";

/**
 * Which record row a claim answered — the editorial reverse index, one entry at
 * a time, and the load-bearing piece of the whole detail model.
 *
 * A wine record row could always name its SOURCE ("estate"), which says who
 * supplied a fact but not where it was said. This is what lets the row resolve
 * to the writing that established it and read "answered by *Fourteen clones, one
 * rootstock*" instead of showing a bare Estate tag. See
 * {@link ../catalog!RecordFieldContract.answeredBy}, which is the other end of
 * the same arrow — projected from this, never authored independently, so a
 * record cannot cite a piece that does not claim it.
 *
 * Both halves are required: a wine without a field says "this piece is about
 * this wine", which is what {@link EditorialSubjectContract} already says, and a
 * field without a wine answers a row on every record at once.
 */
export type EditorialClaimAnswerContract = {
  wineVintageId: string;
  /** The record row this claim establishes. See {@link ../catalog!RecordFieldContract.key}. */
  fieldKey: RecordFieldKey;
};
