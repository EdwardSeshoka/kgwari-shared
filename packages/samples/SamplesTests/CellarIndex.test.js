import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CELLAR_INDEX_RULES, CellarIndexAgreementError } from "@edwardseshoka/contracts/spec";

import { collectionsSamples, createCellar, createCellarIndex, createWines } from "../dist/index.js";

/**
 * The cellar seed, held to the published rules.
 *
 * This repo's half of a two-repo agreement: the rules come from
 * `@edwardseshoka/contracts/spec`, so the backend runs the identical functions over
 * real endpoint responses. Only the WIRING differs — seeds here, `GET /cellar/index`
 * there.
 *
 * It iterates the record rather than naming a subset, which is the opt-in to future
 * strictness. A rule added in a later version runs here without anybody remembering
 * to call it, and the seeds are the reference corpus, so a rule they cannot satisfy
 * is a rule worth arguing about before it reaches a consumer.
 */
describe("the published cellar index rules, run over the seed", () => {
  const index = createCellarIndex();

  it(
    "satisfies every cellar index rule",
    function givenTheSeededIndex_whenEveryRuleRuns_thenNoneFails() {
      for (const [name, rule] of Object.entries(CELLAR_INDEX_RULES)) {
        assert.doesNotThrow(() => rule({ index }), `${name} failed`);
      }
    }
  );
});

/**
 * What the seed is FOR, as opposed to what it is shaped like.
 *
 * The rules above check a composer against itself. These check that the fixture
 * actually reaches the states somebody has to render — a fixture that satisfies every
 * rule while demonstrating nothing is the failure mode a generated seed is most prone
 * to, because every number in it agrees with every other by construction.
 */
describe("the cellar seed's own claims", () => {
  const index = createCellarIndex();
  const cellar = createCellar();

  it(
    "holds more bottles than wines, and keeps the drunk-and-kept on record",
    function givenTheHoldings_whenTheFiguresAreCompared_thenTheyCountDifferentThings() {
      const drunkAndKept = cellar.items.filter((holding) => holding.entry.bottles === 0);
      assert.ok(
        drunkAndKept.length > 0,
        "no holding with bottles: 0 — the state a client is most likely to treat as a deletion"
      );

      // `wines` counts them; `bottles` does not. That is the whole reason the
      // masthead carries two figures rather than one.
      assert.equal(index.summary.wines, cellar.items.length);
      assert.ok(index.summary.bottles > index.summary.wines);
    }
  );

  it(
    "counts wines met, not rows — the same bottle poured twice is one wine",
    function givenARouteThatDoubledBack_whenTheProjectionIsRead_thenWineCountIsDistinct() {
      const projection = cellar.metOnRoutes;
      assert.ok(projection, "no route projection in the seed");

      const rows = projection.groups.flatMap((group) => group.items);
      const distinct = new Set(rows.map((row) => row.wine.id));

      assert.ok(
        rows.length > distinct.size,
        "no wine met twice — the fixture cannot show that wineCount is sent rather than counted"
      );
      assert.equal(projection.wineCount, distinct.size);
    }
  );

  it(
    "never lists a wine as both met and held",
    function givenAWineBoughtAfterMeetingIt_whenBothListsAreRead_thenItAppearsOnce() {
      const held = new Set(cellar.items.map((holding) => holding.entry.wineId));
      for (const group of cellar.metOnRoutes.groups) {
        for (const row of group.items) {
          assert.ok(
            !held.has(row.wine.id),
            `"${row.wine.id}" is both met and held — one bottle counted as two kinds of thing`
          );
        }
      }
    }
  );

  it(
    "shows a member her own unpublished rows, and real ids for everyone else's",
    function givenTheIndex_whenItsRunsAreRead_thenPrivateAndPublicRowsBothAppear() {
      const lenses = index.sections.find((section) => section.kind === "lenses");
      assert.ok(lenses, "no lenses run — the one thing no other endpoint can return");
      for (const lens of lenses.items) {
        assert.equal(lens.kind, "lens");
        assert.ok(lens.rule?.key, `lens "${lens.id}" states no rule`);
      }

      // Her own shelves are PRIVATE and must appear on no landing — that absence is
      // the reason a member-scoped contract exists at all.
      const published = new Set(collectionsSamples.collections.map((row) => row.id));
      const shelves = index.sections.find((section) => section.kind === "shelves");
      assert.ok(shelves?.items.length, "no shelves run");
      for (const shelf of shelves.items) {
        assert.ok(
          !published.has(shelf.id),
          `her shelf "${shelf.id}" is also on the public landing — the fixture cannot show an unpublished row`
        );
      }

      // What she FOLLOWS is somebody else's published list, so those ids resolve
      // against the collections seed and the rows open onto something.
      const following = index.sections.find((section) => section.kind === "following");
      assert.ok(following?.items.length, "nothing followed");
      for (const row of following.items) {
        assert.ok(published.has(row.id), `followed row "${row.id}" is in no landing`);
      }
    }
  );

  it(
    "resolves every wine it names against the catalogue",
    function givenEveryWineIdInTheCellar_whenLookedUp_thenTheCatalogueHasIt() {
      const catalogue = new Set(createWines().map((wine) => wine.id));
      for (const holding of cellar.items) {
        assert.ok(catalogue.has(holding.entry.wineId), `holding "${holding.entry.wineId}" dangles`);
      }
      for (const group of cellar.metOnRoutes.groups) {
        for (const row of group.items) {
          assert.ok(catalogue.has(row.wine.id), `met wine "${row.wine.id}" dangles`);
        }
      }
    }
  );
});

