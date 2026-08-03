import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ARCHIVE_LENSES,
  CALENDAR_LENSES,
  COLLECTION_LENSES,
  LENS_ALL,
  LENS_KEYS
} from "../../dist/lenses/index.js";
import { LensRowContract } from "../../dist/lenses/test-doubles/index.js";

/**
 * The lens mechanism, and the rules it owes.
 *
 * A lens is not a tab: it narrows what is already there, keeps the heading and
 * the order meaning the same thing, and adds no depth to the hierarchy. Most of
 * what follows from that is about what the row must NOT do — which is exactly
 * the kind of rule that survives in a doc comment and dies in an implementation
 * unless something asserts it.
 */
describe("the lens vocabularies", () => {
  it(
    "starts every set at All, because every lens narrows FROM somewhere",
    function givenEachLensSet_whenRead_thenAllLeadsIt() {
      // Given: a list opens on everything and a lens takes something away. A set
      // whose first chip already filtered would have no way back without a
      // second control, which is the tab behaviour a lens exists to avoid.
      for (const set of [COLLECTION_LENSES, ARCHIVE_LENSES, CALENDAR_LENSES]) {
        assert.equal(set[0], LENS_ALL);
      }
    }
  );

  it(
    "asks the two collection landings the SAME four words",
    function givenShelvesAndItineraries_whenAsked_thenTheVocabularyIsIdentical() {
      // Given: a shelf and an itinerary are one record with two subjects, and
      // both are asked WHO. That they want the same vocabulary is evidence for
      // the taxonomy rather than a coincidence to tidy away — so there is one
      // set, not two that happen to match today.
      assert.deepEqual(COLLECTION_LENSES, [
        "lens.all",
        "lens.sommeliers",
        "lens.members",
        "lens.kgwari"
      ]);
    }
  );

  it(
    "keeps Kgwari a lens rather than a section of its own",
    function givenTheCollectionLenses_whenRead_thenTheHouseIsOneChipAmongFour() {
      // Given: the moment the house's lists get a band above everyone else's,
      // the page has invented the curated badge the taxonomy refused. As a chip
      // it is reachable in one tap and privileged in no other way.
      assert.ok(COLLECTION_LENSES.includes("lens.kgwari"));
      assert.equal(COLLECTION_LENSES.indexOf("lens.kgwari"), COLLECTION_LENSES.length - 1);
    }
  );

  it(
    "gives the calendar an attribute lens beside its time ones",
    function givenTheCalendarSet_whenRead_thenSeatsLeftSitsAmongTheDates() {
      // Given: the mechanism generalises without a new shape. A lens narrows a
      // stream; nothing about that requires the question to be about dates.
      assert.ok(CALENDAR_LENSES.includes("lens.seatsLeft"));
      assert.ok(CALENDAR_LENSES.includes("lens.thisMonth"));
    }
  );

  it(
    "carries no region lens anywhere",
    function givenEveryLensSet_whenRead_thenGeographyIsAbsent() {
      // Given: geography belongs to the doorways, because a region's contents
      // come from a QUERY — Stellenbosch has its wines whether or not anybody
      // arranged them — while a collection's came from a person. Six routes
      // across six regions is also a chip row of six ones.
      for (const key of LENS_KEYS) {
        assert.ok(
          !/region|stellenbosch|swartland/i.test(key),
          `${key} narrows by geography, which doorways already do`
        );
      }
    }
  );

  it(
    "enumerates every key once, so a locale catalogue can be checked",
    function givenTheKeyList_whenRead_thenItIsTheDedupedUnionOfEverySet() {
      // Given: the sets deliberately SHARE words — `lens.all` is in all three
      // and `lens.members` in two — so a list that did not dedupe would ask for
      // the same translation twice and make a parity check a lie about how much
      // is left.
      assert.equal(new Set(LENS_KEYS).size, LENS_KEYS.length);
      for (const set of [COLLECTION_LENSES, ARCHIVE_LENSES, CALENDAR_LENSES]) {
        for (const key of set) assert.ok(LENS_KEYS.includes(key), `${key} is not enumerated`);
      }
    }
  );

  it(
    "carries keys, never display words",
    function givenEveryLensKey_whenRead_thenItIsANamespacedChromeKey() {
      for (const key of LENS_KEYS) {
        assert.match(key, /^lens\.[a-zA-Z]+$/, `"${key}" is not a chrome key`);
      }
    }
  );
});

