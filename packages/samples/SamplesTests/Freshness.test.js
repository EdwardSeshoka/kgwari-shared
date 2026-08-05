import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDiscover, socialSamples } from "../dist/index.js";
import {
  TONIGHT_NOTES,
  newestOf,
  offsetTo,
  shiftInstants,
} from "../dist/freshness/Freshness.js";

/** The window the front page counts: today 16:00 → midnight, UTC. */
/**
 * The server's window, mirrored: a rolling twenty-four hours ending now.
 *
 * It used to be an evening — 16:00 plus eight hours — and this helper is the
 * reason the old skew went unnoticed for so long. A forward-looking window
 * happily contained rows dated later today, so a seed shifted INTO THE FUTURE
 * passed a test asserting the seed was fresh.
 */
function roomWindow(now = new Date()) {
  return { from: new Date(now.getTime() - 24 * 3600_000).toISOString(), to: now.toISOString() };
}

const within = (iso, window) => iso >= window.from && iso < window.to;

describe("shiftInstants", () => {
  it(
    "moves ISO instants and leaves everything else alone",
    function givenMixedValues_whenShifted_thenOnlyInstantsMove() {
      // Given: a vintage year, an id with digits in it and prose about a date
      // are not instants, and a shift that caught them would corrupt the seed.
      const shifted = shiftInstants(
        {
          createdAt: "2026-07-28T09:15:00.000Z",
          vintage: 2018,
          id: "rubicon-2018",
          note: "Opened on 28 July.",
        },
        86_400_000,
      );

      // Then
      assert.equal(shifted.createdAt, "2026-07-29T09:15:00.000Z");
      assert.equal(shifted.vintage, 2018);
      assert.equal(shifted.id, "rubicon-2018");
      assert.equal(shifted.note, "Opened on 28 July.");
    },
  );

  it(
    "reaches instants nested inside a recorded response",
    function givenNestedInstants_whenShifted_thenTheDeepOnesMoveToo() {
      // Given: a discover response carries instants inside sections, inside
      // items, and inside the tonight window itself. A shift that reached only
      // the top level would leave a page whose window and rows disagree about
      // what day it is.
      const shifted = shiftInstants(
        { sections: [{ stats: { window: { from: "2026-08-02T16:00:00.000Z" } } }] },
        86_400_000,
      );

      assert.equal(shifted.sections[0].stats.window.from, "2026-08-03T16:00:00.000Z");
    },
  );

  it(
    "is a no-op at zero, returning the value it was given",
    function givenNoOffset_whenShifted_thenNothingIsRebuilt() {
      const original = { createdAt: "2026-07-28T09:15:00.000Z" };
      assert.equal(shiftInstants(original, 0), original);
    },
  );
});

describe("offsetTo", () => {
  it(
    "lands the newest instant a set number of minutes BEFORE now",
    function givenANewestRow_whenOffset_thenItMovesToJustBeforeNow() {
      const now = new Date("2026-08-04T10:00:00.000Z");
      const offset = offsetTo("2026-07-28T09:15:00.000Z", TONIGHT_NOTES, now);

      // 90 minutes ago, at whatever hour the request happens to arrive.
      assert.equal(
        new Date(Date.parse("2026-07-28T09:15:00.000Z") + offset).toISOString(),
        "2026-08-04T08:30:00.000Z",
      );
    },
  );

  it(
    "never lands a row in the future, whatever the hour",
    function givenEveryHourOfTheDay_whenOffset_thenTheNewestRowIsAlwaysPast() {
      // Given: the bug this replaced. The target was a TIME OF DAY, so a set
      // slid onto 18:30 "today" was slid into the future for every hour before
      // it — twenty-five of thirty-four seeded rows were notes not yet written.
      // Nothing caught it because the window was forward-looking too, so two
      // wrongs agreed until the server counted a window ending now.
      const newest = "2026-07-28T09:15:00.000Z";

      for (let hour = 0; hour < 24; hour += 1) {
        const now = new Date(Date.UTC(2026, 7, 4, hour, 0, 0, 0));
        const landed = Date.parse(newest) + offsetTo(newest, TONIGHT_NOTES, now);

        assert.ok(landed <= now.getTime(), `row landed in the future at ${hour}:00`);
      }
    },
  );

  it(
    "shifts nothing when there is no newest instant to anchor on",
    function givenNoRows_whenOffset_thenItIsZero() {
      assert.equal(offsetTo(undefined, TONIGHT_NOTES, new Date()), 0);
    },
  );
});

describe("newestOf", () => {
  it(
    "reads the latest value rather than trusting row order",
    function givenUnorderedRows_whenAsked_thenTheLatestIsFound() {
      // Given: anchoring on "the last row" would silently point at the wrong one
      // the moment a seed grew or was reordered.
      const rows = [{ at: "2026-07-20" }, { at: "2026-07-28" }, { at: "2026-07-24" }];
      assert.equal(newestOf(rows, (row) => row.at), "2026-07-28");
    },
  );
});

describe("the samples, as of tonight", () => {
  it(
    "puts room notes and activities inside the window the front page counts",
    function givenTheSeeds_whenRead_thenTonightHasBothKinds() {
      // Given: `bottlesOpened` counts notes AND activities. With one kind in the
      // window it equals `notesWritten` — the same figure under two labels.
      const window = roomWindow();
      const notes = socialSamples.tastingNotes.filter((note) => within(note.createdAt, window));
      const activities = socialSamples.activities.filter((a) => within(a.createdAt, window));

      assert.ok(notes.length > 0, "no note landed in the room's window");
      assert.ok(activities.length > 0, "no activity landed in the room's window");
    },
  );

  it(
    "seeds nothing that has not happened yet",
    function givenTheSeeds_whenRead_thenNoRowIsDatedInTheFuture() {
      // Given: the failure that made the window change necessary. A fixture
      // carrying notes written tomorrow is wrong on its own terms, and it was
      // invisible for as long as the window it fed was forward-looking too.
      const now = Date.now();
      const ahead = [...socialSamples.tastingNotes, ...socialSamples.activities].filter(
        (row) => Date.parse(row.createdAt) > now,
      );

      assert.equal(ahead.length, 0, `${ahead.length} seeded rows are dated in the future`);
    },
  );

  it(
    "dates the recorded discover response so its window closes on now",
    function givenTheFixture_whenRead_thenItsWindowIsTheRollingOne() {
      // Given: a recorded response records its clock too. Replayed unshifted it
      // showed a standing column the server could not reproduce on any other
      // day — a double and a backend disagreeing about WHEN, not about shape.
      const tonight = createDiscover().sections.find((s) => s.type === "tonight_stats");
      assert.ok(tonight, "the fixture still carries a tonight_stats section");

      const { from, to } = tonight.stats.window;
      const spanHours = (Date.parse(to) - Date.parse(from)) / 3600_000;
      const closedMinutesAgo = (Date.now() - Date.parse(to)) / 60_000;

      assert.equal(spanHours, 24, "the recorded window is no longer a rolling day");
      assert.ok(closedMinutesAgo >= 0, "the window closes in the future");
      assert.ok(closedMinutesAgo < 30, "the window closed too long ago to be 'now'");
    },
  );

  it(
    "keeps the room's own chronology while moving it",
    function givenTheNotes_whenShifted_thenTheirOrderAndSpreadSurvive() {
      // Given: one offset per set, so the ledger's day grouping still means
      // afterwards what it meant before.
      const days = new Set(
        socialSamples.tastingNotes.map((note) => note.createdAt.slice(0, 10)),
      );
      assert.ok(days.size > 1, "the corpus still spans more than a single day");
    },
  );
});
