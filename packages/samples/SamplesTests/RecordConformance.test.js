import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createWineRecords, createWines } from "../dist/index.js";

/**
 * Does the generated JSON still satisfy `WineRecordContract`?
 *
 * It has to be asked at RUNTIME, and that is worth explaining. `wineRecords.ts`
 * reads the JSON and casts it:
 *
 *     const records = rawRecords as unknown as WineRecordContract[];
 *
 * The double cast is not laziness — a JSON module import widens every literal,
 * so `source: "canonical"` arrives as `string` and no discriminated union in the
 * contract can match it. A single cast genuinely will not compile.
 *
 * What the cast costs is the compiler's opinion. Add a required field to
 * `WineRecordContract` and nothing fails: not `tsc`, because the cast silences
 * it, and not the other seed tests, because none of them knew to look for a
 * field that did not exist when they were written. These assertions are that
 * missing opinion, restated as a check that runs.
 */

const CARRIERS = new Set(["canonical", "chrome", "negotiated", "measurement", "yearRange"]);
const records = createWineRecords();
const wineIds = new Set(createWines().map((w) => w.id));

describe("generated records still fit the contract", () => {
  it(
    "gives every record the fields the contract requires",
    function givenEveryRecord_whenRead_thenNoRequiredFieldIsMissing() {
      // Given: the cast means a contract that grows a required field breaks
      // nothing at build time. This is the check that notices.
      for (const record of records) {
        assert.equal(typeof record.wineVintageId, "string", "wineVintageId");
        assert.ok(Array.isArray(record.groups), `${record.wineVintageId}: groups`);
        assert.ok(Array.isArray(record.locked), `${record.wineVintageId}: locked`);
        assert.ok(record.register, `${record.wineVintageId}: register`);
      }
    }
  );

  it(
    "points every record at a wine that exists",
    function givenEveryRecord_whenResolved_thenItsWineIsInTheCatalogue() {
      // Given: a record for a wine nobody can open is a detail page with no
      // door into it — the same dangling-reference class that let
      // `user_thandi_nkosi` survive in the search corpus.
      for (const record of records) {
        assert.ok(wineIds.has(record.wineVintageId), `no wine for ${record.wineVintageId}`);
      }
    }
  );

  it(
    "gives every group and field the shape the contract declares",
    function givenEveryGroup_whenRead_thenItsKeysAndFieldsAreWellFormed() {
      for (const record of records) {
        for (const group of record.groups) {
          assert.equal(typeof group.key, "string", `${record.wineVintageId}: group.key`);
          assert.equal(typeof group.labelKey, "string", `${group.key}: labelKey`);
          assert.ok(Array.isArray(group.fields), `${group.key}: fields`);

          for (const field of group.fields) {
            assert.equal(typeof field.key, "string", `${group.key}: field.key`);
            assert.ok(
              ["reference", "estate_private", "commercial"].includes(field.kind),
              `${field.key}: unknown kind "${field.kind}"`
            );
          }
        }
      }
    }
  );

  it(
    "sends every value through a tagged carrier, never as a bare string",
    function givenEveryFieldValue_whenRead_thenItDeclaresHowToRenderItself() {
      // Given: this is the localisation rule the whole contracts layer is built
      // on. A bare string is a value no client knows how to render — and the
      // cast is exactly what would let one through.
      for (const record of records) {
        for (const group of record.groups) {
          for (const field of group.fields) {
            if (!field.value) continue;
            assert.ok(
              CARRIERS.has(field.value.source),
              `${record.wineVintageId}.${field.key} is a bare value`
            );
          }
        }
      }
    }
  );

  it(
    "derives every group heading from its own key",
    function givenEveryGroup_whenRead_thenTheLabelMatchesTheKey() {
      // Given: `labelKey` is a template literal type on the contract, so the two
      // cannot disagree in TypeScript. The cast means the JSON could still
      // disagree, and a heading pointing at a catalog entry that does not exist
      // renders as a raw key on screen.
      for (const record of records) {
        for (const group of record.groups) {
          assert.equal(
            group.labelKey,
            `record.group.${group.key}`,
            `${group.key}: label does not follow its key`
          );
        }
      }
    }
  );
});
