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
    "leads on a member's note, in that member's own words",
    function givenDiscoverHome_whenComposed_thenTheLedeComesFromTheRoom() {
      // Given: the v2 hero is a NOTE, not a wine. That is the change that makes
      // the front page sound like the room rather than like Kgwari — it opens in
      // a member's exact words, under their name, about a bottle they drank.
      const home = createDiscover();

      assert.equal(home.hero?.kind, "note");
      if (home.hero?.kind !== "note") {
        assert.fail("expected a note hero");
      }
      assert.ok(home.hero.note.note.length > 0, "the lede is the member's prose");
      assert.ok(home.hero.note.user.displayName.length > 0);
      assert.ok(home.hero.note.wine, "a note leads with the wine it is about");
    },
  );

  it(
    "arranges the Fade Yield funnel as compositions of domain contracts",
    function givenDiscoverHome_whenComposed_thenArrangesFadeYieldFunnel() {
      // When
      const home = createDiscover();

      // Then
      // v2 ADDS to the funnel rather than replacing it: the ledger opens the
      // page, tonight closes it, and everything v1 arranged is still arranged.
      // The two collection chapters are dealt APART on the real page — three row
      // chapters set adjacently read as one undifferentiated list however
      // carefully each is set — and the fixture keeps that ordering.
      assert.deepEqual(
        home.sections.map((section) => section.type),
        [
          "contributions",
          "wines",
          "events",
          "shelves",
          "editorial",
          "itineraries",
          "doorways",
          "contrast",
          "room",
          "cellar_tonight",
          "tonight_stats",
        ],
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
      assert.equal(events.items[0].lifecycle, "open", "only open evenings are advertised");

      const room = home.sections.find((section) => section.type === "room");
      assert.ok(room.items[0].user.displayName.length > 0);
      assert.equal(typeof room.items[0].verdict, "string");
    },
  );

  it(
    "sets two readings of one bottle against each other, and they disagree",
    function givenTheContrastBand_whenComposed_thenTheReadingsActuallyDiffer() {
      // Given: a "two ways of seeing" band over two people saying the same
      // thing is the fixture teaching a consumer that the chapter means
      // nothing. The disagreement is the only reason the section exists.
      const home = createDiscover();
      const contrast = home.sections.find((section) => section.type === "contrast");

      // Then
      assert.ok(contrast, "the band is composed");
      assert.ok(contrast.items.length >= 2, "one reading is not two ways of seeing");

      const verdicts = new Set(contrast.items.map((note) => note.verdict));
      assert.equal(verdicts.size, contrast.items.length, "the readings must differ");

      // The wine is named ONCE, over both — repeating it above each quote is
      // the layout saying twice what the section already said.
      assert.ok(contrast.wine.name.length > 0);
      for (const note of contrast.items) {
        assert.ok(!("wine" in note), "an entry restates neither the bottle nor its estate");
        assert.equal(note.wineVintageId, contrast.wine.id, "every reading is of that bottle");
        assert.ok(note.note.length > 0, "a reading is prose, not a rating");
      }
    },
  );

  it(
    "dates every editorial card, so an archive can file it",
    function givenTheEditorialCards_whenInspected_thenEachCarriesItsPublicationDate() {
      // Given: the archive files by date, rules itself into months and shows the
      // date on the row. A card that carries none reaches a client as a dateless
      // row with no error to explain it — which is what happened before this
      // field moved onto the card from the detail.
      const home = createDiscover();
      const editorial = home.sections.find((section) => section.type === "editorial");

      // Then
      for (const card of editorial.items) {
        assert.equal(typeof card.publishedAt, "string", `${card.id} has no publishedAt`);
        assert.ok(
          !Number.isNaN(Date.parse(card.publishedAt)),
          `${card.id} has an unparseable publishedAt`,
        );
      }
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
