import type { TrustBylineContract, VerdictWord } from "../trust/index.js";
import type { ActivityUser, ActivityWineRef } from "./activity.js";

/**
 * A durable tasting note — the record behind a review, distinct from a feed
 * {@link ActivityContract}. Notes attach to a specific **vintage**
 * (`wineVintageId`), never only to a label, so 2018 and 2019 never blur.
 *
 * `tastedAt` is when the wine was tasted; `createdAt` is when the note was
 * posted — they differ. No numeric score: the judgement is the worded `verdict`.
 */
export type TastingNoteContract = {
  id: string;
  /** The vintage this note is about. */
  wineVintageId: string;
  wine?: ActivityWineRef;
  user: ActivityUser;
  verdict?: VerdictWord;
  note: string;
  /** When the wine was actually tasted (ISO-8601). */
  tastedAt?: string;
  /** When the note was posted (ISO-8601). */
  createdAt: string;
  /** The wine's backing byline, if surfaced — separate from the author (`user`). */
  source?: TrustBylineContract;
  /**
   * How many members have saved this note.
   *
   * A count, not a score, and the mechanism behind the community lede: the
   * most-saved note is promoted to the top of an unclaimed record in its
   * author's exact words, which is how the page speaks in a member's voice
   * rather than Kgwari's. See {@link FeaturedNoteContract}.
   */
  saveCount?: number;
  /**
   * BCP 47 tag of the language the note was WRITTEN in — not the language it is
   * being served in. A tasting note is a member's own words, so the client can
   * badge or offer a translation rather than passing an untranslated note off as
   * one the reader's locale was served.
   */
  languageTag?: string;
};
