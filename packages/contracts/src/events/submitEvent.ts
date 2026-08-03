import type { EventContract } from "./event.js";
import type { EventVisibility } from "./visibility.js";

/**
 * Creating an evening — and the one boundary the publishing rule is enforced at.
 *
 * The host is not on the body: it is the authenticated member, exactly as the
 * member patch takes its subject from the JWT. A body that could name a
 * different host is a body that can publish in somebody else's name, and the
 * whole capability turns on whose standing is being checked.
 *
 * ## Where the rule runs
 *
 * The server reads the caller's profile and applies
 * {@link ../trust!canPublishEvents}. An enthusiast asking for
 * `visibility: "published"` is REFUSED rather than quietly downgraded to
 * private — a silent downgrade means a member advertises an evening they believe
 * is public and nobody comes, which is worse than being told no. Absent
 * visibility means `"published"`, so an enthusiast must ask for private
 * explicitly; that is deliberate, because the failure it produces is a clear
 * refusal at the moment of writing rather than a surprise later.
 */
export type SubmitEventRequest = {
  title: string;
  /** BCP 47 tag the title was authored in. */
  titleLanguage?: string;
  startDateTime: string;
  endDateTime?: string;
  /** IANA zone of the VENUE. Never the reader's, and never the caller's. */
  timezone?: string;
  venue?: EventContract["venue"];
  languages?: string[];
  admission?: EventContract["admission"];
  capacity?: number;
  /**
   * Defaults to `"published"`.
   *
   * An enthusiast must send `"private"`; anything else is refused. See the type
   * doc for why the refusal is loud rather than a downgrade.
   */
  visibility?: EventVisibility;
  subject?: EventContract["subject"];
};

/** The evening as created, including the visibility the server actually applied. */
export type SubmitEventResponse = {
  item: EventContract;
};
