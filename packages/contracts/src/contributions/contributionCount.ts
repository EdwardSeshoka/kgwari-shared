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
  count: number;
};
