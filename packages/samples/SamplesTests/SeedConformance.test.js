import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AROMAS,
  BOTTLE_CONDITIONS,
  COLOUR_READINGS,
  DECANT_STEPS,
  GLASS_SHAPES,
  RIM_READINGS,
  TASTED_MODES,
  TASTING_SCALES
} from "@edwardseshoka/contracts/vocabulary";
import { VERDICTS } from "@edwardseshoka/contracts/trust";

import { createDiscover } from "../dist/features/discover/index.js";
import { editorialSamples } from "../dist/features/editorial/index.js";
import { eventsSamples } from "../dist/features/events/index.js";
import { socialSamples } from "../dist/features/social/index.js";
import { createWines, createWineRecords } from "../dist/features/catalog/index.js";

/**
 * The seeds, checked against the contracts they claim to satisfy.
 *
 * Every seed is CAST to its contract (`rawWines as WineContract[]`), never
 * checked against it, so the compiler has nothing to say about the values inside
 * — which is how `eventType: "masterclass"` shipped in the events fixture for
 * months against a union that has never had that member. A cast is a promise;
 * this is the part that keeps it.
 *
 * These assert the CLOSED VOCABULARIES in particular, because those are where a
 * cast is least protective and the damage is quietest: an unknown key does not
 * crash anything, it renders as a missing translation in whichever locale nobody
 * on the team reads.
 */
const notes = socialSamples.tastingNotes;
const events = eventsSamples.events;
const wines = createWines();
const records = createWineRecords();

describe("the event seeds", () => {
  it(
    "uses only event types the contract declares",
    function givenEverySeededEvent_whenRead_thenItsTypeIsInTheUnion() {
      // Given: the generator drew from a list containing "masterclass", which
      // `WineEventType` has never had, and omitted "launch", which it has.
      const legal = ["sommelier_led", "winemaker_dinner", "tasting", "pairing", "launch"];

      for (const event of events) {
        if (event.eventType === undefined) continue;
        assert.ok(legal.includes(event.eventType), `${event.id}: "${event.eventType}"`);
      }
    }
  );

  it(
    "keeps seats a derivation of capacity and taken",
    function givenACappedEvent_whenRead_thenTheThreeNumbersAgree() {
      // Given: `seatsAvailable` EQUALS `capacity - taken` when both are known.
      // Generating the three independently is how a fixture comes to advertise
      // nine seats at a dinner that has twenty of its twenty-four taken.
      for (const event of events) {
        if (event.capacity === undefined) continue;
        assert.equal(
          event.seatsAvailable,
          event.capacity - event.taken,
          `${event.id}: ${event.capacity} - ${event.taken} != ${event.seatsAvailable}`
        );
      }
    }
  );

  it(
    "offers a booking only on an evening somebody could still attend",
    function givenAPastOrCancelledEvent_whenRead_thenThereIsNothingToBook() {
      // Given: one is off and the other already happened. A fixture that offers
      // "request a seat" on last month's dinner teaches a consumer that booking
      // and lifecycle are independent, which is the coupling lifecycle exists for.
      for (const event of events) {
        if (event.lifecycle !== "past" && event.lifecycle !== "cancelled") continue;
        assert.equal(event.booking, undefined, `${event.id} is ${event.lifecycle}`);
      }
    }
  );

  it(
    "files a recap only after the evening it recaps",
    function givenARecap_whenRead_thenItsEventIsPastAndItsDateFollows() {
      // Given: a recap has its own `filedAt` precisely because it is written
      // afterwards, often by somebody other than the host. One dated before its
      // own event is a fixture that makes that field look decorative.
      for (const event of events) {
        if (event.recap === undefined) continue;
        assert.equal(event.lifecycle, "past", `${event.id} has a recap but is not past`);
        assert.ok(
          Date.parse(event.recap.filedAt) > Date.parse(event.startDateTime),
          `${event.id}: recap filed before the event`
        );
      }
    }
  );

  it(
    "keeps the deprecated flat fields equal to the structured venue",
    function givenBothVenueForms_whenCompared_thenTheyAgree() {
      // Given: `venueName` and `location` are compatibility ALIASES, not a second
      // source of truth. A fixture where they disagree is teaching the wrong
      // lesson to every consumer still reading the flat pair.
      for (const event of events) {
        if (event.venue === undefined || event.venueName === undefined) continue;
        assert.equal(event.venueName, event.venue.name.text, event.id);
      }
    }
  );
});

