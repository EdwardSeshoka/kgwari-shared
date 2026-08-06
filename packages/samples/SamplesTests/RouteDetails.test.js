import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  collectionsSamples,
  createCollectionDetail,
  createDiscover,
  createRouteDetails,
  createWines,
  provenanceSamples,
  socialSamples
} from "../dist/index.js";

/**
 * Opening a route, and the two bugs a fixture like this exists to catch.
 *
 * The first is a dangling pointer: a stop naming an estate the provenance seed does
 * not carry, or pouring a wine the catalogue never had. That renders as a heading
 * over nothing, in every app double at once.
 *
 * The second is quieter and is the one this fixture was built to end. A card claims
 * a stop count and a tally of what is nested under those stops. Until the detail
 * existed, both were invented numbers and nothing in the repo could contradict them
 * — a route could say "9 wines" above a page that poured four. So the counts are now
 * DERIVED from the stops, and these tests are what keep them derived.
 */
describe("route details", () => {
  it(
    "gives every seeded collection a detail, and every detail a card",
    function givenTheFixture_whenCompared_thenTheTwoSetsAreTheSameIds() {
      // Given: the card has always said the ordered list belongs to the collection's
      // own endpoint. A card without one promises a page that does not exist; a detail
      // without a card is a page nothing can reach.
      const cardIds = collectionsSamples.collections.map((row) => row.id).sort();
      const detailIds = Object.keys(collectionsSamples.collectionDetails).sort();

      // Then
      assert.deepEqual(detailIds, cardIds);
    }
  );

  it(
    "throws on an id nothing carries, rather than handing back nothing",
    function givenAnUnknownId_whenAsked_thenItFailsAtTheCause() {
      // Given: a missing fixture is a bug in the fixture. Returning `undefined` makes
      // it surface as a blank page three layers from the cause.
      assert.throws(() => createCollectionDetail("collection_does_not_exist"), /not in the fixture/);
    }
  );

  it(
    "counts stops in itemCount, not places",
    function givenEveryRoute_whenItsStopsAreCounted_thenTheCardAgrees() {
      // Given: a route that has dinner where it started called at four places and made
      // five stops. The old estates-subject shape could report that only by listing an
      // estate twice or losing the evening, and this is the arithmetic that replaced
      // it. The card is handed the stops and counts them, so it cannot disagree.
      const routes = collectionsSamples.itinerariesLanding.items;
      assert.ok(routes.length > 0, "the fixture has to carry routes for this to mean anything");

      for (const route of routes) {
        const { items } = createCollectionDetail(route.id);
        assert.equal(
          route.itemCount,
          items.length,
          `${route.id}: card says ${route.itemCount} stops, detail has ${items.length}`
        );
        for (const item of items) {
          assert.equal(item.subject, "stops", `${route.id}: a route's rows are stops`);
        }
      }
    }
  );

  it(
    "has at least one route that calls at a place twice",
    function givenTheRoutes_whenPlacesAreCompared_thenOneHasFewerPlacesThanStops() {
      // Given: this is the case the whole redesign turns on. A fixture where every
      // route's stops and places are one-to-one teaches a consumer that a stop IS an
      // estate, which is the reading `subject: "stops"` exists to correct.
      const doublesBack = createRouteDetails().some((detail) => {
        const places = new Set(detail.items.map((item) => item.stop.place.id));
        return places.size < detail.items.length;
      });

      // Then
      assert.ok(doublesBack, "no route returns to an estate — the arithmetic goes untested");
    }
  );

  it(
    "tallies exactly what its stops hold, and only when the day happened",
    function givenEveryRoute_whenItsContentsAreChecked_thenTheyMatchTheStops() {
      // Given: `contents` is the card's sub-line — "5 stops · 9 wines · 4 notes". It
      // counts what is nested INSIDE the stops, which is not a second subject, and it
      // must be absent on a plan: "0 wines · 0 notes" turns an itinerary somebody has
      // not driven yet into an empty diary.
      for (const route of collectionsSamples.itinerariesLanding.items) {
        const { items } = createCollectionDetail(route.id);
        const wines = items.reduce((total, item) => total + (item.stop.wines?.length ?? 0), 0);
        const notes = items.reduce((total, item) => total + (item.stop.notes?.length ?? 0), 0);

        if (route.mode === "planned") {
          assert.equal(route.contents, undefined, `${route.id} is a plan and has nothing to tally`);
          assert.equal(wines, 0, `${route.id} is a plan, so nothing was poured on it`);
          assert.equal(notes, 0, `${route.id} is a plan, so nothing was written on it`);
          continue;
        }

        assert.deepEqual(
          route.contents,
          { wines, notes },
          `${route.id}: the sub-line disagrees with the page it opens`
        );
      }
    }
  );

  it(
    "points every stop at an estate the provenance seed carries",
    function givenEveryStop_whenResolved_thenItsPlaceExists() {
      // Given: a stop is somewhere you are going, so it needs its own page to open
      // onto. A route naming an estate the catalogue does not hold is a detail page
      // whose every heading leads nowhere — the failure a hand-maintained fixture had.
      const estateIds = new Set(provenanceSamples.producers.map((producer) => producer.id));

      for (const detail of createRouteDetails()) {
        for (const { stop } of detail.items) {
          assert.ok(
            estateIds.has(stop.place.id),
            `${stop.id} calls at "${stop.place.id}", which no producer sample carries`
          );
        }
      }
    }
  );

  it(
    "pours only wines the catalogue holds",
    function givenEveryPour_whenResolved_thenItsVintageExists() {
      // Given: a stop carries the domain's own contract rather than an id, so a row on
      // a route and the same wine in a search result cannot disagree about what it is.
      // That only holds if the wine came FROM the catalogue.
      const vintageIds = new Set(createWines().map((wine) => wine.id));

      for (const detail of createRouteDetails()) {
        for (const { stop } of detail.items) {
          for (const wine of stop.wines ?? []) {
            assert.ok(vintageIds.has(wine.id), `${stop.id} pours "${wine.id}", which is not in the catalogue`);
          }
        }
      }
    }
  );

  it(
    "keys the card's strip on stops the detail actually has",
    function givenEveryRoutesPreview_whenResolved_thenEachEntryIsAStopOnThatRoute() {
      // Given: the strip is keyed on the STOP and captioned with the place, because a
      // route can call at one estate twice and a strip keyed on the producer would
      // silently draw one plate for two stops. If the ids drift, a member taps a plate
      // and lands nowhere.
      for (const route of collectionsSamples.itinerariesLanding.items) {
        const { items } = createCollectionDetail(route.id);
        const stopIds = new Set(items.map((item) => item.stop.id));

        for (const entry of route.preview ?? []) {
          assert.ok(
            stopIds.has(entry.contentId),
            `${route.id}: strip points at "${entry.contentId}", which is not a stop on it`
          );
        }
      }
    }
  );

  it(
    "carries a stop that poured nothing, and a stop with an evening",
    function givenTheRoutes_whenScanned_thenTheQuietAndTheBookedStatesArePresent() {
      // Given: the two states a consumer gets wrong. Lunch is a complete stop and
      // renders with no tasting list at all; an evening is a REFERENCE with no
      // admission, price or seat on it, because Kgwari does not take the booking.
      const stops = createRouteDetails().flatMap((detail) => detail.items.map((item) => item.stop));

      const silent = stops.filter((stop) => stop.wines === undefined && stop.event === undefined);
      const withEvent = stops.filter((stop) => stop.event !== undefined);

      // Then
      assert.ok(silent.length > 0, "no quiet stop — the empty-tasting-list path is untested");
      assert.ok(withEvent.length > 0, "no stop with an evening — the event ref is untested");

      for (const stop of withEvent) {
        for (const field of ["admission", "price", "seats", "capacity", "booking"]) {
          assert.ok(!(field in stop.event), `${stop.id}: an event ref must not carry "${field}"`);
        }
        // The title is negotiated text — the tag rides WITH the words, so nothing has
        // to remember to look for a second field.
        assert.equal(stop.event.title.source, "negotiated");
        assert.ok(stop.event.title.text);
        assert.ok(stop.event.title.languageTag);
      }
    }
  );

  it(
    "dates its stops as calendar DAYS, and spans two where the title says so",
    function givenEveryStop_whenItsDateIsRead_thenItIsADayAndTheLongRouteCoversTwo() {
      // Given: a day and not an instant — two stops at one estate on one day are told
      // apart by their position, not by the clock, so sub-day precision buys nothing
      // and costs the whole timezone question.
      for (const detail of createRouteDetails()) {
        for (const { stop } of detail.items) {
          assert.match(stop.date, /^\d{4}-\d{2}-\d{2}$/, `${stop.id} is not a calendar day`);
        }
      }

      // And a route called "Two days in Stellenbosch" had better cover two.
      const twoDays = createCollectionDetail("collection_two_days_in_stellenbosch");
      const days = new Set(twoDays.items.map((item) => item.stop.date));
      assert.equal(days.size, 2, "the heading says two days — the stops have to agree");
    }
  );

  it(
    "opens a shelf onto wines, so the fixture teaches more than one arm",
    function givenAShelfsDetail_whenRead_thenItsRowsAreWinesAndTheStripIsHonoured() {
      // Given: a fixture holding only routes would teach a consumer that `items` is
      // always stops. The endpoint is one shape with three arms, and this is the other
      // seeded one — `estates` stays absent because it is reachable only from a Lens.
      const [shelf] = collectionsSamples.shelvesLanding.items;
      const { items } = createCollectionDetail(shelf.id);

      // Then
      assert.equal(items.length, shelf.itemCount, "the card's count is the page's length");
      for (const item of items) {
        assert.equal(item.subject, "wines");
      }
      // A member who tapped a label on the strip has to find it on the page.
      const onPage = new Set(items.map((item) => item.wine.id));
      for (const entry of shelf.preview ?? []) {
        assert.ok(onPage.has(entry.contentId), `${shelf.id}: "${entry.contentId}" is not on its own page`);
      }
    }
  );
});

