import type { MemberStatus, TrustTier, VerdictWord } from "../trust/index.js";

export type RoomActivityType = "check_in" | "review" | "tasting_note";

/**
 * The member who performed the activity — a display snapshot, not the full
 * member profile (that lives in the member contract). Trust language matches the
 * rest of the system: a verified `tier` renders a mark; a member's `status` is a
 * burgundy word. `role` is a free descriptor (e.g. "sommelier").
 */
export type ActivityUser = {
  id: string;
  displayName: string;
  initials?: string;
  tier?: TrustTier;
  status?: MemberStatus;
  role?: string;
};

/**
 * The wine an activity is about — a reference, not the full {@link WineContract},
 * but carrying enough for a room-card footer ("name · vintage · verdict") without
 * a second fetch. `id` is the wine **vintage** id.
 */
export type ActivityWineRef = {
  id: string;
  wineLabelId?: string;
  name: string;
  producerName?: string;
  vintage?: number;
  vintageDisplay?: string;
};

/**
 * A single activity in the room feed. `createdAt` is ISO-8601 data; relative
 * time labels are derived on the client.
 */
export type ActivityContract = {
  id: string;
  activityType: RoomActivityType;
  user: ActivityUser;
  wine: ActivityWineRef;
  /** An editorial verdict word — the Fade Yield room cards show a word, never a score. */
  verdict?: VerdictWord;
  note?: string;
  createdAt: string;
  /**
   * How many members have saved this.
   *
   * A count, not a score, and the same field {@link TastingNoteContract},
   * {@link WineContract} and the record already carry. Save is offered on every
   * unit the ledger renders, so every unit has to be able to report it — a card
   * that shows the affordance and cannot show the count is a card that has to
   * fetch one per row.
   */
  saveCount?: number;
};
