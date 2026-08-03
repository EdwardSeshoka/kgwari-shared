import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LOCKED_SECTIONS,
  RECORD_GROUPS,
  lockedSectionBodyKey,
  lockedSectionTitleKey,
  recordGroupLabelKey,
  recordGroupNoteKey
} from "../../dist/vocabulary/index.js";

/**
 * The four key builders on the record's vocabulary — exported, used by every
 * producer of a `WineRecordContract`, and until now tested by nothing.
 *
 * They exist because a group key of `matched` has exactly ONE heading and one
 * explanation, so carrying all three on the wire was three chances to disagree
 * about the same group. That argument only holds if the derivation is stable:
 * a builder that changes shape silently orphans every locale entry keyed on the
 * old one, which fails as missing copy at runtime in whichever language nobody
 * on the team reads.
 */
describe("the keys a record group derives", () => {
  it(
    "builds a heading key for every group, namespaced under its own key",
    function givenEveryGroup_whenAsked_thenTheHeadingIsDerivedFromTheKey() {
      // Given: the contract types `labelKey` as `record.group.${RecordGroupKey}`,
      // so a builder that drifted from that template would still compile here
      // while producing a key no consumer's type accepts.
      for (const group of RECORD_GROUPS) {
        assert.equal(recordGroupLabelKey(group), `record.group.${group}`);
      }
    }
  );

  it(
    "explains only the two groups that have something to explain",
    function givenTheGroups_whenAskedForNotes_thenOnlyTheSourcedOnesAnswer() {
      // Given: the note is the honest replacement for the progress bar this model
      // removed — it says where a group's contents came from. "Answered by the
      // estate" needs no such line; its heading already says it. An empty string
      // instead of `undefined` would render a blank paragraph under every one.
      assert.equal(recordGroupNoteKey("matched"), "record.group.matched.note");
      assert.equal(recordGroupNoteKey("estatePrivate"), "record.group.estatePrivate.note");
      assert.equal(recordGroupNoteKey("estateAnswered"), undefined);
      assert.equal(recordGroupNoteKey("distributorAnswered"), undefined);
    }
  );

  it(
    "keeps every derived key unique across the groups",
    function givenAllGroups_whenDerived_thenNoTwoShareAKey() {
      // Given: two groups sharing a heading key means one locale entry serving
      // two regions, and the second one to be edited silently rewrites the first.
      const keys = RECORD_GROUPS.map(recordGroupLabelKey);

      assert.equal(new Set(keys).size, keys.length);
    }
  );
});

describe("the keys a locked section derives", () => {
  it(
    "builds a title key for every section",
    function givenEverySection_whenAsked_thenTheTitleIsDerived() {
      for (const section of LOCKED_SECTIONS) {
        assert.equal(lockedSectionTitleKey(section), `record.locked.${section}.title`);
      }
    }
  );

  it(
    "says something DIFFERENT when a distributor holds the claim",
    function givenADistributorClaim_whenAskedForTheBody_thenItIsNotTheCommunityBody() {
      // Given: this is the asymmetry the record page exists to make legible. On a
      // community record the estate has simply not spoken; on a
      // distributor-claimed one somebody accountable has arrived and STILL cannot
      // answer, which is a different and more pointed fact. One body for both
      // states would tell the second reader something untrue.
      const community = lockedSectionBodyKey("estateVoice");
      const distributor = lockedSectionBodyKey("estateVoice", "distributor");

      assert.equal(community, "record.locked.estateVoice.body");
      assert.equal(distributor, "record.locked.estateVoice.distributorBody");
      assert.notEqual(community, distributor);
    }
  );

  it(
    "falls back to the community body for any claimant that is not a distributor",
    function givenNoClaimant_whenAskedForTheBody_thenTheCommunityBodyIsTheDefault() {
      // Given: a producer claim OPENS the section rather than changing its
      // locked body, so the only two states this builder ever renders are
      // "nobody has claimed" and "a distributor has". Defaulting to the community
      // body is what keeps an unclaimed record from reading as a claimed one.
      assert.equal(lockedSectionBodyKey("estateVoice", undefined), "record.locked.estateVoice.body");
    }
  );
});