describe("the tasting note seeds", () => {
  it(
    "answers every scale with a rung the metric actually has",
    function givenEveryReading_whenRead_thenItsKeyAndValueAreLegal() {
      // Given: a scale answer is positional against TASTING_SCALES — rung `n` is
      // index `n - 1`. A 6, or a metric the vocabulary does not name, puts a
      // client's mark somewhere the scale does not go.
      const metrics = Object.keys(TASTING_SCALES);

      for (const note of notes) {
        for (const answer of note.readings?.scales ?? []) {
          assert.ok(metrics.includes(answer.key), `${note.id}: metric "${answer.key}"`);
          assert.ok(
            Number.isInteger(answer.value) && answer.value >= 1 && answer.value <= 5,
            `${note.id}: ${answer.key} = ${answer.value}`
          );
        }
      }
    }
  );

  it(
    "draws every aroma, colour, rim and pour value from its own vocabulary",
    function givenEveryReading_whenRead_thenNoKeyIsInvented() {
      // Given: these keys ARE the search index. A key nobody declared is a row
      // that can never be browsed to and a translation nobody was asked for.
      for (const note of notes) {
        const readings = note.readings;
        if (readings === undefined) continue;

        for (const aroma of readings.aromas ?? []) {
          assert.ok(AROMAS.includes(aroma), `${note.id}: aroma "${aroma}"`);
        }
        if (readings.colour) {
          assert.ok(COLOUR_READINGS.includes(readings.colour.coreKey), note.id);
          if (readings.colour.rimKey) {
            assert.ok(RIM_READINGS.includes(readings.colour.rimKey), note.id);
          }
        }
        if (readings.pour?.tasted) {
          assert.ok(TASTED_MODES.includes(readings.pour.tasted), note.id);
        }
        if (readings.pour?.decant) {
          assert.ok(DECANT_STEPS.includes(readings.pour.decant), note.id);
        }
        if (readings.pour?.glass) {
          assert.ok(GLASS_SHAPES.includes(readings.pour.glass), note.id);
        }
        if (readings.condition) {
          assert.ok(BOTTLE_CONDITIONS.includes(readings.condition), note.id);
        }
      }
    }
  );

  it(
    "gives a faulted bottle no verdict",
    function givenAFaultedNote_whenRead_thenItPassesNoJudgementOnTheWine() {
      // Given: THE invariant — a fault never counts against the wine's record.
      // A corked bottle is a failed closure, and the estate did not make it. A
      // seeded faulted note carrying a verdict would put the fault straight into
      // the aggregate the rule exists to keep it out of.
      const faulted = notes.filter(
        (note) => note.readings && note.readings.condition !== "condition.noFaults"
      );

      assert.ok(faulted.length > 0, "no faulted note in the corpus to test the rule with");
      for (const note of faulted) {
        assert.equal(note.verdict, undefined, `${note.id} is faulted and still judges the wine`);
      }
    }
  );

  it(
    "carries only verdicts the four-rung register still has",
    function givenEverySeededVerdict_whenRead_thenTheRetiredRungIsGone() {
      for (const note of notes) {
        if (note.verdict === undefined) continue;
        assert.ok(VERDICTS.includes(note.verdict), `${note.id}: "${note.verdict}"`);
      }
    }
  );

  it(
    "keeps both private and room notes in the corpus",
    function givenTheNotes_whenSplitByVisibility_thenBothStatesArePresent() {
      // Given: a private note is a genuine reading that still aggregates —
      // visibility governs whose name appears, not whether it counts. A corpus
      // with none of them leaves that distinction untested in every consumer.
      const priv = notes.filter((note) => note.visibility === "private");

      assert.ok(priv.length > 0, "no private note to test with");
      assert.ok(priv.length < notes.length / 2, "private should be the minority");
    }
  );
});

