import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CellarFirstMetContract,
  CellarHoldingContract,
  CellarRouteProjectionContract
} from "../../dist/cellar/test-doubles/index.js";

/**
 * The cellar's route projection, and the one way it can go badly wrong.
 *
 * The cellar is the surface that tells a member what they OWN. Putting seven wines
 * they merely tasted underneath thirty-four bottles they hold is useful right up to
 * the moment somebody totals the two — and then the app is claiming possession of
 * wine that was poured into a glass and drunk standing up.
 *
 * A type cannot assert that nobody adds two numbers together. What it can do is
 * refuse to carry the field that would make the sum look reasonable, and these
 * tests are what keep that absence from being "fixed" by a future reader who
 * assumes it was an oversight.
 */
describe("the cellar's route projection", () => {
  it(
    "gives a met wine no bottle count, so it cannot be rendered as a holding",
    function givenEveryMetWine_whenInspected_thenNoneCarriesPossession() {
      // Given: a count of bottles is the one fact that means ownership, and the
      // cellar entry is the only shape in the package entitled to carry it. Price,
      // acquisition and the private note are the same kind of fact and are absent
      // for the same reason.
      const forbidden = ["bottles", "paidPrice", "acquiredAt", "note", "entry"];

      for (const make of factories()) {
        for (const group of make().groups) {
          for (const met of group.items) {
            for (const field of forbidden) {
              assert.ok(
                !(field in met),
                `a wine met on a route must not carry "${field}" — that is a fact about a bottle somebody owns`
              );
            }
          }
        }
      }
    }
  );

  it(
    "counts wines, and the cellar counts bottles",
    function givenAProjectionAndAHolding_whenCompared_thenTheNumbersCountDifferentThings() {
      // Given: "7 wines" and "34 bottles" are two answers to two questions. The
      // projection states its own total rather than letting a client count `groups`,
      // because the groups page and the header does not — a client that counted what
      // it had would label the section with its own page size.
      const projection = CellarRouteProjectionContract.StubFactory.make();
      const holding = CellarHoldingContract.StubFactory.make();

      // Then: the projection's number is wines...
      assert.equal(typeof projection.wineCount, "number");
      assert.ok(!("bottleCount" in projection), "there are no bottles here to count");

      // ...and the only bottle count in the cellar belongs to a holding's entry.
      assert.equal(typeof holding.entry.bottles, "number");

      // And the projection's own total is not the length of what it happens to carry.
      const carried = projection.groups.flatMap((group) => group.items).length;
      assert.notEqual(
        projection.wineCount,
        carried,
        "a fixture where the total equals the page teaches a consumer to count the page"
      );
    }
  );

  it(
    "sends each stop's position, because a silent stop pours nothing",
    function givenARouteWithSilentStops_whenItsWinesAreRead_thenOrdinalsSkip() {
      // Given: on the tram, stops 1, 4 and 5 poured; stop 2 was the tram itself and
      // stop 3 was lunch. So this list is the WINES and not the stops, and its
      // positions run 1, 4, 5 with nothing between. A consumer that numbers the rows
      // itself labels the Môreson wine "stop 2" and sends a member to the wrong
      // estate.
      const [group] = CellarRouteProjectionContract.StubFactory.makeWithSkippedStops().groups;
      const ordinals = group.items.map((met) => met.stopOrdinal);

      // Then
      assert.deepEqual([...ordinals].sort((a, b) => a - b), [1, 4, 5]);
      assert.notDeepEqual(
        ordinals,
        group.items.map((_, i) => i + 1),
        "row index is not route position, and a fixture where they match hides it"
      );
    }
  );

  it(
    "keeps a met wine after the catalogue drops it",
    function givenADelistedWine_whenItWasMetOnARoute_thenTheRowStillStands() {
      // Given: withdrawing a wine from the catalogue does not unhappen the afternoon
      // somebody drank it. The row renders from the place it was met at and the stop
      // it came from — exactly as a delisted HOLDING renders from what the member
      // typed.
      const [group] = CellarRouteProjectionContract.StubFactory.makeDelisted().groups;
      const [met] = group.items;

      // Then
      assert.equal(met.wine, null);
      assert.equal(met.stopOrdinal, 1);
      // And the place it was met at is a PROPER NOUN, carried as canonical text —
      // the same word in Cape Town and in Québec, and never stemmed by the index.
      assert.deepEqual(met.placeName, { source: "canonical", text: "Grande Provence" });
    }
  );

  it(
    "groups by route, because the question is where and not what",
    function givenTheProjection_whenRead_thenItHoldsMoreThanOneRouteAndNamesEach() {
      // Given: a flat list of wines answers "what have I tasted". What a member
      // actually asks is "where did I have that", so the rows are grouped under the
      // day they happened. A single-group fixture never renders a second heading.
      const projection = CellarRouteProjectionContract.StubFactory.make();

      // Then
      assert.ok(projection.groups.length > 1, "one group cannot exercise grouping");
      for (const group of projection.groups) {
        assert.ok(group.itineraryTitle, "the title is denormalized so a heading needs no fetch");
        assert.ok(group.itineraryId);
      }
    }
  );

  it(
    "survives a route whose stops carry no dates",
    function givenADraftRoute_whenProjected_thenTheGroupHasNoDateAndStillRenders() {
      // Given: a group's date is its earliest stop's day, and a draft has none. In
      // practice a draft has poured nothing so this group would not be sent — the
      // double exists so a consumer that formats the heading date unconditionally
      // fails here rather than in front of a member.
      const [group] = CellarRouteProjectionContract.StubFactory.makeUndatedRoute().groups;

      // Then
      assert.equal(group.date, undefined);
      assert.ok(group.itineraryTitle, "a dateless group still has a heading to draw");
    }
  );
});

