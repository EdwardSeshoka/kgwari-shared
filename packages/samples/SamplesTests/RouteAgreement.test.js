import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CellarFirstMetContract,
  CellarHoldingContract,
  CellarRouteProjectionContract
} from "@edwardseshoka/contracts/cellar/test-doubles";
import { ContributionCountContract } from "@edwardseshoka/contracts/contributions/test-doubles";
import {
  CELLAR_RULES,
  CHIP_RULES,
  FIRST_MET_RULES,
  LEDGER_RULES,
  ROUTE_CARD_RULES,
  ROUTE_STOP_RULES,
  RouteAgreementError
} from "@edwardseshoka/contracts/spec";

import {
  collectionsSamples,
  createCollectionDetail,
  createDiscover,
  createWines,
  provenanceSamples,
  socialSamples
} from "../dist/index.js";

/**
 * This repo's half of a two-repo rule.
 *
 * The rules themselves are published from `@edwardseshoka/contracts/spec`, so the
 * backend imports the same functions rather than a copy of them. This file is only the
 * WIRING: it supplies seeds where the backend supplies real endpoint responses.
 *
 * ## Why it iterates the records
 *
 * Iterating is the opt-in to future strictness — a rule added in a later version runs
 * here without anybody remembering to call it, which is exactly what this repo wants:
 * the seeds are the reference corpus, so a rule they cannot satisfy is a rule worth
 * arguing about before it reaches a consumer.
 *
 * A consumer that needs to decline one names its subset instead. Nothing here is a
 * skip flag, because a rule that can be switched off silently reads as passing when it
 * is disabled.
 *
 * ## Why some inputs are doubles
 *
 * Routes, notes and the ledger come from the seeds. The cellar projection and the
 * contribution chips have no fixture — nothing in this repo composes a cellar — so
 * they are assembled from the published `StubFactory` doubles, which the backend also
 * has. When a cellar fixture arrives, this wiring changes and the rules do not.
 */
describe("the published route rules, run over the seeds", () => {
  const routes = collectionsSamples.itinerariesLanding.items;

  it(
    "satisfies every card rule, for every seeded route",
    function givenEveryRoute_whenEveryCardRuleRuns_thenNoneFails() {
      assert.ok(routes.length > 0, "no routes to run the rules over");

      for (const card of routes) {
        const input = { card, detail: createCollectionDetail(card.id) };
        for (const [name, rule] of Object.entries(ROUTE_CARD_RULES)) {
          assert.doesNotThrow(() => rule(input), `${name} failed on ${card.id}`);
        }
      }
    }
  );

  it(
    "satisfies every stop rule, for every seeded route",
    function givenEveryRoute_whenEveryStopRuleRuns_thenNoneFails() {
      const producerIds = new Set(provenanceSamples.producers.map((producer) => producer.id));
      const wineIds = new Set(createWines().map((wine) => wine.id));

      for (const card of routes) {
        const input = { detail: createCollectionDetail(card.id), producerIds, wineIds };
        for (const [name, rule] of Object.entries(ROUTE_STOP_RULES)) {
          assert.doesNotThrow(() => rule(input), `${name} failed on ${card.id}`);
        }
      }
    }
  );

  it(
    "satisfies every ledger rule, for the Latest run and the note corpus",
    function givenTheLedgerAndCorpus_whenEveryLedgerRuleRuns_thenNoneFails() {
      const ledger = createDiscover().sections.find((section) => section.type === "contributions");
      assert.ok(ledger, "no Latest ledger in the masthead");

      const noteCountByWine = new Map(createWines().map((wine) => [wine.id, wine.noteCount]));
      const input = {
        rows: ledger.items,
        notes: socialSamples.tastingNotes,
        noteCountFor: (wineVintageId) => noteCountByWine.get(wineVintageId)
      };

      for (const [name, rule] of Object.entries(LEDGER_RULES)) {
        assert.doesNotThrow(() => rule(input), `${name} failed`);
      }
    }
  );

  it(
    "satisfies every chip rule, driven from the published double",
    function givenAChipRow_whenEveryChipRuleRuns_thenNoneFails() {
      // The chips and the notes behind them have to be a matched pair, so the notes are
      // synthesised to the double's own numbers — twelve standalone, four on routes. A
      // real member's stream supplies both from one query.
      const counts = ContributionCountContract.StubFactory.makeChipRow();
      const chip = counts.find((entry) => entry.kind === "note");
      const notes = [
        ...Array.from({ length: chip.count }, (_, i) => ({
          id: `note_${i}`,
          wineVintageId: "rubicon-2018"
        })),
        ...Array.from({ length: chip.nestedCount }, (_, i) => ({
          id: `note_route_${i}`,
          wineVintageId: "rubicon-2018",
          origin: {
            itineraryId: "collection_two_days_in_stellenbosch",
            itineraryTitle: "Two days in Stellenbosch",
            stopId: `collection_two_days_in_stellenbosch__stop-${i + 1}`
          }
        }))
      ];

      for (const [name, rule] of Object.entries(CHIP_RULES)) {
        assert.doesNotThrow(() => rule({ counts, notes }), `${name} failed`);
      }
    }
  );

  it(
    "satisfies every cellar rule, driven from the published doubles",
    function givenACellarWithAProjection_whenEveryCellarRuleRuns_thenNoneFails() {
      const cellar = {
        items: [
          CellarHoldingContract.StubFactory.make(),
          CellarHoldingContract.StubFactory.makeFirstMetOnRoute()
        ],
        metOnRoutes: CellarRouteProjectionContract.StubFactory.make()
      };

      for (const [name, rule] of Object.entries(CELLAR_RULES)) {
        assert.doesNotThrow(() => rule({ cellar }), `${name} failed`);
      }
    }
  );

  it(
    "credits the earlier day when a wine was met twice",
    function givenTwoMeetings_whenTheRuleRuns_thenTheStopsDateDecides() {
      const first = CellarFirstMetContract.StubFactory.make();
      const later = CellarFirstMetContract.StubFactory.makeLaterMeeting();

      FIRST_MET_RULES.creditsTheEarlierDay({ meetings: [later, first], credited: first });
    }
  );
});

