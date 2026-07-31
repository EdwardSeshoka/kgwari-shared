import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { originSystemFor } from "../../dist/provenance/index.js";

describe("the origin system a country certifies under", () => {
  it(
    "names the scheme for each country the catalogue carries",
    function givenAKnownCountry_whenLookedUp_thenItsSchemeComesBack() {
      assert.equal(originSystemFor("ZA"), "WO");
      assert.equal(originSystemFor("FR"), "AOC");
      assert.equal(originSystemFor("IT"), "DOCG");
      assert.equal(originSystemFor("US"), "AVA");
    }
  );

  it(
    "answers Other for a country outside the schemes the union names",
    function givenAnUnlistedCountry_whenLookedUp_thenOtherComesBack() {
      // Given: Switzerland, the UK and Canada all certify differently. "Other"
      // is the honest answer rather than forcing a wine into a system that does
      // not apply to it.
      for (const cc of ["CH", "GB", "CA", "??"]) {
        assert.equal(originSystemFor(cc), "Other");
      }
    }
  );

  it(
    "only ever returns a member of the closed union",
    function givenEveryCountryCode_whenLookedUp_thenNothingInventedComesBack() {
      // Given: an earlier version of this mapping lived in the seed generator
      // and returned "PDO" — a real EU term, and not a member of this union.
      // Every German, Swiss, British and Canadian wine then failed the record
      // mapper, and a contract test caught it rather than anything near the
      // code at fault.
      const legal = ["WO", "AOC", "AOP", "DOC", "DOCG", "DO", "DOCa", "AVA", "GI", "Other"];
      const codes = ["ZA", "FR", "IT", "ES", "DE", "AT", "US", "CH", "GB", "CA", "PT", "NZ"];

      for (const cc of codes) {
        assert.ok(legal.includes(originSystemFor(cc)), `${cc} → ${originSystemFor(cc)}`);
      }
    }
  );
});
