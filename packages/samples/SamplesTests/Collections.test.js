import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  collectionsSamples,
  createCollectionDetail,
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
      //
      // A `stops` strip resolves against the route's own detail rather than a domain
      // seed, because a stop id belongs to the itinerary that made it. That pool used
      // not to exist — see `RouteDetails.test.js`, which now checks every strip entry
      // against the stops the page actually has.
      for (const collection of collectionsSamples.collections) {
        const ids =
          collection.subject === "stops"
            ? createCollectionDetail(collection.id).items.map((item) => item.stop.id)
            : SEEDS[collection.subject]();
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
    "keys a route's strip on the stop, so a route that doubles back draws both",
    function givenEveryItinerary_whenItsStripIsRead_thenEachEntryIsAUniqueStopAndNotAnEstate() {
      // Given: a route can call at one estate twice — a morning tasting and
      // dinner — so the producer id is not unique within an itinerary and a strip
      // keyed on it silently draws one plate for two stops. The caption is still
      // the place's name; only the key is the stop's.
      const estateIds = SEEDS.estates();
      const routes = collectionsSamples.collections.filter((item) => item.subject === "stops");

      assert.ok(routes.length > 0, "the fixture has to carry routes for this to mean anything");
      for (const route of routes) {
        const keys = (route.preview ?? []).map((entry) => entry.contentId);
        assert.equal(new Set(keys).size, keys.length, `${route.id}: two strip entries share a key`);
        for (const key of keys) {
          assert.ok(
            !estateIds.includes(key),
            `${route.id}: strip keys on "${key}", which is a place — a route keys on the stop`
          );
        }
      }
    }
  );

  it(
    "carries both tenses, because a plan and a write-up are opposite cards",
    function givenTheRoutes_whenTheirModesAreRead_thenBothArePresentAndOnlyRecordsTally() {
      // Given: a plan and a record are the same shape pointed in opposite
      // directions, and only one of them may offer a way to book the evenings it
      // names. A fixture generated entirely from one mode cannot tell a working
      // card from one that renders every route as a diary.
      //
      // `contents` must be ABSENT on a plan rather than zeroed: "0 wines · 0
      // notes" turns an itinerary somebody has not driven yet into an empty diary.
      const routes = collectionsSamples.collections.filter((item) => item.subject === "stops");
      const modes = new Set(routes.map((route) => route.mode));

      assert.deepEqual([...modes].sort(), ["documented", "planned"]);
      for (const route of routes) {
        if (route.mode === "planned") {
          assert.equal(route.contents, undefined, `${route.id} is a plan and has nothing to tally`);
        } else {
          assert.ok(route.contents, `${route.id} happened, so its sub-line needs a tally`);
          // NOT `wines >= stops`. A route with a lunch and a tram pours nothing at two
          // of its five stops, so fewer wines than stops is the normal shape of a real
          // day — the assertion that said otherwise was written against invented
          // numbers and failed the moment the tally was derived from actual pours.
          assert.equal(typeof route.contents.wines, "number");
          assert.equal(typeof route.contents.notes, "number");
          assert.ok(route.contents.notes <= route.contents.wines, `${route.id}: more notes than wines poured`);
        }
      }
    }
  );

  it(
    "gives a place nothing to draw, so the card must build a cover",
    function givenEveryItinerary_whenInspected_thenNoImagesArePresent() {
      // Given: a place has no label, and inventing a building or a vine would
      // be inventing imagery the product does not have. A fixture that supplied
      // artwork would let a consumer that only renders images pass, and the
      // monogram path would ship untested.
      //
      // A documented route is no exception because wines were poured on it:
      // borrowing a label from inside a stop would make one arbitrary bottle stand
      // for the morning, and the stops that poured nothing would be the only
      // plates on the strip.
      const places = collectionsSamples.collections.filter((item) => item.subject === "stops");

      assert.ok(places.length > 0);
      for (const collection of places) {
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
      const expected = { collection_shelves: "wines", collection_itineraries: "stops" };

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
    "merchandises a route in both tenses, so neither treatment ships untested",
    function givenTheItinerariesBand_whenItsRowsAreRead_thenBothModesAreDrawn() {
      // Given: a plan and a record are opposite cards in the same band — opposite
      // tense, and only one of them may offer a way to book the evenings it names.
      // A band drawn entirely out of plans cannot tell a working section from one
      // that renders every route as a diary, and this is the fixture that decides
      // it.
      //
      // Both bands that draw routes are seeded for this deliberately rather than
      // by luck: the curation's two ids are fixed in `orig-collections.json`, and
      // Discover's "where to go next" pair is why `ITINERARY_TITLES` assigns modes
      // by position instead of alternating.
      const byId = new Map(collectionsSamples.collections.map((item) => [item.id, item]));
      const drawn = discoverSamples.curation.sections
        .filter((section) => section.type === "collection_itineraries")
        .flatMap((section) => section.itemRefs.map((ref) => byId.get(ref.contentId)?.mode));

      assert.ok(drawn.length > 1, "one row cannot carry two tenses");
      assert.deepEqual([...new Set(drawn)].sort(), ["documented", "planned"]);
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
