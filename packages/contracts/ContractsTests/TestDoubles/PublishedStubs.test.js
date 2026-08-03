import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as catalog from "../../dist/catalog/test-doubles/index.js";
import * as cellar from "../../dist/cellar/test-doubles/index.js";
import * as collections from "../../dist/collections/test-doubles/index.js";
import * as contributions from "../../dist/contributions/test-doubles/index.js";
import * as discover from "../../dist/discover/test-doubles/index.js";
import * as editorial from "../../dist/editorial/test-doubles/index.js";
import * as events from "../../dist/events/test-doubles/index.js";
import * as lenses from "../../dist/lenses/test-doubles/index.js";
import * as media from "../../dist/media/test-doubles/index.js";
import * as member from "../../dist/member/test-doubles/index.js";
import * as money from "../../dist/money/test-doubles/index.js";
import * as provenance from "../../dist/provenance/test-doubles/index.js";
import * as search from "../../dist/search/test-doubles/index.js";
import * as social from "../../dist/social/test-doubles/index.js";
import * as text from "../../dist/text/test-doubles/index.js";
import * as trust from "../../dist/trust/test-doubles/index.js";

/**
 * Every double this package publishes, exercised once.
 *
 * The doubles are the package's most-used export and the least-tested code in
 * it. `defineStub` checks the BASE literal at compile time, which is most of the
 * value — but it checks nothing about the extra factories each stub adds on top,
 * and those are where the interesting states live: the sold-out event, the
 * faulted note, the cause piece that may carry no commerce. A factory that
 * throws, returns nothing, or hands out a shared object fails here rather than
 * inside somebody else's test suite, where it would read as their bug.
 *
 * Deliberately generic: it sweeps the barrels rather than naming factories, so a
 * double added tomorrow is covered without anybody remembering to add it.
 */
const BARRELS = {
  catalog,
  cellar,
  collections,
  contributions,
  discover,
  editorial,
  events,
  lenses,
  media,
  member,
  money,
  provenance,
  search,
  social,
  text,
  trust
};

function everyFactory() {
  const found = [];
  for (const [domain, barrel] of Object.entries(BARRELS)) {
    for (const [name, double] of Object.entries(barrel)) {
      for (const [method, fn] of Object.entries(double.StubFactory ?? {})) {
        if (typeof fn === "function") found.push({ domain, name, method, fn });
      }
    }
  }
  return found;
}

describe("the published test doubles", () => {
  it(
    "exposes a StubFactory on every double, in every domain",
    function givenEveryBarrel_whenRead_thenEachExportIsAStubFactory() {
      // Given: the shape IS the api. A double exported as a bare object rather
      // than `{ StubFactory }` still imports fine and fails only at the call
      // site, in whichever consumer reached for it first.
      for (const [domain, barrel] of Object.entries(BARRELS)) {
        const names = Object.keys(barrel);
        assert.ok(names.length > 0, `${domain}/test-doubles exports nothing`);

        for (const name of names) {
          assert.equal(
            typeof barrel[name]?.StubFactory,
            "object",
            `${domain}.${name} has no StubFactory`
          );
          assert.equal(
            typeof barrel[name].StubFactory.make,
            "function",
            `${domain}.${name} has no make()`
          );
        }
      }
    }
  );

  it(
    "builds something from every factory, not only from make()",
    function givenEveryFactory_whenCalled_thenAnObjectComesBack() {
      // Given: the named factories are the whole point of shipping doubles rather
      // than fixtures — `makeSoldOut`, `makeFaulted`, `makeCause` model the states
      // a consumer gets wrong. Nothing called them until this test existed.
      const factories = everyFactory();
      assert.ok(factories.length > 40, `only ${factories.length} factories swept`);

      for (const { domain, name, method, fn } of factories) {
        const made = fn();
        assert.equal(
          typeof made,
          "object",
          `${domain}.${name}.${method}() did not return an object`
        );
        assert.notEqual(made, null, `${domain}.${name}.${method}() returned null`);
      }
    }
  );

  it(
    "hands every caller its own object",
    function givenTwoCalls_whenCompared_thenNothingIsShared() {
      // Given: a factory returning one shared instance lets one test's mutation
      // reach another, and the failure surfaces in file order rather than at the
      // cause. The text carriers are excluded — they take a value and return a
      // fresh literal, so identity is not what they promise.
      for (const { domain, name, method, fn } of everyFactory()) {
        assert.notEqual(
          fn(),
          fn(),
          `${domain}.${name}.${method}() hands out the same object twice`
        );
      }
    }
  );
});