/**
 * The rules, failing.
 *
 * A spec nobody has watched fail is a spec you do not know works. Each of these breaks
 * exactly one rule and asserts that the ONE rule named it — which is also the argument
 * for decomposing the record: a bundled assertion could only ever report the first
 * thing it happened to check.
 */
describe("the cellar index rules, when a composer gets it wrong", () => {
  const index = createCellarIndex();

  /** A structural clone, so a mutation in one case cannot leak into the next. */
  const clone = () => JSON.parse(JSON.stringify(index));

  const brokenBy = (rule, mutate) => {
    const broken = clone();
    mutate(broken);
    assert.throws(
      () => rule({ index: broken }),
      (error) => error instanceof CellarIndexAgreementError && error.rule === rule.name,
      `${rule.name} did not name itself`
    );
  };

  it(
    "catches a lens with no rule to explain it",
    function givenALensWithoutARule_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.lensStatesItsRule, (broken) => {
        const lenses = broken.sections.find((section) => section.kind === "lenses");
        delete lenses.items[0].rule;
      });
    }
  );

  it(
    "catches a shelf wearing a rule it does not run",
    function givenAShelfWithARule_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.lensStatesItsRule, (broken) => {
        const shelves = broken.sections.find((section) => section.kind === "shelves");
        shelves.items[0].rule = { key: "lensRule.regionIs" };
      });
    }
  );

  it(
    "catches a door that disagrees with the lens it opens",
    function givenADoorWithItsOwnWords_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.doorAgreesWithItsLens, (broken) => {
        const door = broken.doors.find((entry) => entry.target.kind === "collection");
        door.title = "Drink these soon";
      });
    }
  );

  it(
    "catches a door whose count contradicts its own row",
    function givenADoorCountingDifferently_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.readyThisYearAgrees, (broken) => {
        const door = broken.doors.find((entry) => entry.target.kind === "collection");
        door.count += 2;
      });
    }
  );

  it(
    "catches a section that counted its own page",
    function givenASectionCountingItsPage_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.sectionCountDescribesTheSection, (broken) => {
        broken.sections[0].count = 0;
      });
    }
  );

  it(
    "catches a section that strands the rest of itself",
    function givenMoreToGiveAndNoCursor_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.sectionCountDescribesTheSection, (broken) => {
        broken.sections[0].count = broken.sections[0].items.length + 5;
      });
    }
  );

  it(
    "catches an empty run that should have been omitted",
    function givenAHeadingOverNoRows_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.emptySectionsAreOmitted, (broken) => {
        broken.sections.push({ kind: "lenses", items: [], count: 0 });
      });
    }
  );

  it(
    "catches a lens filed under shelves",
    function givenALensInTheShelvesRun_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.sectionsHoldTheirOwnKind, (broken) => {
        const shelves = broken.sections.find((section) => section.kind === "shelves");
        shelves.items[0].kind = "lens";
      });
    }
  );

  it(
    "catches a band that survived its own suppression",
    function givenSuppressedFiguresWithABand_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.suppressedFiguresCarryNoBand, (broken) => {
        broken.summary.figuresAvailable = false;
      });
    }
  );

  it(
    "catches a band spanning two currencies",
    function givenAConvertedBand_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.bandIsOneCurrencyAndOrdered, (broken) => {
        broken.summary.priceBand.high.currency = "EUR";
      });
    }
  );

  it(
    "catches more wines on record than bottles held",
    function givenAnImpossibleTally_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.summaryCountsAreOrdered, (broken) => {
        broken.summary.wines = broken.summary.bottles + 1;
      });
    }
  );

  it(
    "catches a routes door with nothing behind it",
    function givenAZeroCountDoor_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.metOnRoutesIsItsOwnCount, (broken) => {
        broken.doors.find((entry) => entry.target.kind === "metOnRoutes").count = 0;
      });
    }
  );

  it(
    "catches a routes door with no routes to have met them on",
    function givenADoorWithoutItsSection_whenTheRuleRuns_thenItNamesItself() {
      brokenBy(CELLAR_INDEX_RULES.routesDoorImpliesRoutes, (broken) => {
        broken.sections = broken.sections.filter((section) => section.kind !== "routes");
      });
    }
  );
});
