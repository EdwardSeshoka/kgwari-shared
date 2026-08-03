import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { VERDICTS } from "../../dist/trust/index.js";

/**
 * The verdict is the one vocabulary in the system with an ORDER, and the order
 * is the part nothing else can re-derive: "worth opening now" sorts by it, a
 * search tiebreak sorts by it, the register's distribution is drawn in it. It
 * used to exist twice — once as a doc comment here and once as an array in the
 * backend — and 7.0 found a third copy hiding in the seed generator with the
 * wrong length. This asserts the properties every one of those copies got to
 * assume for free.
 */
describe("the verdict register", () => {
  it(
    "has exactly the four rungs, best first",
    function givenTheRegister_whenRead_thenItIsFourRungsInOrder() {
      // Given: the rungs ARE the scale. A fifth appearing, or one moving, silently
      // changes what "worth opening now" means on every surface at once.
      assert.deepEqual(VERDICTS, [
        "Unforgettable",
        "Essential",
        "Worth Revisiting",
        "An Interesting Discovery"
      ]);
    }
  );

  it(
    "no longer carries the retired fifth rung",
    function givenTheRetiredWord_whenLookedFor_thenItIsAbsent() {
      // Given: "Not One I'd Revisit" was retired in 7.0 because it described an
      // evening rather than a bottle, and gave a worded scale a bottom to sort
      // toward. A stored copy must map to NO verdict — never to the new last
      // rung, which is a compliment.
      assert.equal(VERDICTS.includes("Not One I'd Revisit"), false);
      assert.equal(VERDICTS.at(-1), "An Interesting Discovery");
    }
  );

  it(
    "yields a rank directly from indexOf, best = 0",
    function givenTwoVerdicts_whenRanked_thenBetterSortsFirst() {
      // Given: this is the whole reason it is a value and not only a type. Any
      // consumer ranking by verdict does `VERDICTS.indexOf(v)`, so the array
      // order is load-bearing rather than cosmetic.
      assert.ok(VERDICTS.indexOf("Unforgettable") < VERDICTS.indexOf("Essential"));
      assert.ok(
        VERDICTS.indexOf("Worth Revisiting") < VERDICTS.indexOf("An Interesting Discovery")
      );
    }
  );

  it(
    "ranks an unknown word outside the scale rather than at the top",
    function givenAnUnknownVerdict_whenRanked_thenIndexOfReportsMinusOne() {
      // Given: a row projected before the removal still carries the old word.
      // `indexOf` answers -1, which a consumer must treat as "no verdict" and not
      // as a rank — sorting on the raw -1 would float retired rows above
      // "Unforgettable".
      assert.equal(VERDICTS.indexOf("Not One I'd Revisit"), -1);
    }
  );
});