describe("the register, counted from the notes", () => {
  it(
    "counts a wine's noteCount off the note file rather than beside it",
    function givenEveryWine_whenCounted_thenTheCatalogueAgreesWithTheCorpus() {
      // Given: `noteCount` used to be `int(3, 900)` — a number that counted
      // nothing, on records whose corpus held two notes. A catalogue claiming
      // 43,237 notes over a file containing 122 is not a fixture, it is two
      // fixtures that happen to share a folder.
      const written = new Map();
      for (const note of notes) {
        written.set(note.wineVintageId, (written.get(note.wineVintageId) ?? 0) + 1);
      }

      for (const wine of wines) {
        assert.equal(wine.noteCount ?? 0, written.get(wine.id) ?? 0, wine.id);
      }
    }
  );

  it(
    "keeps every faulted note out of every register",
    function givenTheWholeCorpus_whenAggregated_thenTheRegistersCountOnlyCleanBottles() {
      // Given: THE invariant, and the reason this reconciliation was worth doing
      // at all. A corked bottle is a failed closure and the estate did not make
      // it, so it reaches no mean, no mention and no distribution. With the
      // register synthesised there was nothing to check this against; now the
      // arithmetic either holds across the whole corpus or it does not.
      const faulted = notes.filter(
        (note) => note.readings && note.readings.condition !== "condition.noFaults"
      ).length;
      const aggregated = records.reduce(
        (total, record) => total + (record.register?.noteCount ?? 0),
        0
      );

      assert.ok(faulted > 0, "no faulted note in the corpus to exclude");
      assert.equal(aggregated, notes.length - faulted);
    }
  );

  it(
    "gives a wine the verdict its own notes voted for, or none at all",
    function givenEachRecord_whenRead_thenTheVerdictIsTheModeOfItsNotes() {
      // Given: the verdict comes from members. A wine nobody has judged has no
      // verdict — not a default, not the middle rung — and one whose only notes
      // were faulted bottles has none either, because a fault judges nothing.
      for (const record of records) {
        const wine = wines.find((w) => w.id === record.wineVintageId);
        assert.equal(
          record.register.verdict,
          wine.verdict,
          `${record.wineVintageId}: record and catalogue disagree`
        );
        if (record.register.noteCount === 0) {
          assert.equal(record.register.verdict, undefined, record.wineVintageId);
        }
      }
    }
  );

  it(
    "draws a spread only where enough members answered, and names the lone reader otherwise",
    function givenTheMetrics_whenRead_thenThresholdsShowUpAsAbsence() {
      // Given: the threshold is server policy and reaches the wire as an absent
      // field. A single reading gets no distribution and a name instead — one
      // reading is a reading, not a consensus.
      const metrics = records.flatMap((r) => r.register.groups).flatMap((g) => g.metrics);

      assert.ok(metrics.some((m) => m.distribution), "no dense metric in the corpus");
      assert.ok(metrics.some((m) => m.singleReadingBy), "no single-reading metric");

      for (const metric of metrics) {
        if (metric.noteCount === 1) {
          assert.equal(metric.distribution, undefined);
          assert.ok(metric.singleReadingBy);
        }
        if (metric.distribution) {
          assert.equal(
            metric.distribution.reduce((a, b) => a + b, 0),
            100,
            `${metric.key} distribution does not sum to 100`
          );
        }
      }
    }
  );

  it(
    "never reports a mean as an unlabelled rung",
    function givenEveryMetric_whenRead_thenItsWordKeyIsOneAScaleActuallyLabels() {
      // Given: a five-point scale labels only its ends and its centre, so a mean
      // of 3.6 has to round to the nearest LABELLED rung. Returning the empty
      // string at index 1 or 3 puts an unrenderable wordKey on the wire — which
      // the contract's type forbids and nothing was checking.
      for (const record of records) {
        for (const group of record.register.groups) {
          for (const metric of group.metrics) {
            assert.ok(metric.wordKey.length > 0, `${record.wineVintageId}/${metric.key}`);
            assert.ok(
              TASTING_SCALES[metric.key].includes(metric.wordKey),
              `${metric.key}: "${metric.wordKey}" is not one of its rungs`
            );
          }
        }
      }
    }
  );

  it(
    "carries a dense register, a thin one and an empty one",
    function givenTheCorpus_whenBanded_thenAllThreeStatesArePresent() {
      // Given: a record with one note and a record with a hundred are the SAME
      // page — only the register thickens. A corpus with the same depth
      // everywhere can only ever demonstrate one of the three.
      const counts = records.map((r) => r.register.noteCount);

      assert.ok(counts.some((c) => c === 0), "no empty register");
      assert.ok(counts.some((c) => c > 0 && c < 25), "no thin register");
      assert.ok(counts.some((c) => c >= 25), "no dense register");
      assert.ok(
        records.some((r) => r.register.disagreement),
        "nothing thick enough to have an argument in it"
      );
    }
  );
});

