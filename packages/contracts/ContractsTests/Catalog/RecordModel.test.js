import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ClaimantAvailabilityContract,
  MarketPriceContract,
  RecordFieldContract,
  WineRecordContract,
  WineRegisterContract
} from "../../dist/catalog/test-doubles/index.js";

/**
 * The record model's rules, asserted against the doubles that publish them.
 *
 * These are not tests OF the doubles — `PublishedStubs.test.js` sweeps those.
 * They are tests of the model, using the doubles as the one place its states are
 * written down. Every rule below was stated in a doc comment and enforced
 * nowhere, which is the condition under which a consumer implements the opposite
 * and nothing notices.
 */
describe("what a claim does and does not open", () => {
  it(
    "opens the estate's own account only under a PRODUCER claim",
    function givenEachClaimState_whenRead_thenOnlyTheProducerOneCarriesAVoice() {
      // Given: THE asymmetry. A producer claim opens the essay and the cellar
      // facts; a distributor claim opens commerce and nothing else — it can say
      // where the bottle is, never what the vineyard is.
      const community = WineRecordContract.StubFactory.make();
      const producer = WineRecordContract.StubFactory.makeProducerClaimed();
      const distributor = WineRecordContract.StubFactory.makeDistributorClaimed();

      assert.equal(community.estateVoice, undefined);
      assert.ok(producer.estateVoice, "a producer claim opens the estate's voice");
      assert.equal(distributor.estateVoice, undefined, "commerce is not the wine's story");
    }
  );

  it(
    "keeps the estate section LOCKED on a distributor-claimed record, with a different reason",
    function givenADistributorClaim_whenRead_thenLockedIsPopulatedWithItsOwnBody() {
      // Given: the single easiest thing to get wrong. A consumer that renders
      // `locked` only while `claimedBy` is absent shows a distributor-claimed
      // record as though the estate had spoken. Somebody accountable HAS arrived
      // — and still cannot answer, which is a different and more pointed fact.
      const community = WineRecordContract.StubFactory.make();
      const producer = WineRecordContract.StubFactory.makeProducerClaimed();
      const distributor = WineRecordContract.StubFactory.makeDistributorClaimed();

      assert.equal(producer.locked.length, 0, "a producer claim empties it");
      assert.equal(distributor.locked.length, 1, "a distributor claim does not");
      assert.notEqual(
        distributor.locked[0].bodyKey,
        community.locked[0].bodyKey,
        "the two states must not read the same sentence"
      );
      assert.equal(distributor.locked[0].needs, "producer");
    }
  );

  it(
    "puts price and requests with the claimant, and nowhere else",
    function givenACommunityRecord_whenRead_thenThereIsNoAvailabilityAtAll() {
      // Given: availability exists only where a claim does — an unclaimed record
      // has nobody to receive the request. An unowned price on a page whose whole
      // argument is provenance is the exact kind of unattributed fact this model
      // removes.
      assert.equal(WineRecordContract.StubFactory.make().availability, undefined);
      assert.ok(WineRecordContract.StubFactory.makeProducerClaimed().availability);
      assert.ok(WineRecordContract.StubFactory.makeDistributorClaimed().availability);
    }
  );

  it(
    "still renders the claimant block when requests are paused",
    function givenAPausedClaimant_whenRead_thenTheBlockSurvivesTheAction() {
      // Given: `acceptsRequests: false` disables the action, not the enclosure.
      // Hiding the block would make a paused seller look like an unclaimed
      // record, which is a claim about accountability rather than availability.
      const paused = ClaimantAvailabilityContract.StubFactory.makePaused();

      assert.equal(paused.acceptsRequests, false);
      assert.ok(paused.price, "the price is still a fact");
      assert.ok(paused.claimantName.text);
    }
  );
});

