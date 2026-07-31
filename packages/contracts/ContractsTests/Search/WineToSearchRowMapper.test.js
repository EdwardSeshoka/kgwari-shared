import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Mapper } from "@edwardseshoka/foundation";
import { WineToSearchRowMapper } from "../../dist/search/index.js";
import { ProjectableWine } from "../../dist/search/test-doubles/index.js";

const project = (wine) => Mapper.flatMap(WineToSearchRowMapper, wine);

describe("projecting a wine into a ledger row", () => {
  it(
    "keys the row on kind and entity, not on the wine id alone",
    function givenAWine_whenProjected_thenTheIdIsNamespacedByKind() {
      // Given: the ledger is UNIFIED, so a wine and a tasting may legitimately
      // carry the same domain id. `entityId` alone would collide.
      const row = project(ProjectableWine.StubFactory.make());

      assert.equal(row.id, "search_wine_rubicon-2018");
      assert.equal(row.entityId, "rubicon-2018");
      assert.equal(row.kind, "WINE");
      assert.equal(row.facet, "wines");
    }
  );

  it(
    "produces the same id every time, so a replay overwrites instead of duplicating",
    function givenTheSameWine_whenProjectedTwice_thenTheIdIsStable() {
      // Given: streams redeliver, backfills re-run and the seed regenerates. A
      // non-deterministic id would make every one of those double the ledger.
      assert.equal(
        project(ProjectableWine.StubFactory.make()).id,
        project(ProjectableWine.StubFactory.make()).id
      );
    }
  );

  it(
    "sends the name and estate as canonical text",
    function givenAWine_whenProjected_thenBothAreProperNouns() {
      // Given: a producer name is the same word in Cape Town and in Québec, so
      // there is nothing to translate and nothing to negotiate.
      const row = project(ProjectableWine.StubFactory.make());

      assert.deepEqual(row.title, { source: "canonical", text: "Rubicon" });
      assert.deepEqual(row.eyebrow, { source: "canonical", text: "Meerlust Estate" });
    }
  );

  it(
    "omits the eyebrow entirely when a wine has no estate",
    function givenNoEstate_whenProjected_thenThereIsNoEyebrow() {
      // Given: an empty eyebrow renders as a blank line above the title rather
      // than as no line at all.
      const row = project(ProjectableWine.StubFactory.make({ estate: undefined }));

      assert.ok(!("eyebrow" in row), "eyebrow should be absent, not empty");
    }
  );
});

describe("the vintage line has THREE outcomes, not two", () => {
  it(
    "reports a vintage year when the wine has one",
    function givenAVintage_whenProjected_thenTheYearTravelsAsANumber() {
      // Given: a year is an ordinal, so it travels as a number for the client to
      // interpolate as plain digits — never through a grouping formatter, which
      // renders 2018 as "2 018" in French.
      assert.deepEqual(project(ProjectableWine.StubFactory.make()).meta, {
        kind: "vintage",
        year: 2018
      });
    }
  );

  it(
    "reports nonVintage for a wine blended across years by design",
    function givenAnNVMarker_whenProjected_thenTheCaseIsExplicit() {
      // Given: "NV" is a real statement about the wine — Champagne and most
      // fortifieds are blended deliberately — and the client renders it as "NV",
      // "sans millésime" or "senza annata" from its own catalog.
      assert.deepEqual(project(ProjectableWine.StubFactory.makeNonVintage()).meta, {
        kind: "nonVintage"
      });
    }
  );

  it(
    "omits meta when the vintage is merely UNRECORDED, rather than calling it NV",
    function givenNoYearAndNoMarker_whenProjected_thenThereIsNoMeta() {
      // Given: this is the distinction that was got wrong. Labelling an
      // unrecorded vintage "NV" made six seeded rows claim something false,
      // including Château Pichon Baron — a Bordeaux estate that has never made a
      // non-vintage wine. `nonVintage` is a claim about the WINE; absence is a
      // statement about the RECORD.
      const row = project(ProjectableWine.StubFactory.makeVintageUnknown());

      assert.equal(row.meta, undefined);
    }
  );
});

describe("price is a listing, and its absence is a fact", () => {
  it(
    "carries the distributor's listing as minor units plus currency",
    function givenAListedWine_whenProjected_thenTheListedPriceTravels() {
      assert.deepEqual(project(ProjectableWine.StubFactory.make()).listedPrice, {
        amountMinorUnits: 89500,
        currency: "ZAR"
      });
    }
  );

  it(
    "records an unlisted wine as unlisted, never as free",
    function givenNoPrice_whenProjected_thenListedPriceIsAbsentNotZero() {
      // Given: most of the catalogue is not for sale. An earlier mapping
      // defaulted to 0, publishing every unlisted wine as free.
      const row = project(ProjectableWine.StubFactory.makeUnlisted());

      assert.ok(!("listedPrice" in row), "an unlisted wine must carry no price at all");
    }
  );
});
