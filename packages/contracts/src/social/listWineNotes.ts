import type { TastingNoteContract } from "./tastingNote.js";

/**
 * Notes for one vintage — the room's own column on a wine detail page.
 *
 * Endpoint shape, not a new note shape: the detail page lists the same
 * {@link TastingNoteContract} the room does. `total` is the count before
 * paging, which is what "1,480 members wrote about this" is counting.
 */
export type ListWineNotesResponse = {
  items: TastingNoteContract[];
  total: number;
  /** Opaque. Absent when this is the last page. */
  nextCursor?: string;
};