describe("where a bottle was first met", () => {
  it(
    "is absent on most of a cellar, and that is not a gap",
    function givenTheBaseHolding_whenRead_thenItHasNoRouteProvenance() {
      // Given: bought on recommendation, sent by a friend, inherited. A client that
      // treats the absence as missing data draws an empty provenance line under
      // almost every bottle a member owns.
      const holding = CellarHoldingContract.StubFactory.make();

      // Then
      assert.equal(holding.firstMet, undefined);
    }
  );

  it(
    "sits beside possession and never instead of it",
    function givenABottleMetOnARoute_whenRead_thenItStillCarriesWhatTheMemberOwns() {
      // Given: the route did not put the bottle in the cellar — the member bought it
      // on the way home. Provenance is an extra line on a holding, and a consumer
      // that renders this row without its bottle count has read a projection into a
      // holding.
      const holding = CellarHoldingContract.StubFactory.makeFirstMetOnRoute();

      // Then
      assert.equal(holding.firstMet.itineraryTitle, "The Franschhoek tram, in one day");
      assert.equal(holding.firstMet.stopOrdinal, 1);
      assert.equal(holding.entry.bottles, 2, "the bottles are still the member's");
      assert.ok(holding.entry.acquiredAt, "and they arrived on a date the member owns");
    }
  );

  it(
    "credits the earlier DAY, not the route published first",
    function givenTwoMeetings_whenRanked_thenTheStopsDateDecides() {
      // Given: this is the entire argument for a stop carrying a day. Ranked by the
      // stop's date, the tram in July wins. Ranked by anything else available — the
      // route's `createdAt`, the note's — the Swartland weekend written up first
      // would steal credit from the afternoon that earned it.
      const first = CellarFirstMetContract.StubFactory.make();
      const later = CellarFirstMetContract.StubFactory.makeLaterMeeting();

      // Then
      assert.ok(first.date < later.date, "the fixture must actually span two days");
      const earliest = [later, first].sort((a, b) => a.date.localeCompare(b.date))[0];
      assert.equal(earliest.itineraryId, first.itineraryId);
    }
  );
});

/** Every projection factory — each state a member's cellar can be in. */
function factories() {
  return Object.values(CellarRouteProjectionContract.StubFactory).filter(
    (value) => typeof value === "function"
  );
}
