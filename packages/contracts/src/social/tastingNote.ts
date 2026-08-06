import type { MediaRefContract } from "../media/index.js";
import type { TrustBylineContract, VerdictWord } from "../trust/index.js";
import type { ActivityUser, ActivityWineRef } from "./activity.js";
import type { NoteReadingsContract } from "./readings.js";
import type { NoteVisibility } from "./visibility.js";

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
  /**
   * What the member observed, as answers rather than prose.
   *
   * The input side of the register, and the reason the register can be a sum of
   * notes instead of a seeded aggregate. Absent on a note that answered nothing,
   * which is a complete note — see {@link NoteReadingsContract}.
   */
  readings?: NoteReadingsContract;
  /** The member's photo of the bottle or the glass. Theirs, so it carries alt text. */
  photo?: MediaRefContract;
  /**
   * Who this note is for. Absent reads as `"room"` — the norm, and the default a
   * note written before this field existed was posted under.
   */
  visibility?: NoteVisibility;
  /**
   * Where this note was written, when it was not written on its own.
   *
   * Absent is the norm and means standalone: a member opened a wine's page and
   * wrote about it. Present means the note was written into a stop on an
   * itinerary, and it changes exactly one thing — see below.
   *
   * ## One act, one row
   *
   * Somebody documenting a day on the Franschhoek tram writes nine notes in an
   * afternoon and performs ONE act: publishing the route. Nine rows in Latest
   * would bury the room under one person's Saturday, and the ledger has already
   * made this call once — `tasting` is a row for the ATTENDANCE, not for each
   * thing poured at it. So a note carrying an origin gets no
   * {@link ContributionContract} row of its own; the itinerary's row stands for
   * the day, and it counts 1 in {@link ContributionCountContract}, not 9.
   *
   * ## Suppressing the ROW is not suppressing the NOTE
   *
   * This is the sentence to read twice. The ledger is a record of ACTS; a wine's
   * page is a record of OPINIONS. One act produced nine opinions, and every one of
   * them is fully real: it attaches to its vintage, it counts toward that wine's
   * note count, it feeds the register through `readings`, it is savable, and it can
   * be promoted as the most-saved note on an unclaimed record. Nothing about this
   * field makes a note quieter on the wine it is about.
   *
   * ## Why the note declares it rather than the server joining it
   *
   * Because {@link PublishedCollectionContract} settled the same question: a shape
   * a producer cannot construct beats a filter a server remembers. If the ledger
   * had to join notes against itinerary stops to know what to drop, every producer
   * of every stream would have to remember the join, and the first one that forgot
   * would spam Latest. Declared on the payload, the rule is local and readable.
   *
   * ## Denormalized, and a plain ref
   *
   * `itineraryTitle` travels with it so a note's own page can say "from *Two days
   * in Stellenbosch*" without a second request — the same trade the card's preview
   * strip makes, and like the strip it may lag the title behind it. Ids and a
   * string rather than the collection's contract, so `social` does not start
   * depending on `collections` to describe where a note came from.
   */
  origin?: NoteOriginContract;
};

/**
 * The itinerary stop a note was written into.
 *
 * A note has AT MOST ONE origin, and that is the invariant worth stating: it was
 * either written standalone or written into one stop. There is no second parent
 * and no list here, because two origins would mean two ledger rows to suppress
 * and no answer to which route the breadcrumb names.
 */
export type NoteOriginContract = {
  itineraryId: string;
  /**
   * Denormalized for the breadcrumb. A display fact — it can lag the route's title.
   *
   * Bare, matching {@link CollectionContract.title} it was copied from rather than
   * re-declaring it as negotiated text: the server did not translate this, it
   * duplicated it.
   */
  itineraryTitle: string;
  /**
   * Which stop, not which place.
   *
   * A route can call at one estate twice, so the producer id would not say which
   * afternoon this note belongs to. See {@link ItineraryStopContract.id}.
   */
  stopId: string;
};
