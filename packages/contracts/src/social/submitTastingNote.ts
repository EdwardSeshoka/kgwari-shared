import type { TransactedMoneyContract } from "../money/index.js";
import type { MediaRefContract } from "../media/index.js";
import type { VerdictWord } from "../trust/index.js";
import type { NoteReadingsContract } from "./readings.js";
import type { TastingNoteContract } from "./tastingNote.js";
import type { NoteVisibility } from "./visibility.js";

/**
 * Writing a note — the capture screen's contract.
 *
 * ## Stricter than the read shape, deliberately
 *
 * `verdict` is REQUIRED here and optional on {@link TastingNoteContract}, and
 * the asymmetry is not an oversight. The design's own ledger names two things a
 * note must hold — the words and the verdict — and everything else as offered.
 * The read contract stays permissive because notes written before the picker
 * existed are still real notes; the write contract does not have to inherit
 * their history. A reader must handle a verdict-less note. A writer must not
 * create one.
 */
export type SubmitTastingNoteRequest = {
  /** The vintage. A note is about a harvest, never about a label in general. */
  wineVintageId: string;
  /** The member's own words. Required — a note without words is a rating. */
  note: string;
  /** BCP 47 tag of what they wrote it in. */
  languageTag?: string;
  /** REQUIRED on write. See the type doc. */
  verdict: VerdictWord;
  /**
   * When the wine was tasted, if not now. The server assigns `createdAt`; these
   * are different facts and a member filing Saturday's bottle on Monday needs
   * both to be true.
   */
  tastedAt?: string;
  readings?: NoteReadingsContract;
  photo?: MediaRefContract;
  /** Defaults to `"room"` when absent. */
  visibility?: NoteVisibility;
  /**
   * **What the member paid — and it never lands on the note.**
   *
   * The privacy rule for price is structural rather than a flag: price is a
   * CELLAR fact, owned by the member, and it lives on
   * {@link ../cellar!CellarEntryContract.paidPrice} where nothing that renders
   * the room can reach it. That the two domains cannot see each other is the
   * guarantee — a `private: true` on a public note is one bug away from being
   * public.
   *
   * It rides this request only because the capture screen asks for it in the
   * same breath, and asking a member to submit twice would be an artefact of our
   * storage showing through their evening. The server SPLITS the submission:
   * the note goes to the room, this goes to the member's cellar entry for the
   * same wine (creating one if they hold no bottles yet). It is not echoed back
   * on {@link SubmitTastingNoteResponse}, and any server that stores it on the
   * note has broken the contract, not merely leaked a field.
   *
   * {@link TransactedMoneyContract} rather than a plain amount: what was paid is
   * an immutable historical fact with a date, not a price that moves.
   */
  paidPrice?: TransactedMoneyContract;
};

/**
 * The note as posted.
 *
 * Returns the whole note rather than an id, for the reason
 * {@link ../member!PatchMemberProfileResponse} does: the server owns fields the
 * client cannot compute (`createdAt`, the resolved `user` byline, `saveCount`),
 * and an acknowledgement leaves the client holding a shape it invented.
 */
export type SubmitTastingNoteResponse = {
  item: TastingNoteContract;
};
