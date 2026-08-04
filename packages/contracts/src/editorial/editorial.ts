import type { TrustBylineContract } from "../trust/index.js";
import type { EditorialContentType } from "./contentType.js";
import type { EditorialSubjectContract } from "./subject.js";

/**
 * A piece of editorial content — the CARD, as Discover and a profile listing
 * render it.
 *
 * The `contentType` discriminates article / guide / story / new arrival and the
 * six piece types added in 7.0 — one contract rather than a type per variant.
 * The full document is {@link EditorialDetailContract}, fetched separately so a
 * piece's claims, offer and event never ride along in a list response.
 */
export type EditorialContract = {
  id: string;
  contentType: EditorialContentType;
  title: string;
  categoryLabel?: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  /**
   * The author / byline that carries trust — a name plus a verification mark
   * (`tier`) or a member `status` word, plus a role descriptor ("sommelier").
   */
  author?: TrustBylineContract;
  /** What the piece is about — powers "read more like this" and cross-linking. */
  subject?: EditorialSubjectContract;
  /**
   * ISO-8601. When the piece was published — not when it was written, and not
   * when it was last edited.
   *
   * REQUIRED, and on the card rather than only on the detail, because the card
   * is what a list renders: an archive files by date, rules itself into months
   * and shows the date on the row, and none of that is reachable from a
   * response that only carries it one fetch deeper. It was optional-by-absence
   * before, which is how a client ends up with an archive whose rows have no
   * dates and no error to explain why.
   *
   * The same value as {@link EditorialDetailContract.publishedAt}, derived from
   * it wherever a detail exists, so a card and its piece cannot disagree.
   */
  publishedAt: string;
  /**
   * How many members have saved this piece.
   *
   * The same count every other saveable unit carries. A card that offers Save
   * and cannot report the count is a card that fetches one number per row.
   */
  saveCount?: number;
};
