import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Composition } from "../../dist/index.js";

describe("Composition.present", () => {
  it(
    "keeps the entries that have something in them",
    function givenAMixedList_whenFiltered_thenOnlyRealEntriesSurvive() {
      // Given: the shape every composition needs — build the list with a null
      // where a section is empty, then drop them. It reads as a declarative
      // list of sections rather than a sequence of ifs pushing onto an array.
      assert.deepEqual(Composition.present(["a", null, "b", undefined, "c"]), ["a", "b", "c"]);
    }
  );

  it(
    "returns nothing when every entry is absent",
    function givenNothingPresent_whenFiltered_thenTheResultIsEmpty() {
      // Given: an absent section beats an empty one — a client should never
      // have to decide whether to render a heading over nothing.
      assert.deepEqual(Composition.present([null, undefined]), []);
    }
  );

  it(
    "keeps falsy values that are genuinely present",
    function givenZeroAndEmptyString_whenFiltered_thenNeitherIsDropped() {
      // Given: only null and undefined mean "absent". A count of 0 and an empty
      // label are real values, and a truthiness check would silently eat them.
      assert.deepEqual(Composition.present([0, "", false, null]), [0, "", false]);
    }
  );
});

describe("a composition cannot fail", () => {
  it(
    "returns its output directly, with no Result to unwrap",
    function givenAComposition_whenComposed_thenTheOutputComesBackPlain() {
      // Given: composition DEGRADES rather than rejecting. A missing source
      // means an absent section, not an error — and handing every caller a
      // Result they can only respond to by rendering the empty page composing
      // would have given them anyway is worse than nothing.
      const composition = { compose: ({ items }) => Composition.present(items) };

      assert.deepEqual(composition.compose({ items: ["one", null] }), ["one"]);
    }
  );
});
