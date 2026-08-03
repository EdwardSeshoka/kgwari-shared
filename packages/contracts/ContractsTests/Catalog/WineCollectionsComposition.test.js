import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WineCollectionsComposition } from "../../dist/catalog/index.js";
import { WineContract } from "../../dist/catalog/test-doubles/index.js";

const wines = [
  WineContract.StubFactory.make({ id: "za-featured", countryCode: "ZA", isFeatured: true }),
  WineContract.StubFactory.make({ id: "za-plain", countryCode: "ZA", isFeatured: false }),
  WineContract.StubFactory.make({ id: "fr-one", countryCode: "FR", isFeatured: false }),
  WineContract.StubFactory.make({
    id: "no-verdict",
    countryCode: "IT",
    isFeatured: false,
    verdict: undefined
  })
];

describe("grouping a catalogue into collections", () => {
  it(
    "sends a KEY and no words at all",
    function givenACatalogue_whenComposed_thenNoDisplayCopyIsServerRendered() {
      // Given: the version this replaced composed `title: "Featured Picks"` and
      // three more strings in English on the server, which hardcodes one
      // language into every client.
      const [featured] = new WineCollectionsComposition().compose({ wines });

      assert.equal(featured.key, "featured_picks");
      for (const word of ["title", "subtitle", "description", "label"]) {
        assert.ok(!(word in featured), `${word} must not be server-rendered`);
      }
    }
  );

  it(
    "reads the home market from CONFIGURATION, not from the wines",
    function givenADifferentMarket_whenComposed_thenTheCollectionFollowsIt() {
      // Given: which market a catalogue is read from is decided once per
      // request; which wines are in it changes every call. The old version
      // hardcoded a South African region list and titled it in English, so a
      // French member saw somebody else's icons under somebody else's heading.
      const za = new WineCollectionsComposition().compose({ wines });
      const fr = new WineCollectionsComposition("FR").compose({ wines });

      const home = (cs) => cs.find((c) => c.key === "home_market_icons");
      assert.deepEqual(home(za).params, { countryCode: "ZA" });
      assert.deepEqual(home(fr).params, { countryCode: "FR" });
      assert.equal(home(za).wines.length, 2);
      assert.equal(home(fr).wines.length, 1);
    }
  );

  it(
    "omits a collection with nothing in it rather than sending it empty",
    function givenNoMatches_whenComposed_thenTheSectionIsAbsent() {
      // Given: an absent section beats an empty one — a client should never
      // decide whether to render a heading over nothing.
      const collections = new WineCollectionsComposition("JP").compose({ wines });

      assert.ok(!collections.some((c) => c.key === "home_market_icons"));
    }
  );

  it(
    "ranks worth-opening by verdict, best first, and excludes the unjudged",
    function givenMixedVerdicts_whenComposed_thenOrderFollowsTheOrdinalScale() {
      const worth = new WineCollectionsComposition()
        .compose({
          wines: [
            WineContract.StubFactory.make({ id: "b", verdict: "Worth Revisiting" }),
            WineContract.StubFactory.make({ id: "a", verdict: "Unforgettable" }),
            WineContract.StubFactory.make({ id: "none", verdict: undefined })
          ]
        })
        .find((c) => c.key === "worth_opening_now");

      assert.deepEqual(worth.wines.map((w) => w.id), ["a", "b"]);
    }
  );

  it(
    "breaks a verdict tie on note count, heaviest first",
    function givenTwoWinesAtTheSameRung_whenComposed_thenTheBetterEvidencedLeads() {
      // Given: the verdict is four rungs wide, so ties are the NORM rather than
      // the edge — most of a catalogue sharing a rung is the expected state. What
      // separates them is how much the room has said, which is a count and never
      // a score.
      const worth = new WineCollectionsComposition()
        .compose({
          wines: [
            WineContract.StubFactory.make({ id: "thin", verdict: "Essential", noteCount: 4 }),
            WineContract.StubFactory.make({ id: "heavy", verdict: "Essential", noteCount: 1480 }),
            WineContract.StubFactory.make({ id: "none", verdict: "Essential", noteCount: undefined })
          ]
        })
        .find((c) => c.key === "worth_opening_now");

      // An absent count reads as 0 — unstated evidence is not evidence.
      assert.deepEqual(worth.wines.map((w) => w.id), ["heavy", "thin", "none"]);
    }
  );

  it(
    "keeps one row per wine even when the catalogue repeats it",
    function givenADuplicatedWine_whenComposed_thenItAppearsOnce() {
      // Given: a wine can arrive twice from a catalogue joined across sources,
      // and a collection that showed it twice would read as two bottles. The
      // FIRST occurrence wins, so upstream ordering still decides which copy.
      const featured = new WineCollectionsComposition()
        .compose({
          wines: [
            WineContract.StubFactory.make({ id: "same", isFeatured: true, name: "First" }),
            WineContract.StubFactory.make({ id: "same", isFeatured: true, name: "Second" })
          ]
        })
        .find((c) => c.key === "featured_picks");

      assert.equal(featured.wines.length, 1);
      assert.equal(featured.wines[0].name, "First");
    }
  );

  it(
    "returns nothing at all for an empty catalogue",
    function givenNoWines_whenComposed_thenTheResultIsEmpty() {
      // Given: composition DEGRADES rather than failing — there is no error
      // here, just fewer sections.
      assert.deepEqual(new WineCollectionsComposition().compose({ wines: [] }), []);
    }
  );
});
