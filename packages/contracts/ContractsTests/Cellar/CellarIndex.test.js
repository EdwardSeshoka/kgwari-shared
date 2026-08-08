import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CellarSummaryContract,
  GetCellarIndexResponse
} from "../../dist/cellar/test-doubles/index.js";
import { CollectionContract } from "../../dist/collections/test-doubles/index.js";
import { CELLAR_INDEX_RULES } from "../../dist/spec/index.js";

/**
 * The cellar home's rules, as opposed to its shape.
 *
 * A type checks the shape and says nothing about the decisions that actually govern
 * this contract — and almost all of them are ABSENCES, which is exactly what a type
 * cannot assert. A suppressed price band, an omitted section, a door with no words:
 * every one of those is a field that is simply not there, and "not there" typechecks
 * whether it was a decision or an oversight.
 */
describe("the cellar index's figures", () => {
  it(
    "sends the counts even when the figure line is suppressed",
    function givenALaunchCellar_whenTheSummaryIsRead_thenTheCountsSurvive() {
      const { summary } = GetCellarIndexResponse.StubFactory.makeLaunch();

      // The page still opens on a sentence about them.
      assert.equal(summary.bottles, 6);
      assert.equal(summary.wines, 6);
      // What is suppressed is the LINE, and the band with it.
      assert.equal(summary.figuresAvailable, false);
      assert.ok(!("priceBand" in summary) || summary.priceBand === undefined);
    }
  );

  it(
    "never carries a band once the figures are suppressed",
    function givenSuppressedFigures_whenTheBandIsSought_thenThereIsNone() {
      const index = GetCellarIndexResponse.StubFactory.makeLaunch();
      assert.doesNotThrow(() => CELLAR_INDEX_RULES.suppressedFiguresCarryNoBand({ index }));
    }
  );

  it(
    "distinguishes a suppressed band from an unbandable cellar",
    function givenTwoCurrencies_whenTheBandIsSought_thenTheFiguresStillStand() {
      const summary = CellarSummaryContract.StubFactory.makeUnbanded();

      // The combination that proves the two are not one switch. A client reading a
      // missing band as "suppressed" tells this member their cellar is too small,
      // when in fact it is bought across two markets and nothing is ever converted.
      assert.equal(summary.figuresAvailable, true);
      assert.equal(summary.priceBand, undefined);
    }
  );

  it(
    "keeps bottles and wines as different numbers",
    function givenADeepCellar_whenTheFiguresAreCompared_thenTheyDisagree() {
      const { summary } = GetCellarIndexResponse.StubFactory.make();

      // 34 bottles across 28 wines. A fixture where the two were equal would let a
      // consumer that conflated them pass, and the drunk-and-kept row is exactly
      // what makes them differ.
      assert.notEqual(summary.bottles, summary.wines);
      assert.ok(summary.bottles > summary.wines);
    }
  );
});

describe("the cellar index's sections", () => {
  it(
    "describes the section rather than the page of it that arrived",
    function givenAPagedRun_whenItsCountIsRead_thenItExceedsTheRows() {
      const index = GetCellarIndexResponse.StubFactory.make();
      const shelves = index.sections.find((section) => section.kind === "shelves");

      // The head describes the section; the array is a page of it. A consumer that
      // renders `items.length` under the standfirst reports its own page size.
      assert.ok(shelves.count > shelves.items.length);
      assert.ok(shelves.nextCursor, "more to give and no cursor to get it with");
    }
  );

  it(
    "omits a run the member has nothing in",
    function givenAMemberWithNoRoutes_whenTheIndexIsRead_thenThereIsNoRoutesRun() {
      const index = GetCellarIndexResponse.StubFactory.makeWithoutRoutes();

      // Omitted, not empty. A heading over no rows asks a reader what they have lost.
      assert.equal(index.sections.some((section) => section.kind === "routes"), false);
      // And the door goes with it — a door is a figure that names a set.
      assert.equal(index.doors.some((door) => door.target.kind === "metOnRoutes"), false);
    }
  );

  it(
    "sends nothing at all for a cellar with nothing in it",
    function givenAnEmptyCellar_whenTheIndexIsRead_thenTheMastheadCarriesThePage() {
      const index = GetCellarIndexResponse.StubFactory.makeEmpty();

      assert.deepEqual(index.sections, []);
      assert.deepEqual(index.doors, []);
      assert.equal(index.summary.figuresAvailable, false);
    }
  );

  it(
    "carries a route's tense on the routes run",
    function givenTheRoutesRun_whenItsRowsAreRead_thenEachStatesItsMode() {
      const index = GetCellarIndexResponse.StubFactory.make();
      const routes = index.sections.find((section) => section.kind === "routes");

      // A plan and a record are opposite cards, and only `mode` says which. Both are
      // present, because a section that held one of the two would never have rendered
      // the other.
      const modes = routes.items.map((route) => route.mode);
      assert.ok(modes.includes("planned"));
      assert.ok(modes.includes("documented"));
    }
  );
});

describe("the cellar index's doors", () => {
  it(
    "gives a collection door the target's own words and a fixed door none",
    function givenBothKindsOfDoor_whenTheirWordsAreSought_thenOnlyOneCarriesThem() {
      const index = GetCellarIndexResponse.StubFactory.make();

      const lensDoor = index.doors.find((door) => door.target.kind === "collection");
      assert.equal(lensDoor.title, CollectionContract.StubFactory.makeLens().title);
      assert.deepEqual(lensDoor.rule, CollectionContract.StubFactory.makeLens().rule);

      // The routes and requests rows are named the same thing on every cellar in
      // every locale, so their name is chrome the client owns. A server sending it
      // would be shipping an English sentence to be printed verbatim.
      const routesDoor = index.doors.find((door) => door.target.kind === "metOnRoutes");
      assert.equal("title" in routesDoor, false);
      assert.equal("rule" in routesDoor, false);
    }
  );

  it(
    "counts wines on the routes door and bottles in the masthead",
    function givenBothFigures_whenComparedTheyAreDifferentUnits() {
      const index = GetCellarIndexResponse.StubFactory.make();
      const routesDoor = index.doors.find((door) => door.target.kind === "metOnRoutes");

      // 34 and 7. Nothing may add them: one is possession, the other an afternoon.
      assert.equal(index.summary.bottles, 34);
      assert.equal(routesDoor.count, 7);
    }
  );

  it(
    "keeps a door for the ledger that does not exist yet",
    function givenNoRequestLedger_whenTheIndexIsRead_thenTheRowIsStillDrawn() {
      const index = GetCellarIndexResponse.StubFactory.make();
      const requests = index.doors.find((door) => door.target.kind === "requests");

      // A door with a count and nowhere to go, deliberately: the row is part of the
      // page's argument, and shipping without it means re-opening the layout later.
      assert.ok(requests);
      assert.ok(requests.count > 0);
    }
  );
});

describe("the rules the cellar index publishes", () => {
  it(
    "hold over every state the doubles reach",
    function givenEveryFactory_whenEveryRuleRuns_thenNoneFails() {
      const indices = [
        GetCellarIndexResponse.StubFactory.make(),
        GetCellarIndexResponse.StubFactory.makeLaunch(),
        GetCellarIndexResponse.StubFactory.makeEmpty(),
        GetCellarIndexResponse.StubFactory.makeWithoutRoutes(),
        GetCellarIndexResponse.StubFactory.makeSprawling()
      ];

      for (const index of indices) {
        for (const [name, rule] of Object.entries(CELLAR_INDEX_RULES)) {
          assert.doesNotThrow(() => rule({ index }), `${name} failed`);
        }
      }
    }
  );
});
