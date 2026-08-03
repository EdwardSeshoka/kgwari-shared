import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { COLLECTION_KINDS } from "../../dist/collections/index.js";
import { CollectionContract } from "../../dist/collections/test-doubles/index.js";

/**
 * The collection card's rules, as opposed to its shape.
 *
 * A type checks the shape at compile time and says nothing about the decisions
 * that actually govern this contract — most of which are ABSENCES, and an
 * absence is exactly what a type cannot assert. Declining to declare
 * `visibility` is a decision any reader can undo in one line believing it an
 * oversight; a test is what makes it a rule instead of a habit.
 */
describe("collection card", () => {
  it(
    "has four nouns and no fifth",
    function givenTheKinds_whenRead_thenTheyAreTheFourTheTaxonomyNames() {
      // Given: two axes — enumerated vs derived, member-made vs editorial —
      // produce four types and only four. `index` is absent on purpose: the
      // catalogue cut by a facet is browse, nobody authored it, and it needs no
      // member-facing noun at all.
      assert.deepEqual([...COLLECTION_KINDS], ["shelf", "itinerary", "lens", "selection"]);
    }
  );

  it(
    "never carries visibility, because the reach filter is the server's",
    function givenEveryPublishedDouble_whenInspected_thenNoneStatesVisibility() {
      // Given: a card that reaches a reader has already passed the gate. A flag
      // on the wire invites each client to re-implement the filter, and a
      // client-side privacy filter is one bug away from rendering a member's
      // private list.
      for (const make of factories()) {
        assert.ok(!("visibility" in make()), "the gate is passed before the card is built");
      }
    }
  );

  it(
    "never carries its items, only a strip of them",
    function givenEveryPublishedDouble_whenInspected_thenNoneCarriesItems() {
      // Given: a card that resolved its refs would fan out across the catalogue
      // and the provenance domain per card, on the app's most-requested
      // endpoint, to draw three thumbnails.
      for (const make of factories()) {
        const collection = make();
        assert.ok(!("items" in collection), "the ordered list belongs to the collection's endpoint");
        assert.ok((collection.preview ?? []).length < collection.itemCount);
      }
    }
  );

  it(
    "cannot say what kind a preview entry is, so a collection cannot mix",
    function givenEveryPreviewEntry_whenInspected_thenNoneStatesAKind() {
      // Given: the collection's `subject` says whether these are wines or
      // estates, and an entry states no kind of its own — which makes a mixed
      // collection inexpressible rather than merely discouraged. Wines and
      // stories together is the Save mechanism: different verb, different
      // object, and letting a shelf hold a story collapses the two one-way.
      for (const make of factories()) {
        for (const item of make().preview ?? []) {
          assert.deepEqual(
            Object.keys(item).filter((key) => key !== "contentId" && key !== "title" && key !== "image"),
            [],
            "a preview entry is an id, a caption and maybe an image — never a kind"
          );
        }
      }
    }
  );

  it(
    "counts one subject, because a collection has exactly one",
    function givenAShelfAndAnItinerary_whenCompared_thenNeitherCountsTheOthersSubject() {
      // Given: a shelf counts bottles and an itinerary counts estates, and
      // nothing is part one and part the other. A separate wine count would be a
      // field that only makes sense if a collection could be mixed.
      const shelf = CollectionContract.StubFactory.make();
      const itinerary = CollectionContract.StubFactory.makeItinerary();

      // Then
      assert.equal(shelf.subject, "wines");
      assert.equal(itinerary.subject, "estates");
      for (const collection of [shelf, itinerary]) {
        assert.ok(!("wineCount" in collection), "`subject` already says what `itemCount` counts");
      }
    }
  );

  it(
    "gives an estate no artwork to render, on purpose",
    function givenAnItinerary_whenInspected_thenNothingCarriesAnImage() {
      // Given: an estate has no label to show, and drawing a building or a vine
      // would be inventing imagery the product does not have. The cover is a
      // monogram plate built from the title — honest, cheap, and unmistakably
      // not a bottle.
      const itinerary = CollectionContract.StubFactory.makeItinerary();

      // Then
      assert.equal(itinerary.cover, undefined);
      for (const stop of itinerary.preview) {
        assert.equal(stop.image, undefined);
      }
    }
  );

  it(
    "keeps a lens out of anything that renders published collections",
    function givenALens_whenRead_thenItIsDerivedAndUnfollowable() {
      // Given: a published thing's contents are only ever changed by a person. A
      // lens is derived, so a published one would keep changing after
      // publication without its author touching it — a stranger following it and
      // the member whose name is on it would both be looking at something
      // neither has seen. The way there is to FREEZE it, which runs the rule
      // once, fixes the result and discards the rule.
      //
      // The double returns the wider contract for exactly this reason, so
      // handing it to a Discover band does not compile. What is checkable here
      // is the other half: nothing derived is followable.
      const lens = CollectionContract.StubFactory.makeLens();

      // Then
      assert.equal(lens.kind, "lens");
      assert.equal(lens.saveCount, undefined);
    }
  );

  it(
    "attributes the house with a name and no mark",
    function givenASelection_whenRead_thenTheBylineCarriesNoTierOrStatus() {
      // Given: Kgwari does not wear a verification mark on its own content, and
      // a client that renders a mark whenever `author` is present gets it wrong
      // here first. Authorship is the byline — there is no second field to tell
      // editorial's list from a member's.
      const selection = CollectionContract.StubFactory.makeSelection();

      // Then
      assert.equal(selection.kind, "selection");
      assert.equal(selection.author.name, "Kgwari");
      assert.equal(selection.author.tier, undefined);
      assert.equal(selection.author.status, undefined);
    }
  );

  it(
    "renders with nothing to look at",
    function givenAMembersFirstShelf_whenRead_thenTheOptionalsAreAbsentNotEmpty() {
      // Given: a shelf an hour old has no artwork, no blurb and no strip. The
      // optionals are removed rather than emptied — `preview: []` would let a
      // client that draws an empty strip pass.
      const bare = CollectionContract.StubFactory.makeUndescribed();

      // Then
      assert.equal(bare.cover, undefined);
      assert.equal(bare.description, undefined);
      assert.equal(bare.preview, undefined);
      assert.equal(bare.title, "things to try");
    }
  );
});

/** The published factories — every state a reader can be shown. */
function factories() {
  return Object.entries(CollectionContract.StubFactory)
    .filter(([name, fn]) => typeof fn === "function" && name !== "makeLens")
    .map(([, fn]) => fn);
}
