import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AROMAS,
  AROMAS_RED,
  AROMAS_WHITE,
  CATALOG_CHROME_KEYS,
  CLOSURES,
  FERMENTS,
  GRAPES,
  SOILS,
  TASTING_SCALES
} from "../../dist/catalog/index.js";

const VOCABULARIES = { CLOSURES, SOILS, FERMENTS, AROMAS, GRAPES };

describe("the closed vocabularies", () => {
  it(
    "carries keys, never display words",
    function givenEveryVocabulary_whenRead_thenEveryEntryIsANamespacedKey() {
      // Given: `GRAPES` used to hold "Cabernet Sauvignon" and the generator
      // derived `grape.cabernetSauvignon` with a string transform — so the valid
      // key set was whatever that transform produced, and renaming a grape
      // silently orphaned its catalog entry.
      for (const [name, vocabulary] of Object.entries(VOCABULARIES)) {
        for (const key of vocabulary) {
          assert.match(key, /^[a-z]+\.[a-zA-Z0-9]+$/, `${name}: "${key}" is not a chrome key`);
        }
      }
    }
  );

  it(
    "has no duplicates within a vocabulary",
    function givenEveryVocabulary_whenRead_thenEachKeyAppearsOnce() {
      // Given: a duplicate is a translation somebody will supply twice and a
      // picker that offers the same option twice.
      for (const [name, vocabulary] of Object.entries(VOCABULARIES)) {
        assert.equal(new Set(vocabulary).size, vocabulary.length, `${name} has duplicates`);
      }
    }
  );

  it(
    "keeps red and white aromas disjoint, and AROMAS the union of both",
    function givenTheAromaSplit_whenCombined_thenNothingIsLostOrDoubled() {
      // Given: the split is a property of the vocabulary, not of one caller —
      // `aroma.blackcurrant` does not belong to a Chenin, and both a generator
      // and a note picker need to know that without re-deriving it.
      const overlap = AROMAS_RED.filter((a) => AROMAS_WHITE.includes(a));

      assert.deepEqual(overlap, []);
      assert.equal(AROMAS.length, AROMAS_RED.length + AROMAS_WHITE.length);
    }
  );
});

describe("the tasting scales", () => {
  it(
    "gives every metric exactly five rungs",
    function givenEveryMetric_whenRead_thenTheScaleIsFivePointsLong() {
      // Given: a client renders a mark by INDEX, so a scale of another length
      // would put the mark in the wrong place rather than fail.
      for (const [metric, rungs] of Object.entries(TASTING_SCALES)) {
        assert.equal(rungs.length, 5, `${metric} has ${rungs.length} rungs`);
      }
    }
  );

  it(
    "labels the ends and the centre, and leaves the between-rungs blank",
    function givenAScale_whenRead_thenTheBlanksArePositional() {
      // Given: the empty strings are deliberate padding that keeps the array
      // positional — omitting them would make a client count labels instead.
      for (const rungs of Object.values(TASTING_SCALES)) {
        assert.deepEqual([rungs[1], rungs[3]], ["", ""]);
        for (const i of [0, 2, 4]) assert.ok(rungs[i].length > 0);
      }
    }
  );
});

describe("the enumerable key list", () => {
  it(
    "contains every vocabulary, so a locale catalogue can be checked against it",
    function givenTheKeyList_whenCompared_thenNoVocabularyIsMissing() {
      // Given: this list is the REASON the vocabularies left the seed
      // generator. Seven launch locales need to know what must be translated,
      // and a set nobody can enumerate cannot be checked — which is how `af`
      // came to carry 238 keys to `en`'s 416 with nothing reporting the gap.
      for (const vocabulary of Object.values(VOCABULARIES)) {
        for (const key of vocabulary) {
          assert.ok(CATALOG_CHROME_KEYS.includes(key), `${key} is not enumerated`);
        }
      }
    }
  );

  it(
    "lists the labelled scale rungs but not the blank padding",
    function givenTheKeyList_whenRead_thenNoEmptyStringIsOfferedForTranslation() {
      assert.ok(!CATALOG_CHROME_KEYS.includes(""));
      assert.ok(CATALOG_CHROME_KEYS.includes("tasting.low"));
    }
  );

  it(
    "has no duplicates across vocabularies either",
    function givenTheWholeList_whenRead_thenEveryKeyIsUnique() {
      assert.equal(new Set(CATALOG_CHROME_KEYS).size, CATALOG_CHROME_KEYS.length);
    }
  );
});
