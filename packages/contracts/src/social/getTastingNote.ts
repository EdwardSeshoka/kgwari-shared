import type { TastingNoteContract } from "./tastingNote.js";

/**
 * Opening one note.
 *
 * Every surface that lists notes — the room, the wine record's column, the
 * Latest ledger, a profile's writing stream — opens onto this, and until now
 * nothing described it. A ledger row that cannot be tapped is a ledger of
 * dead ends.
 *
 * `null` covers both "no such note" and "not yours to read": a note whose
 * `visibility` is `private` belongs to its author, and a reply that
 * distinguished the two cases would confirm the note exists to somebody who was
 * not shown it.
 */
export type GetTastingNoteResponse = {
  item: TastingNoteContract | null;
};
