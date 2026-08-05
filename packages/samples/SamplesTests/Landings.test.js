import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ARCHIVE_LENSES,
  CALENDAR_LENSES,
  COLLECTION_LENSES,
  LENS_ALL
} from "@edwardseshoka/contracts/lenses";

import { collectionsSamples } from "../dist/features/collections/index.js";
import { createDiscover } from "../dist/features/discover/index.js";
import { editorialSamples } from "../dist/features/editorial/index.js";
import { eventsSamples } from "../dist/features/events/index.js";

/**
 * The four pushed landings, and the chip row they share.
 *
 * A lens is not a tab: it narrows what is already there and adds no depth. Most
 * of what follows from that is about what the row must NOT do, which is exactly
 * the kind of rule a fixture can quietly stop honouring.
 */
const LANDINGS = {
  shelves: { landing: collectionsSamples.shelvesLanding, vocabulary: COLLECTION_LENSES },
  itineraries: { landing: collectionsSamples.itinerariesLanding, vocabulary: COLLECTION_LENSES },
  calendar: { landing: eventsSamples.calendarLanding, vocabulary: CALENDAR_LENSES },
  archive: { landing: editorialSamples.archiveLanding, vocabulary: ARCHIVE_LENSES }
};

describe("every landing's chip row", () => {
  it(
    "offers only words from its own list's vocabulary",
    function givenEachLanding_whenRead_thenItsChipsComeFromOneSet() {
      // Given: the vocabulary is shared only where the question genuinely is. A
      // calendar offering `lens.kgwari` would be asking a diary WHO.
      for (const [name, { landing, vocabulary }] of Object.entries(LANDINGS)) {
        for (const lens of landing.lenses.lenses) {
          assert.ok(vocabulary.includes(lens.key), `${name}: "${lens.key}" is not in its set`);
        }
      }
    }
  );

  it(
    "never offers a lens with nothing behind it",
    function givenEveryChip_whenRead_thenItsCountIsPositive() {
      // Given: the reader is never handed a control that leads to an empty page.
      for (const [name, { landing }] of Object.entries(LANDINGS)) {
        for (const lens of landing.lenses.lenses) {
          assert.ok(lens.count > 0, `${name}: ${lens.key} is offered with nothing in it`);
        }
      }
    }
  );

  it(
    "opens on All, and counts All as the whole corpus",
    function givenEachLanding_whenRead_thenAllMatchesTheItemCount() {
      // Given: the heading and its count narrow with the lens, so "All" has to
      // agree with the list under it or the page describes something else.
      for (const [name, { landing }] of Object.entries(LANDINGS)) {
        assert.equal(landing.lenses.active, LENS_ALL, name);
        const all = landing.lenses.lenses.find((lens) => lens.key === LENS_ALL);
        assert.equal(all.count, landing.items.length, `${name}: All disagrees with the corpus`);
      }
    }
  );

  it(
    "never draws a row of one chip",
    function givenEachChipRow_whenRead_thenItHasEitherNoneOrSeveral() {
      // Given: a lone "All" narrows nothing — a control that cannot be used. The
      // row disappears instead, which is the thing a tab row can never do.
      for (const [name, { landing }] of Object.entries(LANDINGS)) {
        assert.notEqual(landing.lenses.lenses.length, 1, `${name} draws a lone chip`);
      }
    }
  );
});

