import type { ContributionContract } from "./contribution.js";
import type { ContributionCountContract } from "./contributionCount.js";
import type { ContributionKind } from "./contributionKind.js";

/**
 * Reading the corpus — one endpoint shape for both consumers.
 *
 * Discover's Latest is this with no `memberId`; the Profile's Writing stream is
 * this with one. That they are the same request is the whole argument for the
 * union: a member's stream is not a different feature, it is the corpus with a
 * filter on it, and building it as a separate endpoint is how two orderings of
 * one corpus come to disagree.
 */
export type ListContributionsRequest = {
  /** Absent means the whole room. Present narrows to one member's contributions. */
  memberId?: string;
  /**
   * Which kinds to include. Absent means all of them — NOT none, which is the
   * reading an empty array would deserve and a client would eventually send by
   * accident when every chip is off.
   */
  kinds?: ContributionKind[];
  /** Opaque. From the previous page's `nextCursor`. */
  cursor?: string;
  limit?: number;
};

/**
 * A page of the corpus, newest first.
 *
 * `counts` are for the WHOLE stream under this request's `memberId`, unfiltered
 * by `kinds` — a chip has to say how many it would show if you tapped it, so
 * counting only what passed the current filter would make every chip but the
 * active one read zero.
 */
export type ListContributionsResponse = {
  items: ContributionContract[];
  counts?: ContributionCountContract[];
  /** Opaque. Absent when this is the last page. */
  nextCursor?: string;
};
