/**
 * Who a note is for.
 *
 * "room" is the default and the norm — a note is written to be read. "private"
 * is the member keeping a structured record for themselves, and it is NOT the
 * same thing as {@link ../cellar!CellarEntryContract.note}: that field is free
 * prose about a member's own bottles ("last two, saving them for the
 * anniversary"), while a private note is the full structured capture — readings,
 * verdict, aromas — that simply does not enter the room.
 *
 * The distinction matters to the register: a private note is still a member's
 * genuine reading and still aggregates. What visibility governs is whose name
 * and words appear, not whether the observation counts.
 */
export type NoteVisibility = "room" | "private";
