import type {
  ActivityContract,
  TastingNoteContract
} from "@edwardseshoka/contracts/social";

import {
  TONIGHT_ACTIVITY,
  TONIGHT_NOTES,
  newestOf,
  offsetTo,
  shiftInstants,
  systemClock
} from "../../freshness/Freshness.js";

import rawActivities from "./activities.json" with { type: "json" };
import rawNotes from "./tasting-notes.json" with { type: "json" };

const activities = rawActivities as ActivityContract[];
const notes = rawNotes as TastingNoteContract[];

/**
 * Sample social content (room activity + durable tasting notes), as of tonight.
 *
 * Both sets are slid onto the current evening — see `Freshness` for why that
 * happens here rather than in whoever is reading. The shift is applied to the
 * whole row, so `tastedAt` moves with `createdAt` and a bottle drunk last night
 * and written up this morning stays a day apart.
 *
 * Computed once, when this module is first loaded. A process alive across
 * midnight keeps the evening it started with — the right trade for sample data:
 * a corpus that reshuffled underneath a running page would be a stranger thing
 * to debug than one a few hours stale.
 */
const now = systemClock();

export const socialSamples = {
  activities: shiftInstants(
    activities,
    offsetTo(newestOf(activities, (activity) => activity.createdAt), TONIGHT_ACTIVITY, now)
  ),
  tastingNotes: shiftInstants(
    notes,
    offsetTo(newestOf(notes, (note) => note.createdAt), TONIGHT_NOTES, now)
  )
} as const;
