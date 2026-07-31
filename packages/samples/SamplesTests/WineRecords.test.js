import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createWineRecord, createWineRecords, createWines } from "../dist/index.js";

/**
 * The record model's invariants, asserted over the whole seed rather than a
 * sample of it.
 *
 * These are the rules the generator enforces by construction — the test exists
 * so that a change which quietly stops enforcing one fails here rather than in
 * the app. The taxonomy is the point: who supplied a fact, and who is allowed
 * to answer it, must never blur.
 */

const CARRIERS = new Set(["canonical", "chrome", "negotiated", "measurement", "yearRange"]);
const SOURCES = new Set([
  "wo", "sawis", "label", "db", "register", "member", "estate", "distributor", "editorial",
]);
const SPREAD_THRESHOLD = 25;

const wines = createWines();
const records = createWineRecords();
const wineById = new Map(wines.map((w) => [w.id, w]));
const fieldsOf = (record, kind) =>
  record.groups.flatMap((g) => g.fields).filter((f) => f.kind === kind);

describe("wine record seeds", () => {
  it(
    "gives every wine in the catalogue a record",
    function givenTheWinePool_whenRecordsAreRead_thenEachWineHasExactlyOne() {
      const recordIds = records.map((r) => r.wineVintageId);
      assert.equal(recordIds.length, wines.length);
      assert.equal(new Set(recordIds).size, recordIds.length);
      for (const wine of wines) {
        assert.ok(createWineRecord(wine.id), `no record for ${wine.id}`);
      }
    }
  );

  it(
    "keeps provenance a projection of the claim",
    function givenAnyWine_whenProvenanceIsRead_thenItAgreesWithClaimedBy() {
      for (const wine of wines) {
        assert.equal(
          wine.provenance,
          wine.claimedBy ? "claimed" : "community",
          `${wine.id} disagrees with its own claim`
        );
      }
    }
  );

  it(
    "always answers a reference row, and always names who answered it",
    function givenAnyRecord_whenReferenceRowsAreRead_thenEachCarriesValueAndSource() {
      for (const record of records) {
        const reference = fieldsOf(record, "reference");
        assert.ok(reference.length > 0, `${record.wineVintageId} has no matched facts`);
        for (const field of reference) {
          assert.ok(field.value, `${record.wineVintageId}.${field.key} has no value`);
          assert.ok(SOURCES.has(field.source), `${record.wineVintageId}.${field.key} bad source`);
          assert.ok(field.verification, `${record.wineVintageId}.${field.key} cannot be disputed`);
        }
      }
    }
  );

  it(
    "answers an estate-private row only when a producer has claimed",
    function givenAnyRecord_whenPrivateRowsAreRead_thenValuesExistOnlyUnderAProducerClaim() {
      for (const record of records) {
        const answered = record.claimedBy?.kind === "producer";
        for (const field of fieldsOf(record, "estate_private")) {
          if (answered) {
            assert.ok(field.value, `${record.wineVintageId}.${field.key} unanswered after a claim`);
            assert.equal(field.source, "estate");
          } else {
            assert.equal(field.value, undefined, `${record.wineVintageId}.${field.key} was guessed`);
            assert.equal(field.verification, undefined);
          }
        }
      }
    }
  );

  it(
    "opens commercial rows only to a distributor",
    function givenAnyRecord_whenCommercialRowsAreRead_thenOnlyADistributorClaimHasThem() {
      for (const record of records) {
        const commercial = fieldsOf(record, "commercial");
        if (record.claimedBy?.kind === "distributor") {
          assert.ok(commercial.length > 0, `${record.wineVintageId} listed but sells nothing`);
          for (const field of commercial) assert.equal(field.source, "distributor");
        } else {
          assert.equal(commercial.length, 0, `${record.wineVintageId} sells without a listing`);
        }
      }
    }
  );

  it(
    "keeps the estate's voice shut until the estate itself claims",
    function givenARecordNotClaimedByItsProducer_whenTheVoiceIsRead_thenItIsLockedNotWritten() {
      for (const record of records) {
        const byProducer = record.claimedBy?.kind === "producer";
        const locked = record.locked.some((l) => l.key === "estateVoice");
        assert.equal(locked, !byProducer, `${record.wineVintageId} locks the voice wrongly`);
        if (!byProducer) {
          assert.equal(record.estateVoice, undefined, `${record.wineVintageId} speaks for the estate`);
        }
      }
    }
  );

  it(
    "puts price and requests with the claimant, and nowhere else",
    function givenAnyRecord_whenAvailabilityIsRead_thenItExistsExactlyWhenAClaimDoes() {
      for (const record of records) {
        if (!record.claimedBy) {
          assert.equal(record.availability, undefined, `${record.wineVintageId} sells unclaimed`);
          continue;
        }
        assert.ok(record.availability, `${record.wineVintageId} claimed but unreachable`);
        assert.equal(record.availability.claimantTier, record.claimedBy.kind);
        // deepEqual, not equal: both are now `CanonicalText` carriers rather
        // than bare strings, so this compares the value and not the reference.
        assert.deepEqual(record.availability.claimantName, record.claimedBy.name);
      }
    }
  );

  it(
    "draws a spread only once there are enough notes to have one",
    function givenARecordBelowTheThreshold_whenMetricsAreRead_thenNoDistributionIsClaimed() {
      for (const record of records) {
        const dense = record.register.noteCount >= SPREAD_THRESHOLD;
        for (const group of record.register.groups) {
          for (const metric of group.metrics) {
            if (metric.shape !== "scale") continue;
            assert.equal(
              metric.distribution !== undefined,
              dense,
              `${record.wineVintageId}.${metric.key} misreports its evidence`
            );
            if (metric.distribution) {
              const total = metric.distribution.reduce((a, b) => a + b, 0);
              assert.equal(total, 100, `${record.wineVintageId}.${metric.key} sums to ${total}`);
            }
          }
        }
      }
    }
  );

  it(
    "sends no display strings — every value is a tagged carrier",
    function givenAnyRecordValue_whenItIsRead_thenItDeclaresHowItShouldBeRendered() {
      for (const record of records) {
        for (const group of record.groups) {
          for (const field of group.fields) {
            if (!field.value) continue;
            assert.ok(
              CARRIERS.has(field.value.source),
              `${record.wineVintageId}.${field.key} is a bare string`
            );
          }
        }
      }
    }
  );

  it(
    "keeps every vertical entry pointing at a wine that exists",
    function givenARecordWithAVertical_whenItsEntriesAreRead_thenEachResolves() {
      for (const record of records) {
        for (const entry of record.vertical ?? []) {
          const sibling = wineById.get(entry.wineVintageId);
          assert.ok(sibling, `${record.wineVintageId} points at missing ${entry.wineVintageId}`);
          assert.equal(sibling.wineLabelId, wineById.get(record.wineVintageId).wineLabelId);
        }
      }
    }
  );
});
