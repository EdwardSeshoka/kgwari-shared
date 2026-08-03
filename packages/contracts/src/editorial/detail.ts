/**
 * The editorial DETAIL document — what an estate publishes, in full.
 *
 * Separate from {@link EditorialContract}, which is the card that Discover and a
 * profile listing render. The card carries a title, a standfirst and an image;
 * this carries the piece, its sources, the evening it announces and the offer it
 * makes. Growing the card to hold all of that would tax every list in the app
 * for one screen's benefit — the same split {@link ../catalog!WineRecordContract}
 * makes against `WineContract`, for the same reason.
 *
 * ## One event, not two
 *
 * An event piece EMBEDS {@link EventContract} rather than restating its clock,
 * its venue and its seat count. There is one dinner; the list row in Discover
 * and the announcement here are two views of it. Two copies would disagree the
 * first time somebody moved it an hour later, and the one that disagreed would
 * be whichever the reader happened to open.
 */

import type { NegotiatedText } from "../text/index.js";
import type { TrustBylineContract } from "../trust/index.js";
import type { EventContract } from "../events/index.js";
import type { EditorialClaimContract } from "./claim.js";
import type { EditorialContentType } from "./contentType.js";
import type { EditorialOfferContract } from "./offer.js";
import type { EditorialPairingContract } from "./pairing.js";
import type { EditorialSubjectContract } from "./subject.js";
import type { EditorialUnansweredContract } from "./unanswered.js";

/**
 * The full document for one piece.
 *
 * `body` is an array of paragraphs rather than one blob with markup in it,
 * matching {@link ../catalog!EstateVoiceContract.essay} — a client that has to
 * parse prose to lay it out is a client that renders it differently from every
 * other client.
 */
export type EditorialDetailContract = {
  id: string;
  contentType: EditorialContentType;
  title: string;
  /** BCP 47 tag the title was authored in. */
  titleLanguage?: string;
  /** The standfirst — the card's `description`, in full. */
  standfirst?: NegotiatedText;
  body: NegotiatedText[];
  imageUrl?: string;
  author?: TrustBylineContract;
  subject?: EditorialSubjectContract;
  /** ISO-8601. When the piece was published, not when it was written. */
  publishedAt: string;

  /**
   * Checkable statements, each with its source — and the reverse index into the
   * wine record. See {@link EditorialClaimAnswerContract}.
   */
  claims?: EditorialClaimContract[];
  /** What was asked and not answered. */
  unanswered?: EditorialUnansweredContract[];

  /**
   * The evening this piece announces — the events-domain entity itself.
   *
   * Legal only on the types {@link EDITORIAL_PIECE_RULES} allows. Its
   * `lifecycle`, `capacity`/`taken` and `booking` are the event's, read live,
   * so an announcement of a full dinner says so without being republished.
   */
  event?: EventContract;
  offer?: EditorialOfferContract;
  pairing?: EditorialPairingContract;

  saveCount?: number;
};
