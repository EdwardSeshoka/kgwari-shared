import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NON_PUBLISHING_PROFILES, canPublishEvents, personaTier } from "../../dist/trust/index.js";

/**
 * Who may fill a room.
 *
 * A published event asks strangers to turn up somewhere at a time, and often to
 * pay for it. It is the one kind of content here where being wrong costs
 * somebody an evening and a drive rather than a scroll, which is why the
 * capability tracks standing that was earned or verified.
 */
describe("who may publish an evening", () => {
  it(
    "refuses the one profile nothing has been checked about",
    function givenAnEnthusiast_whenAsked_thenTheyMayNotPublish() {
      // Given: "enthusiast" is what an account IS on the day it signs up. Every
      // other profile has either been assigned by the system for sustained
      // activity or been through onboarding with a real name attached.
      assert.equal(canPublishEvents("enthusiast"), false);
    }
  );

  it(
    "lets a collector publish, because the standing was earned",
    function givenACollector_whenAsked_thenTheyMayPublish() {
      assert.equal(canPublishEvents("collector"), true);
    }
  );

  it(
    "lets every verified business account publish, producers included",
    function givenEachPersona_whenAsked_thenNoneIsRefused() {
      // Given: the shorthand "collectors and professionals" could be read to
      // exclude producers, and that reading breaks a settled design — the
      // editorial model is titled *What Estates Publish* and its event piece
      // embeds an evening an estate is hosting. A producer who could announce a
      // dinner but not publish it would be announcing a link to nothing.
      for (const persona of Object.keys(personaTier)) {
        assert.equal(canPublishEvents(persona), true, persona);
      }
    }
  );

  it(
    "states the rule as a refusal, so a new persona publishes by default",
    function givenTheList_whenRead_thenItNamesOnlyWhoIsExcluded() {
      // Given: a new BUSINESS persona has been verified by definition, so
      // forgetting to add it to an allowlist would silently take a capability
      // away from an account that had paid for it. The negative list has the
      // safer failure mode.
      assert.deepEqual(NON_PUBLISHING_PROFILES, ["enthusiast"]);
    }
  );
});