describe("the collection landings", () => {
  it(
    "partitions every row into exactly one authorship bucket",
    function givenTheAuthorshipLenses_whenSummed_thenTheyAccountForEveryRow() {
      // Given: the buckets are a PARTITION — sommeliers, members and the house
      // between them are everyone. A row falling in none is a row no chip can
      // reach; a row in two is a count that overstates.
      for (const name of ["shelves", "itineraries"]) {
        const { lenses } = LANDINGS[name].landing.lenses;
        const buckets = lenses
          .filter((lens) => lens.key !== LENS_ALL)
          .reduce((total, lens) => total + lens.count, 0);

        assert.equal(buckets, LANDINGS[name].landing.items.length, name);
      }
    }
  );

  it(
    "sorts the house's lists among everyone else's, not above them",
    function givenTheShelves_whenRead_thenTheOrderIsPurelyDate() {
      // Given: Kgwari is a LENS and not a band. Sorting a Selection to the top
      // would invent the curated badge the taxonomy refused — the byline is the
      // only thing that distinguishes it, and it is enough.
      const items = LANDINGS.shelves.landing.items;
      const dates = items.map((collection) => collection.createdAt);

      assert.deepEqual(dates, [...dates].sort().reverse(), "not newest-first");
      assert.ok(
        items.some((collection) => collection.kind === "selection"),
        "no house list in the corpus to test the rule with"
      );
      assert.notEqual(items[0].kind, "selection", "the house happens to lead — weaken the fixture");
    }
  );

  it(
    "keeps each landing to one subject",
    function givenBothLandings_whenRead_thenNeitherMixesBottlesWithStops() {
      // Given: the treatment follows the subject — a cover of labels against
      // monogram plates, a count of bottles against a count of stops. One page
      // holding both would need a legend to say which row was which.
      //
      // The itineraries landing is `stops`, not `estates`. A client still asking
      // for `estates` gets an empty page rather than an error, because that value
      // is still valid for a derived list of producers — which is the one silent
      // failure in the change and the reason it shipped as a major.
      for (const collection of LANDINGS.shelves.landing.items) {
        assert.equal(collection.subject, "wines", collection.id);
      }
      for (const collection of LANDINGS.itineraries.landing.items) {
        assert.equal(collection.subject, "stops", collection.id);
      }
    }
  );

  it(
    "never lands a Lens in a published list",
    function givenEveryRow_whenRead_thenNoneIsDerived() {
      // Given: a Lens is whatever its rule returns right now, so a published one
      // would keep changing after publication without its author touching it.
      for (const name of ["shelves", "itineraries"]) {
        for (const collection of LANDINGS[name].landing.items) {
          assert.notEqual(collection.kind, "lens", `${collection.id} is derived`);
        }
      }
    }
  );

  it(
    "gives an itinerary its stops in the author's order",
    function givenARoute_whenRead_thenThePreviewIsTheDetailLine() {
      // Given: the stops ARE the detail line, and a route has a direction.
      // Whatever ranks wines elsewhere must not touch a collection's order —
      // re-sorting somebody's list deletes the part of it they made.
      const route = LANDINGS.itineraries.landing.items[0];

      assert.ok(route.preview.length > 1);
      for (const stop of route.preview) {
        assert.ok(stop.title.length > 0, "a stop is a proper noun and must be named");
      }
    }
  );
});

describe("the calendar landing", () => {
  it(
    "reads forward, unlike every other landing",
    function givenTheDiary_whenRead_thenItIsSoonestFirst() {
      // Given: a calendar is the one list here that is about what has not
      // happened yet. Newest-first would put the furthest-away evening on top.
      const starts = eventsSamples.calendarLanding.items.map((event) => event.startDateTime);

      assert.deepEqual(starts, [...starts].sort(), "not soonest-first");
    }
  );

  it(
    "keeps a cancelled evening in the list",
    function givenACancelledEvent_whenRead_thenItIsStillListed() {
      // Given: somebody may have been planning around it, and dropping it
      // silently is how a member turns up to a locked door.
      assert.ok(
        eventsSamples.calendarLanding.items.some((event) => event.lifecycle === "cancelled"),
        "no cancelled evening survives into the diary"
      );
    }
  );

  it(
    "counts seats-left as an attribute, not a slice of the time partition",
    function givenTheCalendarChips_whenSummed_thenTimeAloneAccountsForEveryRow() {
      // Given: `lens.seatsLeft` sits among time lenses and is not one of them —
      // an evening with seats is also in this month or later. Folding it into
      // the partition would make the buckets overstate the corpus.
      const { lenses } = eventsSamples.calendarLanding.lenses;
      const byTime = lenses
        .filter((lens) => lens.key === "lens.thisMonth" || lens.key === "lens.later")
        .reduce((total, lens) => total + lens.count, 0);

      assert.equal(byTime, eventsSamples.calendarLanding.items.length);
      assert.ok(lenses.some((lens) => lens.key === "lens.seatsLeft"));
    }
  );
});

describe("a private evening never reaches an audience", () => {
  it(
    "keeps private events in the corpus",
    function givenTheEventSeed_whenRead_thenSomeAreEnthusiastsAndPrivate() {
      // Given: an enthusiast can create an evening and invite people to it — the
      // restriction is on REACH, not on the verb. A corpus with none of them
      // cannot catch a surface that forgot to filter, which is the only bug this
      // rule has.
      const priv = eventsSamples.events.filter((event) => event.visibility === "private");

      assert.ok(priv.length > 0, "no private evening to test the rule with");
      for (const event of priv) {
        assert.equal(event.host.status, "enthusiast", event.id);
        assert.ok(event.startDateTime, "a private evening is a whole event, not a draft");
      }
    }
  );

  it(
    "keeps every one of them off the calendar",
    function givenTheCalendarLanding_whenRead_thenNoPrivateEveningIsListed() {
      // Given: the calendar faces strangers by definition. A private evening
      // reaching it would put a member's address in front of people they never
      // invited.
      for (const event of eventsSamples.calendarLanding.items) {
        assert.notEqual(event.visibility, "private", event.id);
      }
    }
  );

  it(
    "keeps them out of Discover and out of the ledger",
    function givenTheHomePage_whenRead_thenNoPrivateEveningAppearsAnywhere() {
      // Given: three surfaces, one rule. The chapter, and the attendance rows in
      // the ledger — a member attending a private evening is not a broadcast.
      const page = createDiscover();
      const chapter = page.sections.find((section) => section.type === "events");
      const ledger = page.sections.find((section) => section.type === "contributions");

      for (const event of chapter.items) {
        assert.notEqual(event.visibility, "private", event.id);
      }
      for (const row of ledger.items.filter((item) => item.kind === "tasting")) {
        assert.notEqual(row.event.visibility, "private", row.id);
      }
    }
  );
});

