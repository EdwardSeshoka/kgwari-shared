import { lensRow } from "../lenses.mjs";

/**
 * The CALENDAR and ARCHIVE landings.
 *
 * The two that need no corpus of their own — they are the events and the
 * editorial already generated, ordered for their landing and given their chip
 * row. That is the whole claim the lens mechanism makes: one row of chips over
 * a stream that already exists, adding no depth and inventing no content.
 */

/** Which calendar lens an evening falls under, given the month being read. */
function calendarLens(event, monthPrefix) {
  if ((event.startDateTime ?? "").startsWith(monthPrefix)) return "lens.thisMonth";
  return "lens.later";
}

/** Which archive lens a piece falls under: an estate's voice, or a member's. */
function archiveLens(card) {
  return card.author?.tier === "producer" ? "lens.estates" : "lens.members";
}

export function buildLandings({ events, editorial }) {
  // A calendar reads FORWARD — soonest first — unlike every other landing here,
  // which reads back from now. A cancelled evening still appears: somebody may
  // have been planning around it, and dropping it silently is how a member turns
  // up to a locked door.
  // Published only. The calendar faces strangers by definition, and a private
  // evening reaching it would put a member's address in front of people they
  // never invited.
  const diary = [...events]
    .filter((event) => event.visibility !== "private")
    .filter((event) => event.startDateTime !== undefined)
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  const monthPrefix = "2026-08";
  const timeLenses = diary.map((event) => calendarLens(event, monthPrefix));

  // `lens.seatsLeft` is an ATTRIBUTE lens sitting among time lenses, so it is
  // counted separately rather than being one more bucket of the same partition:
  // an evening with seats left is also in this month or later, and a row can
  // legitimately answer to two chips.
  const withSeats = diary.filter(
    (event) => (event.seatsAvailable ?? 0) > 0 && event.lifecycle === "open"
  ).length;

  const calendar = lensRow(timeLenses, ["lens.all", "lens.thisMonth", "lens.later"]);
  if (withSeats > 0 && calendar.lenses.length > 1) {
    calendar.lenses.push({ key: "lens.seatsLeft", count: withSeats });
  }

  // Newest first, which is what the heading promises. It sorted by ID until
  // the card carried a date — a stand-in that looked stable and was arbitrary,
  // and that nothing could catch while there was no date to disagree with.
  const archiveRows = [...editorial.cards].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return {
    calendar: { items: diary, lenses: calendar },
    archive: {
      items: archiveRows,
      lenses: lensRow(archiveRows.map(archiveLens), [
        "lens.all",
        "lens.estates",
        "lens.members"
      ])
    }
  };
}
