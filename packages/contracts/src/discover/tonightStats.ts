import type { CellarTonightRowContract } from "./cellarTonightRow.js";
import type { TonightWindowContract } from "./tonightWindow.js";

/**
 * The room's standing record for the evening.
 *
 * The first aggregate contract in the system, and it is deliberately four
 * numbers and a name rather than a dashboard. Each one is a count of something
 * that happened, not a score: bottles opened, notes written, how many of those
 * came from professionals, and which wine the room opened most.
 *
 * No percentages and no composed sentences. "63 % of tonight's notes were
 * written by professionals" is a formatted number, an English word order and a
 * plural rule in one string; sent as two counts, a client says it in its own
 * language and can decide for itself whether the ratio is worth showing at all.
 */
export type TonightStatsContract = {
  window: TonightWindowContract;
  bottlesOpened: number;
  notesWritten: number;
  /** How many of `notesWritten` came from a verified professional. */
  notesByProfessionals: number;
  /**
   * The wine the room opened most tonight. Absent on a quiet evening — which is
   * a real state, and better rendered as nothing than as a "most opened" wine
   * with one opening behind it.
   */
  mostOpened?: CellarTonightRowContract;
};