describe("the editorial seeds", () => {
  it(
    "covers the content types added in 7.0",
    function givenTheCards_whenRead_thenTheNewTypesAreRepresented() {
      // Given: the fixture sat on article/guide/story long after six more types
      // shipped, so nothing could render an offer, a cause or an event piece.
      const types = new Set(editorialSamples.editorial.map((card) => card.contentType));

      for (const added of ["event", "cause", "offer", "season"]) {
        assert.ok(types.has(added), `no seeded "${added}" piece`);
      }
    }
  );

  it(
    "keeps a cause piece free of commerce and of wine mentions",
    function givenTheCausePiece_whenRead_thenItCarriesNoOfferOrPairing() {
      // Given: the rule `EDITORIAL_PIECE_RULES` publishes. A piece about a relief
      // fund that also sells you a case is not a cause piece — and a fixture that
      // broke it would be the first thing a validator was written against.
      const cause = editorialSamples.details.find((piece) => piece.contentType === "cause");

      assert.ok(cause, "no cause piece seeded");
      assert.equal(cause.offer, undefined);
      assert.equal(cause.pairing, undefined);
      assert.equal(cause.subject, undefined);
    }
  );

  it(
    "embeds the events-domain event rather than restating its clock",
    function givenTheEventPiece_whenRead_thenItsEventIsOneFromTheEventSeed() {
      // Given: one dinner, two surfaces. An announcement carrying its own start
      // time disagrees with the list row the first time somebody moves it.
      const piece = editorialSamples.details.find((detail) => detail.contentType === "event");

      assert.ok(piece?.event, "the event piece embeds no event");
      const seeded = events.find((event) => event.id === piece.event.id);
      assert.ok(seeded, `${piece.event.id} is not in the event seed`);
      assert.equal(piece.event.startDateTime, seeded.startDateTime);
    }
  );

  it(
    "answers a real record field from a claim",
    function givenTheClaims_whenRead_thenEachAnswerNamesAWineAndAField() {
      // Given: `claims[].answers[]` is the reverse index — it is what lets a wine
      // record row cite the piece that established it. An answer missing either
      // half resolves to every record or to none.
      const answered = editorialSamples.details
        .flatMap((piece) => piece.claims ?? [])
        .flatMap((claim) => claim.answers ?? []);

      assert.ok(answered.length > 0, "nothing in the corpus answers a record row");
      for (const answer of answered) {
        assert.ok(answer.wineVintageId, "an answer with no wine answers every record");
        assert.ok(answer.fieldKey, "an answer with no field answers no row");
      }
    }
  );

  it(
    "never answers a question with null",
    function givenTheUnansweredColumn_whenRead_thenEveryRowStatesWhy() {
      // Given: declined, no_reply and not_sought are three different facts, and
      // a null disguises whichever one it replaced.
      const legal = ["declined", "no_reply", "not_sought"];

      for (const piece of editorialSamples.details) {
        for (const row of piece.unanswered ?? []) {
          assert.ok(legal.includes(row.answer), `${piece.id}: "${row.answer}"`);
        }
      }
    }
  );

  it(
    "derives a card from its piece rather than restating it",
    function givenAPieceWithACard_whenCompared_thenTheyAgree() {
      // Given: two hand-maintained files, one a summary of the other, is how a
      // card comes to advertise something the piece no longer says.
      for (const piece of editorialSamples.details) {
        const card = editorialSamples.editorial.find((c) => c.id === piece.id);
        if (card === undefined) continue;

        assert.equal(card.title, piece.title, piece.id);
        assert.equal(card.contentType, piece.contentType, piece.id);
        assert.equal(card.saveCount, piece.saveCount, piece.id);
      }
    }
  );
});

