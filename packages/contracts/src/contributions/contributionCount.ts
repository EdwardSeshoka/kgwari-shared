import type { ContributionKind } from "./contributionKind.js";

/**
 * How many of each kind, for the filter chips and the section headings.
 *
 * Sent alongside a page rather than derived from it, because a chip counts the
 * whole stream and a page is twenty rows of it. A client that counted what it
 * had would label the chip with its own page size.
 */
export type ContributionCountContract = {
  kind: ContributionKind;
  /**
   * How many rows this chip's stream will actually show.
   *
   * Rows, not writings — and for `note` the two now differ. A note written into an
   * itinerary stop has no row of its own, so it is not counted here. See
   * {@link nestedCount}, which is the number that makes the difference legible.
   */
  count: number;
  /**
   * How many more of this kind exist, represented by another row.
   *
   * ## The number a chip needs so it stops reading as a bug
   *
   * A member who wrote nine notes on the tram and twelve on their own has written
   * twenty-one notes and will see a chip saying twelve. Both facts are correct —
   * publishing the route was one act, so the day is one row — but a bare `12` is
   * indistinguishable from four notes having gone missing, and that is a support
   * ticket in the first week.
   *
   * So the chip gets a second number and a client is expected to SAY something
   * with it, not print it: "12 · 4 on routes", or twelve with "four more written on
   * itineraries" beneath. The word is the point. A client that renders `count +
   * nestedCount` has undone the whole rule and put the tram back in the ledger
   * nine times.
   *
   * Absent means nothing is nested, which is every kind except `note` today —
   * `editorial`, `tasting` and `collection` have no container to hide inside.
   * Absent is not zero for a client's purposes: with nothing nested there is no
   * second clause to render, and "· 0 on routes" is a sentence about nothing.
   *
   * @see TastingNoteContract.origin — the field that decides which notes land here
   * rather than in {@link count}.
   */
  nestedCount?: number;
};
