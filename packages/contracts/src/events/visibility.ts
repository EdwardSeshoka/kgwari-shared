/**
 * Who an evening is for.
 *
 * `published` puts it on Discover, in the calendar, and in front of strangers.
 * `private` is the same event minus the audience: it exists, it can be shared by
 * link, and the people invited see everything a public attendee would.
 *
 * ## The restriction is on REACH, never on the verb
 *
 * An enthusiast can create an evening, invite people, take the seats and file the
 * recap. What they cannot do is put it on Discover — see
 * {@link ../trust!canPublishEvents}, which is where that rule lives and why.
 * Modelling it as a visibility rather than as a separate "draft event" type is
 * the point: a private evening is not an unfinished public one, it is a complete
 * event with a smaller room.
 *
 * Absent reads as `published` on the wire for events written before this field
 * existed — every one of which was already on Discover, so the default states
 * what was true rather than guessing.
 */
export type EventVisibility = "published" | "private";
