import { slug } from "../data.mjs";
import { curated } from "../curated.mjs";
import { spread } from "../random.mjs";

const CURATED_ACTIVITIES = curated("activities");

/**
 * The room feed.
 *
 * EVERY user gets one. Generating people without a matching activity is what
 * left 28 dangling person ids in the corpus the last time these were maintained
 * separately.
 */
export function buildActivities({ users, wines }) {
  // EVERY user gets an activity. Generating people into the corpus without a
  // record in the owning domain is precisely how `user_thandi_nkosi` came to point
  // at nothing — at 52 people that stops being one oversight and becomes 28.
  const curatedUserIds = new Set(CURATED_ACTIVITIES.map((a) => a.user.id));
  const activities = [...CURATED_ACTIVITIES, ...users.filter((u) => !curatedUserIds.has(u.id)).map((u, i) => {
    const w = wines[(i * 3) % wines.length];
    return {
      id: `activity_${slug(u.displayName)}_${i}`,
      activityType: "review",
      user: { id: u.id, displayName: u.displayName, initials: u.initials, ...(u.status ? { status: u.status } : {}), ...(u.role ? { tier: "professional", role: u.role } : {}) },
      wine: { id: w.id, wineLabelId: w.wineLabelId, name: w.name, producerName: w.estate, ...(w.vintage ? { vintage: w.vintage, vintageDisplay: String(w.vintage) } : {}) },
      verdict: w.verdict,
      note: `Tasted at ${w.region}.`,
      createdAt: "2026-07-20T18:30:00.000Z",
      // Save is offered on every unit the ledger renders, so every unit reports
      // its count. Drawn from the order-independent hash rather than the stream:
      // how many members saved an activity is a fact about that activity, not
      // about where it fell in the run.
      saveCount: spread(`${u.id}${i}save`, 0, 90),
    };
  })];

  return activities;
}