/**
 * The notes written on routes, and the one rule they exist to demonstrate.
 *
 * Suppressing the LEDGER row is not suppressing the NOTE. These are real opinions
 * about real vintages: they count on their wines and feed the register exactly as a
 * standalone note does. What they must never do is take a row of their own in
 * Latest, because publishing the route was one act.
 */
describe("notes written on a route", () => {
  it(
    "are in the note corpus, carrying their origin",
    function givenTheCorpus_whenScanned_thenSomeNotesDeclareTheRouteTheyCameFrom() {
      // Given: a note written on the tram is a full opinion about a vintage. Keeping it
      // out of the corpus would be the easy way to keep it out of the ledger, and it
      // would silently drop it from the wine's own page too.
      const fromRoutes = socialSamples.tastingNotes.filter((note) => note.origin !== undefined);

      assert.ok(fromRoutes.length > 0, "no route notes in the corpus — the rule has nothing to act on");
      const routeIds = new Set(collectionsSamples.collections.map((row) => row.id));
      for (const note of fromRoutes) {
        assert.ok(routeIds.has(note.origin.itineraryId), `${note.id} points at a route nothing carries`);
        assert.ok(note.origin.itineraryTitle, `${note.id} has no title for its breadcrumb`);
        assert.ok(note.origin.stopId, `${note.id} has no stop`);
      }
    }
  );

  it(
    "names the route it came from, matching that route's own title",
    function givenEveryRouteNote_whenItsBreadcrumbIsRead_thenItAgreesWithTheCard() {
      // Given: the title is denormalized so a note's page can say "from Two days in
      // Stellenbosch" without a second request. Denormalized means it can drift, and
      // this is the test that says it has not.
      const titleById = new Map(collectionsSamples.collections.map((row) => [row.id, row.title]));

      for (const note of socialSamples.tastingNotes) {
        if (note.origin === undefined) continue;
        assert.equal(
          note.origin.itineraryTitle,
          titleById.get(note.origin.itineraryId),
          `${note.id}: the breadcrumb disagrees with the route's own title`
        );
      }
    }
  );

  it(
    "never takes a row of its own in Latest",
    function givenTheLedger_whenItsNoteRowsAreRead_thenNoneCameFromARoute() {
      // Given: nine notes from one afternoon would bury the room under one person's
      // Saturday. The route's row stands for the day — one act, one row — and this is
      // the fixture-level proof that the filter is applied rather than remembered at
      // each call site.
      const ledger = createDiscover().sections.find((section) => section.type === "contributions");
      assert.ok(ledger, "no Latest ledger in the masthead — the rule has nowhere to fail");

      const noteRows = ledger.items.filter((row) => row.kind === "note");
      assert.ok(noteRows.length > 0, "a ledger with no note rows cannot exercise the filter");

      for (const row of noteRows) {
        assert.equal(
          row.note.origin,
          undefined,
          `${row.id} is a note written on a route — the route's own row already speaks for it`
        );
      }
    }
  );

  it(
    "still counts on the wine it is about",
    function givenARouteNote_whenItsWineIsRead_thenTheWinesNoteCountIncludesIt() {
      // Given: the sentence to read twice. The ledger records ACTS and a wine's page
      // records OPINIONS — so a note kept out of Latest is still fully present on the
      // vintage it judges. Keeping it out of the corpus would have been the easy way to
      // keep it out of the ledger, and it would have silently dropped it here.
      const winesById = new Map(createWines().map((wine) => [wine.id, wine]));
      const fromRoutes = socialSamples.tastingNotes.filter((note) => note.origin !== undefined);

      const counted = socialSamples.tastingNotes.reduce((tally, note) => {
        tally.set(note.wineVintageId, (tally.get(note.wineVintageId) ?? 0) + 1);
        return tally;
      }, new Map());

      for (const note of fromRoutes) {
        const wine = winesById.get(note.wineVintageId);
        assert.ok(wine, `${note.id} judges "${note.wineVintageId}", which is not in the catalogue`);
        assert.ok(
          (wine.noteCount ?? 0) >= counted.get(note.wineVintageId),
          `${wine.id}: noteCount is ${wine.noteCount} but the corpus holds ${counted.get(note.wineVintageId)} notes on it`
        );
      }
    }
  );
});
