import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { tierForProfile } from "../../dist/member/index.js";

describe("the trust mark a profile earns", () => {
  it(
    "gives a regular member no mark at all",
    function givenAnEarnedStatus_whenAsked_thenThereIsNoTier() {
      // Given: enthusiast and collector are STATUS words, not verifications.
      // Rendering a mark for them would claim an accountability nobody checked.
      assert.equal(tierForProfile("enthusiast"), null);
      assert.equal(tierForProfile("collector"), null);
    }
  );

  it(
    "gives a business persona its verification tier",
    function givenABusinessPersona_whenAsked_thenATierComesBack() {
      assert.ok(tierForProfile("sommelier"));
      assert.ok(tierForProfile("estate"));
    }
  );

  it(
    "answers null for anything it does not recognise",
    function givenAnUnknownProfile_whenAsked_thenNoMarkIsInvented() {
      // Given: a mark asserts somebody was verified. Inventing one for an
      // unrecognised profile is the one failure mode that actually misleads.
      assert.equal(tierForProfile("nonsense"), null);
    }
  );
});
