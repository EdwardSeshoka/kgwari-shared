import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  collectionsSamples,
  createWines,
  discoverSamples,
  provenanceSamples,
} from "../dist/index.js";

/**
 * The collections fixture, and the two kinds of bug a fixture like this has.
 *
 * A collection is a list of REFERENCES, so the first way it goes wrong is a
 * pointer at something that is not there — which renders as a card with a hole
 * in it, in every app double at once. The second is subtler and is what the
 * taxonomy exists to prevent: a collection whose contents do not match the
 * subject it claims. Both are invisible to the type checker.
 */

const SEEDS = {
  wines: () => createWines().map((wine) => wine.id),
  estates: () => provenanceSamples.producers.map((producer) => producer.id),
};

const BANDS = ["collection_shelves", "collection_itineraries"];

describe("collection samples", () => {
  it(
    "points every strip entry at a seed of the collection's own subject",
    function givenEveryPreviewEntry_whenResolved_thenItsSubjectsSeedCarriesIt() {
      // Given: the strip carries no kind of its own — `subject` says what these
      // are — so the only way to check a fixture is honest is to resolve each id
      // against the pool its subject names. A wine id in an estates collection
      // resolves nowhere, which is exactly the miscast this catches.
      for (const collection of collectionsSamples.collections) {
        const ids = SEEDS[collection.subject]();
        for (const item of collection.preview ?? []) {
          assert.ok(
            ids.includes(item.contentId),
            `${collection.id} (${collection.subject}): strip points at "${item.contentId}", which no ${collection.subject} sample carries`
          );
        }
      }
    }
  );

  it(
    "gives an estates collection nothing to draw, so the card must build a cover",
    function givenEveryItinerary_whenInspected_thenNoImagesArePresent() {
      // Given: an estate has no label, and inventing a building or a vine would
      // be inventing imagery the product does not have. A fixture that supplied
      // artwork would let a consumer that only renders images pass, and the
      // monogram path would ship untested.
      const estates = collectionsSamples.collections.filter((item) => item.subject === "estates");

      assert.ok(estates.length > 0);
      for (const collection of estates) {
        assert.equal(collection.cover, undefined, `${collection.id} should have no cover artwork`);
        for (const stop of collection.preview ?? []) {
          assert.equal(stop.image, undefined);
        }
      }
    }
  );

  it(
    "keeps the strip a handful of the list, never a census of it",
    function givenEveryCollection_whenCompared_thenThePreviewIsShorterThanTheCount() {
      // Given: `itemCount` is a fact about the collection; `preview` is a few of
      // it. A fixture where they match teaches a consumer that reading
      // `preview.length` as the count is safe, and it is not.
      for (const collection of collectionsSamples.collections) {
        const preview = collection.preview ?? [];
        assert.ok(
          preview.length < collection.itemCount,
          `${collection.id}: ${preview.length} strip entries for ${collection.itemCount} items`
        );
      }
    }
  );

  it(
    "carries no lens, because a lens is nobody's to render",
    function givenTheFixture_whenInspected_thenEveryKindIsPublishable() {
      // Given: a lens is derived, and a published thing's contents are only ever
      // changed by a person. Seeding one would put a thing that cannot be
      // published into the pool a feed reads from.
      for (const collection of collectionsSamples.collections) {
        assert.notEqual(collection.kind, "lens", `${collection.id} is a lens, which no feed may hold`);
      }
      assert.ok(collectionsSamples.collections.some((item) => item.kind === "shelf"));
      assert.ok(collectionsSamples.collections.some((item) => item.kind === "itinerary"));
      assert.ok(collectionsSamples.collections.some((item) => item.kind === "selection"));
    }
  );

  it(
    "tells editorial's list from a member's by the byline and nothing else",
    function givenTheFixture_whenInspected_thenEveryAuthorShapeIsPresent() {
      // Given: authorship is the byline. A fixture with only house lists never
      // exercises the mark; one with only verified authors never exercises its
      // absence.
      const authors = collectionsSamples.collections.map((collection) => collection.author);

      assert.ok(authors.some((author) => author.tier === "professional"));
      assert.ok(authors.some((author) => author.status === "collector"));
      assert.ok(
        authors.some((author) => !author.tier && !author.status),
        "editorial's own Selection carries a name and no mark"
      );
    }
  );

  it(
    "resolves the Cape Bordeaux doorway that used to lead nowhere",
    function givenTheCurationsCollectionDoorway_whenResolved_thenTheCollectionExists() {
      // Given: the curation has shipped a doorway targeting a collection since
      // before collections existed, and nothing resolved it. That is the bug
      // this fixture closes, so it is the one asserted by name.
      const targets = discoverSamples.curation.sections
        .filter((section) => section.type === "doorway_cards")
        .flatMap((section) => section.doorways)
        .filter((doorway) => doorway.target.kind === "collection")
        .map((doorway) => doorway.target.collectionId);
      const ids = collectionsSamples.collections.map((collection) => collection.id);

      assert.ok(targets.includes("collection_cape_bordeaux"));
      for (const target of targets) {
        assert.ok(ids.includes(target), `a doorway leads to collection "${target}", which no sample carries`);
      }
    }
  );

  it(
    "puts each band's collections in it by subject, not by merchandising whim",
    function givenTheCurationsBands_whenResolved_thenEachHoldsOneSubject() {
      // Given: a section type selects a TREATMENT, and the treatment follows the
      // subject — labels and bottle counts, or monogram plates and places. A
      // wines collection in the itineraries band would be drawn with a cover it
      // cannot fill.
      const byId = new Map(collectionsSamples.collections.map((item) => [item.id, item]));
      const expected = { collection_shelves: "wines", collection_itineraries: "estates" };

      for (const section of discoverSamples.curation.sections.filter((item) => BANDS.includes(item.type))) {
        assert.ok(section.itemRefs.length > 0, `${section.id} merchandises nothing`);
        for (const ref of section.itemRefs) {
          const collection = byId.get(ref.contentId);
          assert.ok(collection, `${section.id} references "${ref.contentId}", which no sample carries`);
          assert.equal(collection.subject, expected[section.type], `${collection.id} is in the wrong band`);
        }
      }
    }
  );

  it(
    "merchandises only collections whose author has reach",
    function givenTheCurationsBands_whenResolved_thenNoMemberStatusBylineIsInThem() {
      // Given: creating a collection is free; being merchandised on Discover is
      // the tiered capability. A member's own shelf may be published, may be
      // followed, and may even have a house-curated doorway pointed at it — what
      // it may not do is fill a band on its own. The collector-authored Cape
      // Bordeaux is in the fixture precisely to be excluded here.
      const byId = new Map(collectionsSamples.collections.map((item) => [item.id, item]));
      const banded = discoverSamples.curation.sections
        .filter((section) => BANDS.includes(section.type))
        .flatMap((section) => section.itemRefs);

      for (const ref of banded) {
        const { author, id } = byId.get(ref.contentId);
        assert.ok(
          author.tier !== undefined || author.status === undefined,
          `${id}: a member-status byline has no reach into a Discover band`
        );
      }
      assert.ok(!banded.some((ref) => ref.contentId === "collection_cape_bordeaux"));
    }
  );
});