describe("a row that is empty is still a row", () => {
  it(
    "names an unanswered estate-private field rather than omitting it",
    function givenAPendingField_whenRead_thenItHasAKeyAndNoValue() {
      // Given: the governing correction of this whole module. The page lists what
      // it is waiting on the estate for, BY NAME. A consumer that filters rows
      // without values renders a record that looks complete because it dropped
      // everything unanswered — the progress-bar model this replaced.
      const pending = RecordFieldContract.StubFactory.makePending();

      assert.ok(pending.key, "an unanswered row still has an identity");
      assert.equal(pending.value, undefined);
      assert.equal(pending.source, undefined, "nobody supplied it, so nobody is named");
      assert.equal(pending.kind, "estate_private");
    }
  );

  it(
    "carries a field through its whole life on one key",
    function givenTheSameFieldPendingAndAnswered_whenCompared_thenTheKeyIsUnchanged() {
      // Given: pending becomes answered without becoming a different row. That is
      // what lets a client animate the transition rather than swap one list for
      // another, and what keeps a locale entry keyed on the field valid in both
      // states.
      const pending = RecordFieldContract.StubFactory.makePending();
      const answered = RecordFieldContract.StubFactory.makeEstateAnswered();

      assert.equal(pending.key, answered.key);
      assert.equal(answered.source, "estate");
      assert.ok(answered.value);
    }
  );

  it(
    "offers verification on reference rows and on nothing else",
    function givenEachFieldKind_whenRead_thenOnlyReferenceRowsCanBeArguedWith() {
      // Given: there is nothing to confirm about a fact the estate has not
      // supplied, and an estate's own account of its own cellar is not put to a
      // vote. A client that renders confirm/dispute wherever it finds a value
      // invites members to vote on the estate.
      assert.ok(RecordFieldContract.StubFactory.make().verification);
      assert.equal(RecordFieldContract.StubFactory.makePending().verification, undefined);
      assert.equal(RecordFieldContract.StubFactory.makeEstateAnswered().verification, undefined);
      assert.equal(RecordFieldContract.StubFactory.makeCommercial().verification, undefined);
    }
  );

  it(
    "keeps a disputed value on screen",
    function givenADisputedRow_whenRead_thenTheValueIsStillThere() {
      // Given: hiding a fact under review is worse than showing one that is being
      // argued about.
      const disputed = RecordFieldContract.StubFactory.makeDisputed();

      assert.equal(disputed.verification.disputed, true);
      assert.ok(disputed.value, "a contested value is still shown");
    }
  );

  it(
    "cites the piece that answered a row, without replacing who supplied it",
    function givenAnEditoriallyAnsweredRow_whenRead_thenSourceAndAnsweredBySitTogether() {
      // Given: `source` says WHO supplied the fact, `answeredBy` says where they
      // said it. A consumer that treats the second as a replacement for the first
      // loses the provenance the record exists for.
      const cited = RecordFieldContract.StubFactory.makeAnsweredByEditorial();

      assert.equal(cited.source, "estate");
      assert.ok(cited.answeredBy.editorialId);
      assert.equal(cited.answeredBy.title.source, "negotiated");
    }
  );
});

describe("the register thickens; the page does not change", () => {
  it(
    "draws a spread only once there is enough to have one",
    function givenAThinRegister_whenRead_thenTheThresholdShowsUpAsAbsence() {
      // Given: thresholds are SERVER POLICY and appear on the wire as absent
      // fields, never as numbers a client compares against. A client that
      // hardcodes "25" ships to change editorial judgement.
      const thin = WineRegisterContract.StubFactory.makeThin();
      const dense = WineRegisterContract.StubFactory.make();

      assert.equal(thin.verdictDistribution, undefined);
      assert.equal(thin.verdictSummary, undefined);
      assert.ok(dense.verdictDistribution.length > 0);
      assert.ok(dense.verdictSummary.percentage > 0);
    }
  );

  it(
    "names whose reading it is when there is only one",
    function givenASingleReading_whenRead_thenNoDistributionIsDrawnBehindIt() {
      // Given: one reading is a reading, not a consensus. Drawing a spread behind
      // it claims an agreement that does not exist.
      const [metric] = WineRegisterContract.StubFactory.makeThin().groups[0].metrics;

      assert.equal(metric.noteCount, 1);
      assert.equal(metric.distribution, undefined);
      assert.ok(metric.singleReadingBy);
    }
  );

  it(
    "distributes the verdict across the four rungs and nothing else",
    function givenADenseRegister_whenRead_thenItsDistributionMatchesTheRegister() {
      // Given: 7.0 removed the fifth rung. A distribution still carrying five
      // entries is the exact drift the seed generator had — a literal copy of the
      // scale that went stale when the scale changed.
      const dense = WineRegisterContract.StubFactory.make();
      const total = dense.verdictDistribution.reduce((sum, entry) => sum + entry.percentage, 0);

      assert.equal(dense.verdictDistribution.length, 4);
      assert.equal(total, 100);
      assert.ok(
        !dense.verdictDistribution.some((entry) => entry.verdict === "Not One I'd Revisit")
      );
    }
  );

  it(
    "keeps an empty register enumerable rather than absent",
    function givenAWineNobodyHasWrittenAbout_whenRead_thenTheRegisterExistsAndIsEmpty() {
      // Given: a record with no notes is the SAME page as one with fourteen
      // hundred. The register is there; it simply has nothing in it, and there is
      // no verdict because the verdict comes from members.
      const empty = WineRegisterContract.StubFactory.makeEmpty();

      assert.equal(empty.noteCount, 0);
      assert.deepEqual(empty.groups, []);
      assert.deepEqual(empty.aromas, []);
      assert.equal(empty.verdict, undefined);
    }
  );

  it(
    "leaves the record's identity intact when the register is empty",
    function givenAnUnwrittenRecord_whenRead_thenItsMatchedFactsAreStillThere() {
      // Given: a wine's facts do not start empty — estate, region, vintage,
      // varietal, alcohol and closure are matched at ingest. Framing a matched
      // record as an empty one is what made a one-note page and a
      // fourteen-hundred-note page look like different pages.
      const unwritten = WineRecordContract.StubFactory.makeUnwrittenAbout();
      const matched = unwritten.groups.find((group) => group.key === "matched");

      assert.ok(matched.fields.length > 0, "the record knows things already");
      assert.ok(matched.fields.every((field) => field.value !== undefined));
      assert.equal(unwritten.featuredNote, undefined, "nothing has been saved enough to lead");
    }
  );
});

