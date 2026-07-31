import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Mapper } from "@edwardseshoka/foundation";
import {
  EventToSearchRowMapper,
  MemberToSearchRowMapper,
  ProducerToSearchRowMapper,
  RegionToSearchRowMapper
} from "../../dist/search/index.js";
import {
  ProjectableEvent,
  ProjectableMember,
  ProjectableProducer,
  ProjectableRegion
} from "../../dist/search/test-doubles/index.js";

describe("projecting an estate", () => {
  it(
    "carries the wine count its meta line is built from",
    function givenAProducer_whenProjected_thenTheEstateMetaIsPopulated() {
      const row = Mapper.flatMap(ProducerToSearchRowMapper, ProjectableProducer.StubFactory.make());

      assert.equal(row.id, "search_estate_estate_meerlust");
      assert.deepEqual(row.meta, { kind: "estate", foundedYear: 1693, wineCount: 18 });
    }
  );

  it(
    "omits foundedYear rather than inventing one",
    function givenNoFoundingDate_whenProjected_thenTheFieldIsAbsent() {
      // Given: most producers record no founding year, and the contract marks
      // it optional so an undated estate still renders its wine count.
      const row = Mapper.flatMap(
        ProducerToSearchRowMapper,
        ProjectableProducer.StubFactory.makeUndated()
      );

      assert.ok(!("foundedYear" in row.meta));
    }
  );

  it(
    "never carries a verdict or a price, which only wines may",
    function givenAProducer_whenProjected_thenNoWineOnlyFieldsAppear() {
      // Given: the client renders whatever it is sent, so the contract puts
      // this guard on the write side.
      const row = Mapper.flatMap(ProducerToSearchRowMapper, ProjectableProducer.StubFactory.make());

      assert.equal(row.verdict, undefined);
      assert.equal(row.listedPrice, undefined);
    }
  );
});

describe("projecting a region", () => {
  it(
    "sends a single-name place as canonical",
    function givenNoExonym_whenProjected_thenTheTitleClaimsNoNegotiation() {
      // Given: claiming a negotiation that never happened is as wrong as hiding
      // one that did.
      const row = Mapper.flatMap(RegionToSearchRowMapper, ProjectableRegion.StubFactory.make());

      assert.deepEqual(row.title, { source: "canonical", text: "Stellenbosch" });
      assert.deepEqual(row.eyebrow, { source: "canonical", text: "Coastal Region" });
    }
  );

  it(
    "sends an exonymous place as NEGOTIATED, with the language it served",
    function givenAnExonym_whenProjected_thenTheLanguageTravels() {
      // Given: "Bourgogne" and "Burgundy" are the same place. Stating the
      // language served is what lets a client badge a fallback as a fallback
      // rather than pass it off as a translation.
      const row = Mapper.flatMap(
        RegionToSearchRowMapper,
        ProjectableRegion.StubFactory.makeExonymous()
      );

      assert.deepEqual(row.title, {
        source: "negotiated",
        text: "Bourgogne",
        languageTag: "fr"
      });
    }
  );

  it(
    "falls back to the country when a region has no parent",
    function givenNoParentRegion_whenProjected_thenTheCountryIsTheEyebrow() {
      const row = Mapper.flatMap(
        RegionToSearchRowMapper,
        ProjectableRegion.StubFactory.make({ parentRegion: undefined })
      );

      assert.deepEqual(row.eyebrow, { source: "canonical", text: "South Africa" });
    }
  );
});

describe("projecting a tasting", () => {
  it(
    "sends the title as NEGOTIATED, because curated prose is translatable",
    function givenAnEvent_whenProjected_thenTheTitleCarriesItsLanguage() {
      // Given: an estate or a region is a proper noun — the same word
      // everywhere. A tasting title is authored prose, so sending it as
      // canonical would claim it needs no translation.
      const row = Mapper.flatMap(EventToSearchRowMapper, ProjectableEvent.StubFactory.make());

      assert.equal(row.title.source, "negotiated");
      assert.equal(row.title.languageTag, "en");
    }
  );

  it(
    "treats missing seats as UNCAPPED, never as zero",
    function givenNoSeatCount_whenProjected_thenSeatsRemainingIsAbsent() {
      // Given: the contract is explicit that absence means "open". Defaulting
      // to 0 would render "0 seats left" on an event nobody is excluded from.
      const row = Mapper.flatMap(
        EventToSearchRowMapper,
        ProjectableEvent.StubFactory.makeUncapped()
      );

      assert.ok(!("seatsRemaining" in row.meta));
    }
  );

  it(
    "omits meta entirely when the event has no start time",
    function givenNoStartTime_whenProjected_thenThereIsNoTastingMeta() {
      // Given: `startsAt` is REQUIRED by the tasting meta, so an event without
      // one gets no meta rather than a fabricated date. It stays findable by
      // title, which beats no result at all.
      const row = Mapper.flatMap(
        EventToSearchRowMapper,
        ProjectableEvent.StubFactory.makeUndated()
      );

      assert.equal(row.meta, undefined);
      assert.equal(row.entityId, "event_meerlust_cellar_tasting");
    }
  );
});

describe("projecting a person", () => {
  it(
    "sends the status as a CHROME KEY, not as a word",
    function givenAMember_whenProjected_thenTheEyebrowIsAKey() {
      // Given: a status is a closed set. Sending "Enthusiast" as text would
      // hardcode English into every person row in the index.
      const row = Mapper.flatMap(MemberToSearchRowMapper, ProjectableMember.StubFactory.make());

      assert.deepEqual(row.eyebrow, { source: "chrome", key: "enthusiast" });
      assert.deepEqual(row.meta, { kind: "noteCount", count: 241 });
    }
  );

  it(
    "prefers a business role over an earned status",
    function givenAProfessional_whenProjected_thenTheRoleIsTheEyebrow() {
      const row = Mapper.flatMap(
        MemberToSearchRowMapper,
        ProjectableMember.StubFactory.makeProfessional()
      );

      assert.deepEqual(row.eyebrow, { source: "chrome", key: "sommelier" });
    }
  );

  it(
    "publishes NOTHING a member did not put on show",
    function givenAMember_whenProjected_thenOnlyThreeFieldsCanEverAppear() {
      // Given: a search row is read by everyone, so a field that reaches one has
      // effectively been published. The INPUT type is the guard — a member's
      // email, address and coordinates are not merely unused here, they are
      // unreachable.
      const row = Mapper.flatMap(MemberToSearchRowMapper, ProjectableMember.StubFactory.make());

      assert.deepEqual(Object.keys(row).sort(), [
        "entityId",
        "eyebrow",
        "facet",
        "id",
        "kind",
        "meta",
        "title"
      ]);
    }
  );
});
