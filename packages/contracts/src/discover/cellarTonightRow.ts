import type { ActivityWineRef } from "../social/index.js";

/**
 * A wine the member holds that the room is drinking tonight.
 *
 * The join no existing contract could make. `WineContract.noteCount` is a
 * LIFETIME count — a wine with fourteen hundred notes has fourteen hundred
 * notes whether or not anybody opened one this evening — and Discover's other
 * sections are not member-scoped, so nothing anywhere could answer "of the
 * bottles in YOUR cellar, which are being opened right now".
 *
 * A row, not a wine: it exists to say "and you have two", so it carries the
 * reference and the windowed count and deliberately nothing else.
 */
export type CellarTonightRowContract = {
  wine: ActivityWineRef;
  /**
   * Notes and check-ins on this wine INSIDE the window. Never a lifetime total,
   * and the field is named for the window so the two cannot be confused at a
   * call site.
   */
  activityCount: number;
  /** How many bottles the member holds. The reason the row is theirs. */
  bottlesHeld?: number;
};