describe("what the room paid", () => {
  it(
    "publishes a band per currency and converts nothing",
    function givenTwoMarkets_whenRead_thenEachBandKeepsItsOwnCurrency() {
      // Given: the same bottle costs different money in different markets, and
      // that IS the answer for a member deciding where to buy. A blended figure
      // computed against a rate we picked would destroy it.
      const market = MarketPriceContract.StubFactory.make();
      const currencies = market.bands.map((band) => band.currency);

      assert.deepEqual(currencies, ["ZAR", "EUR"]);
      for (const band of market.bands) {
        assert.equal(band.low.currency, band.currency);
        assert.equal(band.typical.currency, band.currency);
        assert.equal(band.high.currency, band.currency);
      }
    }
  );

  it(
    "publishes a band whole or not at all",
    function givenEveryBand_whenRead_thenAllThreePercentilesArePresent() {
      // Given: a median with no shoulders is a single number calling itself a
      // range. And no extremes anywhere — the lowest and highest figures are each
      // one member's private price, which is the pair an aggregate most needs to
      // protect.
      for (const band of MarketPriceContract.StubFactory.make().bands) {
        assert.ok(band.low.amountMinorUnits < band.typical.amountMinorUnits);
        assert.ok(band.typical.amountMinorUnits < band.high.amountMinorUnits);
        assert.ok(band.sampleSize > 0);
        assert.ok(!("min" in band) && !("max" in band), "extremes must never be published");
      }
    }
  );

  it(
    "distinguishes withheld from never-filed",
    function givenAWithheldCurrency_whenRead_thenItsReasonIsNotNoneFiled() {
      // Given: `too_few` means members bought it and there are not enough of them
      // to publish without exposing who; `none_filed` means nobody bought it at
      // all. A client rendering both as "no price" throws away the distinction
      // the reason code exists to carry.
      const withheld = MarketPriceContract.StubFactory.makeWithheld();
      const reasons = Object.fromEntries(
        withheld.absent.map((entry) => [entry.currency, entry.reason])
      );

      assert.equal(reasons.CHF, "too_few");
      assert.equal(reasons.EUR, "none_filed");
      assert.equal(reasons.GBP, "too_old");
    }
  );

  it(
    "states every currency it considered, even with no bands at all",
    function givenAnUnpricedWine_whenRead_thenTheAbsencesAreStillEnumerated() {
      // Given: enumerable-while-empty, the rule the record runs on. Dropping a
      // currency silently is how a page implies nobody drinks this wine in
      // France.
      const unpriced = MarketPriceContract.StubFactory.makeUnpriced();

      assert.deepEqual(unpriced.bands, []);
      assert.ok(unpriced.absent.length > 0);
    }
  );
});
