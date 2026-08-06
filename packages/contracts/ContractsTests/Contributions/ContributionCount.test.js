import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ContributionCountContract } from "../../dist/contributions/test-doubles/index.js";

/**
 * The chips, and the arithmetic that has to stay wrong-looking.
 *
 * Publishing a route is one act, so nine notes written on one afternoon are one row
 * in the ledger and count once. That decision is correct and it makes a chip read
 * `Notes 12` for a member who wrote twenty-one — which looks exactly like a bug and
 * will be "fixed" by whoever reaches it first unless the reason is written down and
 * asserted.
 */
describe("the contribution chips", () => {
  it(
    "counts rows, and says separately how many writings are nested",
    function givenTheNoteChip_whenRead_thenBothNumbersArePresentAndDistinct() {
      // Given: `count` is what tapping the chip will show. `nestedCount` is what
      // exists but is spoken for by another row — the itinerary's. Two numbers,
      // because one cannot say both and a single number is the thing that reads as
      // loss.
      const notes = ContributionCountContract.StubFactory.make();

      // Then
      assert.equal(notes.kind, "note");
      assert.equal(notes.count, 12);
      assert.equal(notes.nestedCount, 4);
    }
  );

  it(
    "leaves the nested number absent when nothing is nested",
    function givenAKindWithNoContainer_whenRead_thenNestedCountIsAbsentNotZero() {
      // Given: absent and zero render differently. With nothing nested there is no
      // second clause to draw, and "· 0 on routes" is a sentence about nothing. Only
      // notes can hide inside a route today; editorial, tastings and collections have
      // no container.
      const collections = ContributionCountContract.StubFactory.makeUnnested();

      // Then
      assert.equal(collections.nestedCount, undefined);
      assert.ok(!("nestedCount" in collections) || collections.nestedCount === undefined);
    }
  );

  it(
    "reads zero rows for a member who only ever wrote on routes",
    function givenAllNested_whenRead_thenTheCountIsZeroAndTheWritingsAreNot() {
      // Given: the state that looks most like a bug and is not one. The stream behind
      // the chip is genuinely empty — every note is reachable under a route and
      // nowhere else — so the chip must not print a bare "0".
      const notes = ContributionCountContract.StubFactory.makeAllNested();

      // Then
      assert.equal(notes.count, 0);
      assert.equal(notes.nestedCount, 4);
    }
  );

  it(
    "sums to rows across the row, never to writings",
    function givenTheChipRow_whenTotalled_thenNestedWritingsAreNotAddedTwice() {
      // Given: `All` counts ROWS. The four nested notes are already represented by an
      // itinerary row inside the collection count, so adding them again is putting the
      // tram back in the ledger nine times — the exact failure `origin` exists to
      // prevent.
      const chips = ContributionCountContract.StubFactory.makeChipRow();

      const rows = chips.reduce((total, chip) => total + chip.count, 0);
      const withNested = chips.reduce(
        (total, chip) => total + chip.count + (chip.nestedCount ?? 0),
        0
      );

      // Then
      assert.equal(rows, 24, "12 notes + 3 editorial + 2 tastings + 7 collections");
      assert.notEqual(
        withNested,
        rows,
        "a fixture with nothing nested could not catch a client that sums the wrong thing"
      );
    }
  );

  it(
    "nests only notes, because only a note has somewhere to hide",
    function givenTheChipRow_whenInspected_thenNoOtherKindIsNested() {
      // Given: a stop holds wines and notes and an event. Only the note is a
      // contribution in its own right, so it is the only kind whose row can be spoken
      // for by a route. The day a stop holds something else, this test is the one that
      // should fail.
      const chips = ContributionCountContract.StubFactory.makeChipRow();

      // Then
      for (const chip of chips) {
        if (chip.kind === "note") continue;
        assert.equal(
          chip.nestedCount,
          undefined,
          `"${chip.kind}" has no container to be nested inside`
        );
      }
    }
  );
});