describe("the Masthead v2 page", () => {
  it(
    "leads on a member's note, and on the most-saved one",
    function givenTheMasthead_whenRead_thenTheRoomChoseTheLede() {
      // Given: the note hero is what makes the front page sound like the room
      // rather than like Kgwari. It is chosen by save count — that mechanism is
      // the reason `saveCount` sits on the note at all.
      const hero = createDiscover().hero;

      assert.equal(hero.kind, "note");
      assert.ok(hero.note.saveCount > 0);
      assert.notEqual(hero.note.visibility, "private", "a private note must never lead the page");
    }
  );

  it(
    "carries the three sections the v2 design added",
    function givenTheMasthead_whenRead_thenTheLedgerAndTonightAreThere() {
      const types = createDiscover().sections.map((section) => section.type);

      for (const added of ["contributions", "cellar_tonight", "tonight_stats"]) {
        assert.ok(types.includes(added), `no "${added}" section`);
      }
    }
  );

  it(
    "orders the ledger by time ACROSS kinds, never grouped by kind",
    function givenTheContributionsSection_whenRead_thenOneOrderingCoversEveryKind() {
      // Given: the whole argument for one union. A story filed at 09:02 and a
      // note at 10:15 have exactly one correct order, and a fixture that put all
      // the notes first would let a consumer group by kind and still look right.
      const ledger = createDiscover().sections.find((s) => s.type === "contributions");
      const times = ledger.items.map((item) => item.createdAt);
      const kinds = new Set(ledger.items.map((item) => item.kind));

      assert.ok(kinds.size > 1, "the ledger is not interleaved");
      assert.deepEqual(times, [...times].sort().reverse(), "not newest-first");
    }
  );

  it(
    "keeps a tonight count windowed rather than lifetime",
    function givenTheCellarRows_whenRead_thenTheirCountsAreSmall() {
      // Given: `WineContract.noteCount` is a lifetime figure and `activityCount`
      // is not. A fixture where they looked alike would let a consumer render
      // either in the other's sentence and say something false.
      const section = createDiscover().sections.find((s) => s.type === "cellar_tonight");

      assert.ok(section.items.length > 0);
      for (const row of section.items) {
        assert.ok(row.activityCount > 0 && row.activityCount < 50, row.wine.id);
        assert.ok(row.wine.name, "a row must name its wine");
      }
    }
  );

  it(
    "no longer serves the v1 wine hero from a second fixture",
    function givenDiscover_whenRead_thenThereIsExactlyOnePayloadAndItIsV2() {
      // Given: this briefly shipped as two files — the v1 snapshot the backend
      // composed, and the v2 design beside it. Two discover payloads is two
      // answers to one question, and a reader gets whichever they find first.
      // The v1 snapshot is gone; `createDiscover` is the only way in.
      const page = createDiscover();

      assert.equal(page.hero.kind, "note");
      assert.notEqual(page.hero.kind, "wine");
      assert.ok(page.sections.length >= 6);
    }
  );
});
