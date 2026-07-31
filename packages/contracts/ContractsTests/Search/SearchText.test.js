import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toSearchText } from "../../dist/search/index.js";
import { SearchResultContract } from "../../dist/search/test-doubles/index.js";

describe("the text a row can be found by", () => {
  it(
    "includes the words a member would plausibly type",
    function givenAWineRow_whenDerived_thenTheObviousQueriesAreCovered() {
      const text = toSearchText(SearchResultContract.StubFactory.make());

      for (const term of ["rubicon", "meerlust", "essential", "2018", "wine"]) {
        assert.ok(text.includes(term), `expected "${term}" in "${text}"`);
      }
    }
  );

  it(
    "lower-cases everything, so matching never depends on capitalisation",
    function givenMixedCase_whenDerived_thenTheTextIsLowered() {
      assert.equal(toSearchText(SearchResultContract.StubFactory.make()), 
                   toSearchText(SearchResultContract.StubFactory.make()).toLowerCase());
    }
  );

  it(
    "leaves the price out, because digits collide with vintages",
    function givenAListedWine_whenDerived_thenTheAmountIsNotMatchable() {
      // Given: "895" matching a row is noise, not recall — nobody searches a
      // catalogue by typing an amount.
      const text = toSearchText(SearchResultContract.StubFactory.make());

      assert.ok(!text.includes("89500"), `expected no amount in "${text}"`);
    }
  );

  it(
    "indexes a CHROME eyebrow by its key",
    function givenAPersonRow_whenDerived_thenTheKeyIsMatchable() {
      // Given: a member searching "enthusiast" should find one, and the key
      // happens to be the English word. That is a limitation of a substring
      // engine rather than a design — a French member typing the French word
      // will not match until a real index with per-locale synonyms answers.
      const text = toSearchText(SearchResultContract.StubFactory.makePerson());

      assert.ok(text.includes("enthusiast"), text);
      assert.ok(text.includes("alexandra"), text);
    }
  );
});
