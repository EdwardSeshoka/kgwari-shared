import type {
  SubmitTastingNoteRequest,
  SubmitTastingNoteResponse
} from "./submitTastingNote.js";

/**
 * Amending a note. Everything a member may change about their own words.
 *
 * `wineVintageId` is absent on purpose: re-pointing a note at a different wine
 * is not an edit, it is a new note about a different bottle, and allowing it
 * would let a verdict and its readings migrate to a wine nobody tasted.
 *
 * `paidPrice` is absent too — it was never stored on the note, so there is
 * nothing here to amend. Correcting what was paid is a cellar edit.
 */
export type PatchTastingNoteRequest = Partial<
  Omit<SubmitTastingNoteRequest, "wineVintageId" | "paidPrice">
>;

export type PatchTastingNoteResponse = SubmitTastingNoteResponse;
