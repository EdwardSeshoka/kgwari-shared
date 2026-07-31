import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { facetFor, searchRowId } from "../../dist/search/index.js";

describe("the ledger id", () => {
  it(
    "namespaces an entity id by its kind",
    function givenAKindAndEntity_whenBuilt_thenBothAppear() {
      // Given: a wine and a tasting may share a domain id, so the kind is what
      // makes the row id unique across a UNIFIED ledger.
      assert.equal(searchRowId("WINE", "rubicon-2018"), "search_wine_rubicon-2018");
      assert.equal(searchRowId("PERSON", "user_alex"), "search_person_user_alex");
    }
  );

  it(
    "is a pure function of its inputs",
    function givenTheSameInputs_whenBuiltRepeatedly_thenTheIdNeverMoves() {
      // Given: this is what makes every writer idempotent. A stream replay, a
      // backfill and a seed regeneration all compute the same id and overwrite
      // one row instead of appending three.
      const ids = Array.from({ length: 5 }, () => searchRowId("ESTATE", "estate_meerlust"));

      assert.equal(new Set(ids).size, 1);
    }
  );
});

describe("the facet a kind answers to", () => {
  it(
    "maps every kind the ledger holds",
    function givenEveryKind_whenMapped_thenAFacetComesBack() {
      // Given: the client never owns the kind→facet table, so a kind with no
      // facet would render a row the filter index cannot place.
      assert.deepEqual(
        ["WINE", "ESTATE", "REGION", "TASTING", "PERSON"].map(facetFor),
        ["wines", "estates", "regions", "tastings", "people"]
      );
    }
  );
});