describe("the row a lens set draws", () => {
  it(
    "never offers a lens with nothing behind it",
    function givenAnyRow_whenRead_thenNoChipCountsZero() {
      // Given: the reader is never handed a control that leads to an empty page.
      // That is the one thing a filter must not do, and it is why `count` is
      // absent-or-positive rather than merely a number.
      for (const row of [
        LensRowContract.StubFactory.make(),
        LensRowContract.StubFactory.makeCalendar(),
        LensRowContract.StubFactory.makeArchive()
      ]) {
        for (const lens of row.lenses) {
          assert.notEqual(lens.count, 0, `${lens.key} is offered with nothing in it`);
        }
      }
    }
  );

  it(
    "sends an EMPTY row rather than a lone All",
    function givenOneKindOnly_whenRead_thenTheRowDisappearsEntirely() {
      // Given: a lone "All" narrows nothing — a control that cannot be used. The
      // row disappearing is precisely the thing a tab row can never do, and
      // suppressing it on the server keeps the rule out of three clients.
      const suppressed = LensRowContract.StubFactory.makeSuppressed();

      assert.deepEqual(suppressed.lenses, []);
      assert.ok(suppressed.lenses.length < 2, "a client renders nothing below two lenses");
    }
  );

  it(
    "suppresses a row whose only populated lens IS the corpus",
    function givenOneBucketHoldingEverything_whenRead_thenNothingIsDrawn() {
      // Given: the rule is about NARROWING, not about chip count. "All" beside a
      // single lens that selects every row is two controls that do the same
      // thing — as useless as a lone "All", and the case an implementation
      // reaches for `length > 1` gets wrong. The suppressed double models it.
      const suppressed = LensRowContract.StubFactory.makeSuppressed();

      assert.deepEqual(suppressed.lenses, []);
      for (const row of [
        LensRowContract.StubFactory.make(),
        LensRowContract.StubFactory.makeArchive()
      ]) {
        const all = row.lenses.find((lens) => lens.key === LENS_ALL);
        const narrowing = row.lenses.filter((lens) => lens.key !== LENS_ALL);

        assert.ok(narrowing.length >= 2, "a drawn row needs two lenses that narrow");
        assert.ok(
          narrowing.every((lens) => lens.count < all.count),
          "a lens selecting the whole corpus narrows nothing"
        );
      }
    }
  );

  it(
    "knows its words before it knows its counts",
    function givenACountingRow_whenRead_thenEveryChipHasAWordAndNoNumber() {
      // Given: the chip words are chrome, rendered from the key, so the row draws
      // immediately and only the numbers arrive late. A skeleton where a real
      // word could stand is a lie about latency.
      const counting = LensRowContract.StubFactory.makeCounting();

      assert.ok(counting.lenses.length > 1);
      for (const lens of counting.lenses) {
        assert.ok(lens.key.length > 0);
        assert.equal(lens.count, undefined);
      }
    }
  );

  it(
    "opens on All and states which lens is applied",
    function givenAFreshRow_whenRead_thenActiveIsAllAndIsSent() {
      // Given: the heading and the count under it narrow with the lens, so the
      // page and its chip row have to agree about what is being shown. A heading
      // describing a list the reader is not looking at is a heading that lies.
      assert.equal(LensRowContract.StubFactory.make().active, LENS_ALL);
      assert.equal(LensRowContract.StubFactory.makeNarrowed().active, "lens.sommeliers");
    }
  );

  it(
    "offers only lenses from its own list's vocabulary",
    function givenEachRow_whenRead_thenItsChipsComeFromOneSet() {
      // Given: the vocabulary is shared only where the question genuinely is. A
      // calendar row offering `lens.kgwari` would be asking a diary WHO.
      const inSet = (row, set) => row.lenses.every((lens) => set.includes(lens.key));

      assert.ok(inSet(LensRowContract.StubFactory.make(), COLLECTION_LENSES));
      assert.ok(inSet(LensRowContract.StubFactory.makeCalendar(), CALENDAR_LENSES));
      assert.ok(inSet(LensRowContract.StubFactory.makeArchive(), ARCHIVE_LENSES));
    }
  );
});