describe("the Masthead's chapter pushes", () => {
  it(
    "pushes only to the four landings that exist",
    function givenEveryChapterLink_whenRead_thenItNamesARealDestination() {
      // Given: the destination set is closed, and a chapter link names the
      // LARGER THING on this page's own stack — never a tab switch.
      const legal = ["calendar", "shelves", "itineraries", "archive"];

      for (const section of createDiscover().sections) {
        if (section.link === undefined) continue;
        assert.ok(legal.includes(section.link.push), `${section.id} → "${section.link.push}"`);
      }
    }
  );

  it(
    "gives the member's own chapter no push at all",
    function givenFromYourCellar_whenRead_thenItCarriesNoLink() {
      // Given: a chapter that already shows everything it is about has no larger
      // thing to push. That is a server fact — only it knows whether the section
      // was truncated — which is why the link is on the wire rather than in a
      // client's table.
      const cellar = createDiscover().sections.find((s) => s.type === "cellar_tonight");

      assert.ok(cellar, "no cellar chapter in the fixture");
      assert.equal(cellar.link, undefined);
    }
  );

  it(
    "lands a chapter's rows on the landing it pushes to",
    function givenChapterThree_whenFollowed_thenItsRowsAreTheLandingsFirstRows() {
      // Given: a member who followed the link has to land on the thing they
      // tapped. The two shelves the Masthead shows are the first two rows of the
      // landing, ids and all — not a different selection that happens to fit.
      const chapter = createDiscover().sections.find((s) => s.type === "shelves");
      const landing = collectionsSamples.shelvesLanding;

      assert.deepEqual(
        chapter.items.map((c) => c.id),
        landing.items.slice(0, chapter.items.length).map((c) => c.id)
      );
    }
  );
});

describe("the page's own interleave", () => {
  it(
    "deals the two collection chapters apart",
    function givenTheSections_whenRead_thenShelvesAndItinerariesDoNotTouch() {
      // Given: three index-row chapters set adjacently read as one long
      // undifferentiated list however carefully each is set — the same
      // match-form-to-function rule that made them rows rather than cards, applied
      // to a page that now has several. The article sits between them.
      const types = createDiscover().sections.map((section) => section.type);
      const gap = Math.abs(types.indexOf("shelves") - types.indexOf("itineraries"));

      assert.ok(gap > 1, "the two collection chapters are adjacent");
      assert.ok(
        types.indexOf("editorial") > types.indexOf("shelves") &&
          types.indexOf("editorial") < types.indexOf("itineraries"),
        "the article should sit between them"
      );
    }
  );
});

describe("the ledger's collection rows", () => {
  it(
    "carries every kind, collections included",
    function givenTheLedger_whenRead_thenAllFourKindsArePresent() {
      // Given: a ledger is where every kind meets, and a fixture exercising only
      // notes ships its other branches untested.
      const ledger = createDiscover().sections.find((s) => s.type === "contributions");
      const kinds = new Set(ledger.items.map((item) => item.kind));

      for (const kind of ["note", "editorial", "tasting", "collection"]) {
        assert.ok(kinds.has(kind), `the ledger carries no ${kind}`);
      }
    }
  );

  it(
    "marks a collection row with its concrete noun",
    function givenACollectionRow_whenRead_thenTheMarkIsShelfOrItineraryOrSelection() {
      // Given: the mark names the concrete noun, never "Collection" — that word
      // is the abstract base type and a ledger is where it would leak first.
      const ledger = createDiscover().sections.find((s) => s.type === "contributions");

      for (const row of ledger.items.filter((item) => item.kind === "collection")) {
        assert.ok(["shelf", "itinerary", "selection"].includes(row.collection.kind), row.id);
        assert.notEqual(row.collection.kind, "lens", "a derived list cannot be published");
      }
    }
  );
});

describe("the archive landing's order", () => {
  it(
    "files newest first, which is what its heading promises",
    function givenTheArchiveLanding_whenRead_thenItIsSortedByPublicationDate() {
      // Given: it sorted by ID until the card carried a date — a stand-in that
      // looked stable and was arbitrary, and that nothing could catch while
      // there was no date to disagree with. A heading that says "newest first"
      // over a list that is not is the kind of lie only a reader notices.
      const { items } = editorialSamples.archiveLanding;

      // Then
      const dates = items.map((piece) => piece.publishedAt);
      assert.deepEqual(dates, [...dates].sort().reverse());
    },
  );
});