/**
 * The rules, failing.
 *
 * A spec nobody has watched fail is a spec you do not know works. Each of these breaks
 * one rule and asserts that the ONE rule named it — which is also what makes the
 * records worth decomposing: a bundled assertion could only ever report the first
 * thing it happened to check.
 */
describe("the published route rules, caught failing", () => {
  const documented = collectionsSamples.itinerariesLanding.items.find(
    (route) => route.mode === "documented"
  );

  it(
    "names the rule when a tally drifts from its page",
    function givenADriftedTally_whenTheRuleRuns_thenItNamesItself() {
      // The regression a backend actually hits: a stored `contents` that stopped
      // matching the stops after one was removed.
      const detail = createCollectionDetail(documented.id);
      const drifted = {
        ...documented,
        contents: { ...documented.contents, wines: documented.contents.wines + 1 }
      };

      const error = captureFailure(() => ROUTE_CARD_RULES.tallyMatchesStops({ card: drifted, detail }));
      assert.equal(error.rule, "tallyMatchesStops");
      assert.match(error.message, /its stops hold/);
    }
  );

  it(
    "names the rule when a count stops matching the stops",
    function givenADriftedCount_whenTheRuleRuns_thenItNamesItself() {
      const detail = createCollectionDetail(documented.id);
      const drifted = { ...documented, itemCount: documented.itemCount + 1 };

      const error = captureFailure(() => ROUTE_CARD_RULES.itemCountEqualsStops({ card: drifted, detail }));
      assert.equal(error.rule, "itemCountEqualsStops");
    }
  );

  it(
    "names the rule when a route note reaches a stream",
    function givenALeakedNote_whenTheRuleRuns_thenItNamesItself() {
      // One producer of one stream forgets the `origin` filter and nine notes from one
      // afternoon land in Latest.
      const rows = [
        {
          id: "contribution_leaked",
          kind: "note",
          note: {
            id: "tasting-note_leaked",
            origin: {
              itineraryId: "collection_two_days_in_stellenbosch",
              itineraryTitle: "Two days in Stellenbosch",
              stopId: "collection_two_days_in_stellenbosch__stop-1"
            }
          }
        }
      ];

      const error = captureFailure(() =>
        LEDGER_RULES.routeNotesTakeNoRow({ rows, notes: [], noteCountFor: () => 0 })
      );
      assert.equal(error.rule, "routeNotesTakeNoRow");
    }
  );

  it(
    "names the rule when a met wine grows a bottle count",
    function givenAMetWineWithBottles_whenTheRuleRuns_thenItNamesItself() {
      // The one that matters most, because it would look like a helpful addition.
      const projection = CellarRouteProjectionContract.StubFactory.make();
      const [group] = projection.groups;
      const cellar = {
        items: [CellarHoldingContract.StubFactory.make()],
        metOnRoutes: {
          ...projection,
          groups: [{ ...group, items: [{ ...group.items[0], bottles: 0 }] }]
        }
      };

      const error = captureFailure(() => CELLAR_RULES.metWineCarriesNoPossession({ cellar }));
      assert.equal(error.rule, "metWineCarriesNoPossession");
      assert.match(error.message, /belongs to a bottle somebody holds/);
    }
  );

  it(
    "names the rule when first-met credits the later route",
    function givenTheWrongMeeting_whenTheRuleRuns_thenItNamesItself() {
      const first = CellarFirstMetContract.StubFactory.make();
      const later = CellarFirstMetContract.StubFactory.makeLaterMeeting();

      const error = captureFailure(() =>
        FIRST_MET_RULES.creditsTheEarlierDay({ meetings: [first, later], credited: later })
      );
      assert.equal(error.rule, "creditsTheEarlierDay");
      assert.match(error.message, /rank by the stop's day/);
    }
  );

  it(
    "throws a typed error, so a consumer can tell a rule failure from a bug",
    function givenAFailure_whenCaught_thenItIsARouteAgreementError() {
      // Plain `Error` rather than `node:assert`, so the spec ships in a package the
      // frontend bundles and works under any test runner. The subclass is what lets a
      // consumer distinguish "a rule failed" from "the spec itself blew up".
      const error = captureFailure(() =>
        ROUTE_CARD_RULES.subjectIsStops({ card: { id: "x", subject: "wines" }, detail: { items: [] } })
      );

      assert.ok(error instanceof RouteAgreementError);
      assert.equal(error.name, "RouteAgreementError");
      assert.equal(error.rule, "subjectIsStops");
    }
  );
});

/** Runs a rule expecting it to fail, and hands back the failure. */
function captureFailure(run) {
  try {
    run();
  } catch (error) {
    if (error instanceof RouteAgreementError) return error;
    throw error;
  }
  throw new Error("the rule passed, but the input was supposed to break it");
}