describe("the doubles for the contracts added in 7.0", () => {
  it(
    "tags every contribution variant with the kind that matches its payload",
    function givenTheThreeVariants_whenBuilt_thenEachCarriesItsOwnPayload() {
      // Given: a union double is worth nothing if every factory builds the same
      // variant. The interleave is what `ContributionContract` exists for, so all
      // three kinds have to be buildable — and each must carry the payload its
      // own discriminant promises, which is the pairing the union forbids getting
      // wrong.
      const note = contributions.ContributionContract.StubFactory.make();
      const story = contributions.ContributionContract.StubFactory.makeEditorial();
      const tasting = contributions.ContributionContract.StubFactory.makeTasting();

      assert.equal(note.kind, "note");
      assert.ok(note.note.wineVintageId);
      assert.equal(story.kind, "editorial");
      assert.ok(story.editorial.contentType);
      assert.equal(tasting.kind, "tasting");
      assert.ok(tasting.event.id);
    }
  );

  it(
    "sorts a mixed stream by createdAt without switching on kind",
    function givenAllThreeKinds_whenSorted_thenOneOrderingCoversThem() {
      // Given: `createdAt` sits on the envelope precisely so a ledger can sort
      // without knowing what it holds. A story filed at 09:02 and a note at 10:15
      // have exactly one correct order, and it is not "notes first".
      const rows = [
        contributions.ContributionContract.StubFactory.make(),
        contributions.ContributionContract.StubFactory.makeEditorial(),
        contributions.ContributionContract.StubFactory.makeTasting()
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      assert.deepEqual(
        rows.map((row) => row.kind),
        ["note", "editorial", "tasting"]
      );
    }
  );

  it(
    "models a note that answered nothing structured",
    function givenTheDefaultNote_whenRead_thenReadingsAreAbsent() {
      // Given: prose plus a verdict is a COMPLETE note, and most real ones carry
      // no readings at all. A default that always carried them would teach every
      // consumer that `readings` is safe to dereference.
      const plain = social.TastingNoteContract.StubFactory.make();
      const full = social.TastingNoteContract.StubFactory.makeWithReadings();

      assert.equal(plain.readings, undefined);
      assert.ok(full.readings.scales.length > 0);
    }
  );

  it(
    "models the faulted bottle the register has to exclude",
    function givenAFaultedReading_whenRead_thenItReportsAFaultRatherThanACleanBottle() {
      // Given: the invariant is that a fault never counts against the wine's
      // record. A suite with no faulted row cannot catch an aggregation that
      // marks an estate down for a bad cork.
      const clean = social.NoteReadingsContract.StubFactory.make();
      const faulted = social.NoteReadingsContract.StubFactory.makeFaulted();

      assert.equal(clean.condition, "condition.noFaults");
      assert.equal(faulted.condition, "condition.corked");
    }
  );

  it(
    "models a cause piece carrying none of the blocks its type forbids",
    function givenACausePiece_whenBuilt_thenItHasNoOfferOrPairing() {
      // Given: the double has to be able to express the rule, or the rule is only
      // ever tested against pieces that happen to comply.
      const cause = editorial.EditorialDetailContract.StubFactory.makeCause();

      assert.equal(cause.contentType, "cause");
      assert.equal(cause.offer, undefined);
      assert.equal(cause.pairing, undefined);
      assert.equal(cause.event, undefined);
    }
  );

  it(
    "points a claim at the record row it answered",
    function givenTheDetailDouble_whenRead_thenItsClaimsCarryTheReverseIndex() {
      // Given: `claims[].answers[]` is the load-bearing part of the detail model
      // — it is what lets a wine record row cite the writing that established it.
      // A double without one leaves the arrow untested at both ends.
      const piece = editorial.EditorialDetailContract.StubFactory.make();
      const answered = piece.claims.flatMap((claim) => claim.answers ?? []);

      assert.ok(answered.length > 0);
      for (const answer of answered) {
        assert.ok(answer.wineVintageId, "an answer with no wine answers every record");
        assert.ok(answer.fieldKey, "an answer with no field answers no row");
      }
    }
  );

  it(
    "keeps a windowed tonight count apart from a lifetime one",
    function givenACellarTonightRow_whenRead_thenTheCountIsTheWindows() {
      // Given: `WineContract.noteCount` is lifetime and this one is not. The two
      // living side by side with similar names is exactly the confusion the row
      // was designed to prevent, so a double has to show a small number against a
      // wine that plainly has more.
      const row = discover.CellarTonightRowContract.StubFactory.make();
      const quiet = discover.TonightStatsContract.StubFactory.makeQuiet();

      assert.equal(typeof row.activityCount, "number");
      assert.ok(row.activityCount < 100);
      assert.equal(quiet.mostOpened, undefined, "a quiet night has no most-opened wine");
    }
  );

  it(
    "puts a published list in the ledger, marked by its concrete noun",
    function givenACollectionRow_whenRead_thenItsMarkComesFromTheCollectionKind() {
      // Given: the ledger is cut to carry every kind, and the mark names the
      // concrete noun — shelf, itinerary, selection — never "collection", which
      // is the abstract base type and would leak first here, because a ledger is
      // where every kind meets.
      const row = contributions.ContributionContract.StubFactory.makeCollection();
      const house = contributions.ContributionContract.StubFactory.makeHouseCollection();

      assert.equal(row.kind, "collection");
      assert.ok(["shelf", "itinerary", "selection"].includes(row.collection.kind));
      // A Lens is derived and can never be published, so it cannot reach a dated
      // stream at all — a shape a producer cannot construct, not a filter.
      assert.notEqual(row.collection.kind, "lens");
      assert.equal(house.collection.kind, "selection");
      assert.equal(house.author.tier, undefined, "the house carries a name and no mark");
    }
  );

  it(
    "keeps an unknown per-kind counter absent rather than zero",
    function givenTheMemberDoubles_whenRead_thenAbsentAndZeroStayDifferentFacts() {
      // Given: `noteCount` is required and 0 is a true statement — a member who
      // has written nothing has written nothing. The counters added in 7.0 are
      // OPTIONAL, and absent means the record predates the field. A profile
      // rendering `storyCount ?? 0` as "0 stories" reports a fact it never
      // checked.
      const plain = member.MemberContract.StubFactory.make();
      const writer = member.MemberContract.StubFactory.makeWriter();

      assert.equal(plain.noteCount, 241);
      assert.equal(plain.storyCount, undefined);
      assert.equal(plain.avatar, null, "no picture is null on the wire, not absent");
      assert.equal(writer.storyCount, 21);
      assert.ok(writer.noteCount > writer.storyCount * 50, "notes outnumber stories");
    }
  );

  it(
    "models the two event lifecycles a clock cannot derive",
    function givenACancelledEvent_whenRead_thenItsFutureDateDoesNotImplyItIsOpen() {
      // Given: `cancelled` is RECORDED, not derived — the start time is still in
      // the future and the seats still exist. A consumer computing lifecycle from
      // dates and counts sells somebody a seat at an evening that is off.
      const cancelled = events.EventContract.StubFactory.makeCancelled();
      const announced = events.EventContract.StubFactory.makeAnnounced();

      assert.equal(cancelled.lifecycle, "cancelled");
      assert.ok(cancelled.startDateTime, "the clock still says it is upcoming");
      assert.equal(cancelled.booking, undefined, "a cancelled evening takes no bookings");
      assert.equal(announced.venue.room.source, "canonical");
      assert.ok(announced.timezone, "the venue's zone is what a reader needs");
    }
  );
});
