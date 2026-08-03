/**
 * A contribution — one thing a member added to the corpus, whatever kind of
 * thing it was.
 *
 * ## Why this is one contract and not two streams
 *
 * Two surfaces need the same interleave and neither could express it. Discover's
 * Latest ledger is one chronological run of everything the room produced today;
 * the Profile's Writing stream is the same run narrowed to one member, with
 * filter chips and counts per kind. Built separately they would be two orderings
 * of one corpus that disagree at the boundaries — a story filed at 14:02 and a
 * note at 14:03 have exactly one correct order, and it is not "notes first".
 *
 * {@link ../social!ActivityContract} could not carry it and should not be bent
 * to. Its `wine` is required, which a story does not have, and its
 * `RoomActivityType` is check_in · review · tasting_note — a vocabulary about
 * what a member did WITH A BOTTLE. A contribution is about what a member added
 * to the corpus, which is a different question with different members.
 *
 * ## The envelope, and why the common fields are common
 *
 * `createdAt`, `author` and `saveCount` sit on every variant because the ledger
 * sorts, attributes and saves without knowing what it is holding. A ledger that
 * has to switch on kind to find a timestamp is a ledger that sorts wrong the day
 * a kind is added.
 */

import type { EditorialContract } from "../editorial/index.js";
import type { EventContract } from "../events/index.js";
import type { ActivityUser, TastingNoteContract } from "../social/index.js";

/** What every contribution carries, whatever it is. */
type ContributionBase = {
  /**
   * The CONTRIBUTION's id, which is not the payload's.
   *
   * A stream needs a stable key per row, and the payload's id is only unique
   * within its own kind — a note and an event can share `"1"` and a client
   * keyed on the payload would drop one of them.
   */
  id: string;
  /** ISO-8601. What the stream sorts on, for every kind. */
  createdAt: string;
  /** Who made it. The display snapshot, matching the room's byline exactly. */
  author: ActivityUser;
  /** How many members have saved it. Save is offered on every unit. */
  saveCount?: number;
};

/**
 * One entry in the corpus.
 *
 * The payload is the domain's OWN contract, never a flattened copy of it: a note
 * row renders from `TastingNoteContract` and therefore gets the verdict, the
 * wine ref and the language tag for free, and cannot drift from what the note
 * endpoint serves.
 */
export type ContributionContract =
  | (ContributionBase & { kind: "note"; note: TastingNoteContract })
  /**
   * A story, an article, a guide — the `contentType` on the payload discriminates
   * further. One variant rather than one per content type, because they are one
   * contract and a filter chip reading `editorial.contentType` is cheaper than a
   * union that has to grow every time editorial does.
   */
  | (ContributionBase & { kind: "editorial"; editorial: EditorialContract })
  /**
   * A tasting the member ATTENDED. The contribution is the attendance — the
   * relation that had no wire shape at all before this contract — and the
   * payload is the events-domain event itself.
   */
  | (ContributionBase & { kind: "tasting"; event: EventContract });
