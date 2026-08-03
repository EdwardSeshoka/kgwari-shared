import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDiscover, createWines } from "../dist/index.js";

const ALLOWED_USER_KEYS = ["displayName", "id", "initials", "role", "status", "tier"];

describe("createWines", () => {
  it(
    "returns the sample wine catalog as WineContract records",
    function givenSampleCatalog_whenCreated_thenReturnsWineRecords() {
      // When
      const wines = createWines();

      // Then
      assert.ok(wines.length > 0);
      assert.equal(wines.find((wine) => wine.id === "rubicon-2018")?.name, "Rubicon");
    },
  );

  it(
    "carries the editorial signal, never a public numeric score",
    function givenSampleCatalog_whenInspected_thenCarriesVerdictNotScore() {
      // Given
      const wines = createWines();

      // Then
      for (const wine of wines) {
        assert.ok(!("rating" in wine), `${wine.id} must not expose a numeric rating`);
        assert.equal(typeof wine.provenance, "string");
      }
    },
  );

  it(
    "covers non-South-African origin systems",
    function givenSampleCatalog_whenInspected_thenCoversGlobalOriginSystems() {
      // Given
      const wines = createWines();

      // Then
      assert.ok(wines.some((wine) => wine.appellation?.system === "DOCG"));
      assert.ok(wines.some((wine) => wine.countryCode && wine.countryCode !== "ZA"));
    },
  );
});

describe("createDiscover", () => {
  it(
    "features a wine hero resolved from the wine catalog",
    function givenDiscoverHome_whenComposed_thenFeaturesWineHero() {
      // When
      const home = createDiscover();

      // Then
      assert.equal(home.hero?.kind, "wine");
      if (home.hero?.kind !== "wine") {
        assert.fail("expected a wine hero");
      }
      assert.equal(home.hero.wine.id, "rubicon-2018");
      assert.equal(home.hero.wine.name, "Rubicon");
      assert.equal(home.hero.issueLabel, "No. 47");
      assert.ok(home.hero.title.length > 0);
    },
  );

  it(
    "arranges the Fade Yield funnel as compositions of domain contracts",
    function givenDiscoverHome_whenComposed_thenArrangesFadeYieldFunnel() {
      // When
      const home = createDiscover();

      // Then
      assert.deepEqual(
        home.sections.map((section) => section.type),
        ["editorial", "wines", "doorways", "events", "room"],
      );

      const wines = home.sections.find((section) => section.type === "wines");
      assert.ok(wines.items.length > 0);
      assert.equal(typeof wines.items[0].verdict, "string");
      assert.ok(!("rating" in wines.items[0]), "wine rows must not carry a numeric score");

      const doorways = home.sections.find((section) => section.type === "doorways");
      assert.equal(doorways.items[0].kind, "region");
      assert.equal(doorways.items[0].target.kind, "region");

      const events = home.sections.find((section) => section.type === "events");
      assert.ok(events.items[0].host, "a tasting row leads with its host byline");

      const room = home.sections.find((section) => section.type === "room");
      assert.ok(room.items[0].user.displayName.length > 0);
      assert.equal(typeof room.items[0].verdict, "string");
    },
  );

  it(
    "carries only contract fields — no numeric scores leak onto room activities",
    function givenDiscoverRoom_whenInspected_thenNoNumericScoreLeaks() {
      // Given
      const home = createDiscover();
      const room = home.sections.find((section) => section.type === "room");

      // Then
      for (const activity of room.items) {
        assert.ok(!("rating" in activity), "activities must not carry a numeric rating");
        for (const key of Object.keys(activity.user)) {
          assert.ok(ALLOWED_USER_KEYS.includes(key), `unexpected user key: ${key}`);
        }
      }
    },
  );
});
