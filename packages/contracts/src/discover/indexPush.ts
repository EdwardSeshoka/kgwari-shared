/**
 * Where a chapter pushes, when it pushes anywhere.
 *
 * ## Index-push, never a tab switch
 *
 * A chapter link names the LARGER THING and pushes it on this page's own stack —
 * the full rail stays, back pops to Home. That is a different act from opening a
 * document (a record, a piece, a row), which gets its own URL and the collapsed
 * spine. Home never switches tabs and the stack never exceeds two index levels,
 * so the four destinations below are the complete set of places a chapter can
 * go.
 *
 * ## Why this is on the wire and not a client's table
 *
 * Because whether a chapter HAS a link is a fact only the server holds: a
 * chapter that already shows everything it is about carries none. "From your
 * cellar" is the standing example — it is member-scoped and finite, so there is
 * no larger thing to push, and a client cannot know that without knowing whether
 * the section was truncated.
 *
 * The label is not here for the same reason no other label is: the set is closed,
 * so the word renders from the destination per locale. The design also drops the
 * definite article from every one of them — in mono caps at 9/1.6 "THE" is two
 * dead characters of tracking before the only word carrying meaning, and a
 * column of links that all begin THE… stops reading as names of places.
 */
export type DiscoverIndexPush = "calendar" | "shelves" | "itineraries" | "archive";

export const DISCOVER_INDEX_PUSHES = [
  "calendar",
  "shelves",
  "itineraries",
  "archive"
] as const satisfies readonly DiscoverIndexPush[];
