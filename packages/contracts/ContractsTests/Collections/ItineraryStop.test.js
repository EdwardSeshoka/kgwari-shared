import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ITINERARY_MODES } from "../../dist/collections/index.js";
import {
  ItineraryStopContract,
  PlaceProgrammeContract
} from "../../dist/collections/test-doubles/index.js";

/**
 * A stop, and the two things about it a type cannot state.
 *
 * The shape says a stop has a place and may have wines, notes, an event and a day.
 * What it cannot say is that the ABSENCES mean opposite things in the two modes,
 * or that the day exists to settle an argument about which afternoon earned the
 * credit for a bottle. Both are decisions somebody can undo in one line believing
 * them accidents.
 */
describe("a stop on a route", () => {
  it(
    "owns no content of its own — every field points at something else",
    function givenEveryStopDouble_whenInspected_thenNothingIsProseOrArtwork() {
      // Given: the route is a spine. It references a producer, vintages, notes and an
      // event that all exist elsewhere, and it deliberately has nowhere to write a
      // remark about the place or attach a photograph of the view. A string here would
      // grow a language tag, then a verdict, and arrive at being a note by accretion —
      // with none of a note's moderation or authorship.
      const invented = ["account", "prose", "description", "media", "photo", "notesText"];

      for (const make of factories()) {
        const stop = make();
        for (const field of invented) {
          assert.ok(!(field in stop), `a stop must not own "${field}" — it owns nothing`);
        }
      }
    }
  );

  it(
    "carries a calendar DAY, never an instant",
    function givenADatedStop_whenRead_thenItIsADayWithNoClockOrZone() {
      // Given: two stops at one estate on one day are told apart by their position in
      // the route, not by the clock — so sub-day precision buys nothing and costs the
      // whole timezone question. A member says "the eighteenth", not 09:40 SAST.
      const stop = ItineraryStopContract.StubFactory.make();

      // Then
      assert.match(stop.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(!stop.date.includes("T"), "a day, so it cannot land on the wrong side of a zone");
    }
  );

  it(
    "has no day while it is still a draft",
    function givenADraftStop_whenRead_thenTheDayIsAbsentAndNothingInfersOne() {
      // Given: a member adds Meerlust before deciding which Saturday, which is why the
      // field is optional at all. A consumer needing a day falls back to the
      // itinerary's `createdAt` — it must not infer one from the stop's position, and
      // it must not draw an empty date line.
      const draft = ItineraryStopContract.StubFactory.makeUndated();

      // Then
      assert.equal(draft.date, undefined);
      assert.ok(draft.place, "it is still a stop — a place is the only thing required");
    }
  );

  it(
    "cannot say which tense it is in, so nothing may guess from emptiness",
    function givenAPlannedAndASilentStop_whenCompared_thenTheyAreIndistinguishable() {
      // Given: a planned stop poured nothing because it has not happened. A lunch
      // poured nothing because lunch is lunch. They are structurally identical, and
      // `mode` on the itinerary is the only thing that separates them — a consumer
      // inferring tense from an absent `wines` gets one of the two backwards every
      // time.
      const planned = ItineraryStopContract.StubFactory.makePlanned();
      const lunch = ItineraryStopContract.StubFactory.makeSilent();

      // Then
      for (const stop of [planned, lunch]) {
        assert.equal(stop.wines, undefined);
        assert.equal(stop.notes, undefined);
        assert.ok(!("mode" in stop), "tense belongs to the route, not to a stop");
      }
      assert.deepEqual(ITINERARY_MODES.slice(), ["planned", "documented"]);
    }
  );

  it(
    "removes its optionals rather than emptying them",
    function givenTheSilentStop_whenInspected_thenNothingIsAnEmptyArray() {
      // Given: `wines: []` would let a client that draws an empty tasting list pass,
      // and that list is a heading over nothing.
      const lunch = ItineraryStopContract.StubFactory.makeSilent();

      // Then
      assert.ok(!("wines" in lunch) || lunch.wines === undefined);
      assert.ok(!("notes" in lunch) || lunch.notes === undefined);
    }
  );

  it(
    "keeps the booking at the host's own address",
    function givenTheStopAtAnEvent_whenRead_thenNothingResemblesATransaction() {
      // Given: Kgwari does not take the booking, hold the stock or take the payment.
      // The ref names the evening and opens onto the event's own page, which is where
      // the host does. A consumer that finds a way to book from this fixture has found
      // a field that should not exist.
      const { event } = ItineraryStopContract.StubFactory.makeAtEvent();
      const forbidden = ["admission", "price", "seats", "capacity", "booking", "ticket"];

      // Then
      for (const field of forbidden) {
        assert.ok(!(field in event), `a stop's event ref must not carry "${field}"`);
      }
      // And the title is NEGOTIATED text: curated prose that states which language the
      // server actually landed on, so a client can badge a fallback instead of passing
      // it off as a translation. The tag rides with the text — there is no second field
      // to forget to read.
      assert.deepEqual(event.title, {
        source: "negotiated",
        text: "Wynhuis tramrit",
        languageTag: "af"
      });
      assert.ok(!("titleLanguage" in event), "the legacy pair is not inherited by a new contract");
    }
  );

  it(
    "notes written here declare where they came from",
    function givenTheStopsNotes_whenRead_thenEachCarriesItsOrigin() {
      // Given: the route's row stands for the day, so the ledger has to know which
      // notes it already speaks for. Declared on the note rather than joined by the
      // server — a shape a producer cannot construct beats a filter every stream has
      // to remember.
      const [note] = ItineraryStopContract.StubFactory.make().notes;

      // Then
      assert.equal(note.origin.stopId, "stop_1");
      assert.ok(note.origin.itineraryTitle, "denormalized, so the breadcrumb needs no fetch");
      // And the note is otherwise whole: suppressing the row is not suppressing it.
      assert.ok(note.verdict, "still a full opinion on the wine it is about");
      assert.ok(note.wineVintageId);
    }
  );
});

/**
 * The draft's stop picker — what is on at a place.
 *
 * The interesting cases are all the ones a suite forgets, because the happy path is
 * two evenings on a Saturday and everything else is absence.
 */
describe("what is on at a place", () => {
  it(
    "cannot be asked to look backwards",
    function givenTheProgrammeShape_whenRead_thenItsRowsAreExactlyAStopsEventRef() {
      // Given: there is no `until` and no `before` in the request — the only bound a
      // caller may state is where to start, clamped to today. A documented route names
      // evenings that are over, and a Book button on a past evening is the one thing
      // this feature must not be able to produce.
      //
      // What is checkable here is the other half of the trade: a row from the programme
      // is the identical shape a stop's `event` takes, so taking one is a copy and not
      // a transform. Nothing is mapped between asking and booking.
      const [offered] = PlaceProgrammeContract.StubFactory.make().items;
      const { event: taken } = ItineraryStopContract.StubFactory.makeAtEvent();

      // Then
      assert.deepEqual(Object.keys(offered).sort(), Object.keys(taken).sort());
    }
  );

  it(
    "answers nothing-on with an empty list, not an error",
    function givenAnEstateWithNothingListed_whenAsked_thenItemsIsEmptyAndPagingStops() {
      // Given: most estates have nothing listed for most weekends. A stop with no
      // programme is still a complete stop — you walk in. A client that renders "no
      // results" as a failure has turned that into a broken screen.
      const quiet = PlaceProgrammeContract.StubFactory.makeNothingOn();

      // Then
      assert.deepEqual(quiet.items, []);
      assert.equal(quiet.nextCursor, undefined, "nothing to page through");
    }
  );

  it(
    "offers evenings with no fixed start",
    function givenAWalkInCellarDoor_whenRead_thenItHasNoStartTime() {
      // Given: a cellar door runs all day, and `startDateTime` is the field a picker
      // most wants to sort and label by. A consumer that formats it unconditionally
      // prints "Invalid Date" here.
      const [untimed] = PlaceProgrammeContract.StubFactory.makeUntimed().items;

      // Then
      assert.equal(untimed.startDateTime, undefined);
      assert.ok(untimed.title, "it is still a bookable thing with a name");
      assert.ok(untimed.eventId);
    }
  );

  it(
    "offers more than one evening, so a picker is really a list",
    function givenTheBaseProgramme_whenRead_thenItHoldsTwoOnDifferentDays() {
      // Given: a fixture with a single option never exercises the list layout, and the
      // two here fall on different days — which is what a member planning a weekend is
      // actually choosing between.
      const { items } = PlaceProgrammeContract.StubFactory.make();

      // Then
      assert.ok(items.length > 1);
      const days = new Set(items.map((item) => item.startDateTime.slice(0, 10)));
      assert.ok(days.size > 1, "two evenings on one day is a weaker fixture than two days");
    }
  );
});

/** Every stop factory — each state a route can put a consumer in. */
function factories() {
  return Object.values(ItineraryStopContract.StubFactory).filter(
    (value) => typeof value === "function"
  );
}
