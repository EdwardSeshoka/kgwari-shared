/**
 * The samples, expressed relative to NOW rather than to the day they were generated.
 *
 * ## Why this lives here and not in a consumer
 *
 * The seeds carry fixed dates and the questions asked of them do not. The front
 * page's `tonightWindow` is TODAY 16:00 → midnight, recomputed per request, so a
 * corpus generated in July counts nothing in it and the standing column is
 * absent on every environment seeded from these samples — permanently, not for a
 * while. The calendar has the same fate on a longer fuse: its events run out and
 * the landing empties.
 *
 * Regenerating onto a fresh date fixes it for ONE calendar day. Shifting at READ
 * time fixes it for every day, and doing it HERE — where the JSON becomes
 * contracts — is what keeps it out of the consumers: the backend seed maps
 * whatever it is handed, the frontend app doubles replay whatever they are
 * handed, and neither contains a clock.
 *
 * The generated JSON on disk is untouched, so `check:seeds` stays byte-exact and
 * the generator stays deterministic. This is a lens over the data, not an edit
 * of it.
 *
 * ## Why the offset is per set and not one for the corpus
 *
 * A single offset cannot satisfy every domain at once: in the source data the
 * newest editorial piece is NEWER than the newest tasting note, so any shift
 * putting notes in tonight's window puts an article two days into the future.
 * Each domain therefore states where its newest row should sit relative to now,
 * and the shift for that domain follows from it.
 *
 * Within a set the offset is uniform, so every gap, every ordering and the
 * ledger's day grouping survive exactly. The corpus slides; it never rearranges.
 */

/** An ISO-8601 instant, as the seeds spell them. */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

/**
 * The clock, injectable so a test can stand on a chosen evening.
 *
 * Read once per call rather than per row: a corpus half-shifted across a
 * midnight boundary would be a corpus that disagrees with itself.
 */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();

/**
 * Where a domain's newest row should sit, as MINUTES BEFORE NOW.
 *
 * It used to be a UTC time of day — `{ hour: 18, minute: 30 }` — and that is the
 * bug this type replaces. A time of day is a point the clock passes once, so a
 * set slid onto 18:30 "today" is slid into the FUTURE for every hour of the day
 * before 18:30. Seeded at 02:00, twenty-five of thirty-four rows carried
 * timestamps that had not happened yet: notes written tomorrow, check-ins for
 * bottles nobody had opened.
 *
 * Nothing caught it because the window it was built for was forward-looking too
 * — 16:00 to midnight includes 18:30 even when asked at 02:00 — so two wrongs
 * agreed. The moment the server counted a window ending NOW, every one of those
 * rows fell outside it and the room's record went empty.
 *
 * Minutes-ago cannot do that. A row is always in the past, whatever the hour,
 * and any window ending at the present moment can see it.
 */
export type FreshnessTarget = Readonly<{ minutesAgo: number }>;

/**
 * Recent enough to sit inside the room's rolling window, with room to spare.
 *
 * Notes and activities take DIFFERENT offsets on purpose. `bottlesOpened` counts
 * both, so with only one kind in the window it equals `notesWritten` — the same
 * figure under two labels, one of which is then a lie.
 */
export const TONIGHT_NOTES: FreshnessTarget = { minutesAgo: 90 };
export const TONIGHT_ACTIVITY: FreshnessTarget = { minutesAgo: 45 };

/** Earlier on — for things that are published rather than poured. */
export const EARLIER_TODAY: FreshnessTarget = { minutesAgo: 6 * 60 };

const atUtc = (now: Date, target: FreshnessTarget): number =>
  now.getTime() - target.minutesAgo * 60_000;

/**
 * How far to slide a set so its newest instant lands on `target` today.
 *
 * `newest` is read from the data rather than declared, so adding rows to a seed
 * cannot silently leave the shift pointing at a row that is no longer the last.
 */
export function offsetTo(newestIso: string | undefined, target: FreshnessTarget, now: Date): number {
  if (newestIso === undefined) return 0;
  const newest = Date.parse(newestIso);
  return Number.isFinite(newest) ? atUtc(now, target) - newest : 0;
}

/** The latest value of `field` across `rows`, or undefined when there is none. */
export function newestOf<T>(rows: readonly T[], field: (row: T) => string | undefined): string | undefined {
  let latest: string | undefined;
  for (const row of rows) {
    const value = field(row);
    if (value !== undefined && (latest === undefined || value > latest)) latest = value;
  }
  return latest;
}

/**
 * Every ISO instant in `value`, moved by `offset`.
 *
 * Deep and shape-agnostic on purpose. These are recorded RESPONSES as well as
 * row arrays — a discover response carries instants inside sections, inside
 * items, and inside the tonight window itself — and a shift that reached only
 * the fields somebody remembered to list would leave a page whose window and
 * whose rows disagree about what day it is.
 *
 * Only full ISO instants match. A date-only string like a vintage year, an id
 * that happens to contain digits, or prose mentioning a date is left alone.
 */
export function shiftInstants<T>(value: T, offset: number): T {
  if (offset === 0) return value;
  return walk(value, offset) as T;
}

function walk(value: unknown, offset: number): unknown {
  if (typeof value === "string") {
    return ISO_INSTANT.test(value) ? new Date(Date.parse(value) + offset).toISOString() : value;
  }
  if (Array.isArray(value)) return value.map((entry) => walk(entry, offset));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        walk(entry, offset)
      ])
    );
  }
  return value;
}
