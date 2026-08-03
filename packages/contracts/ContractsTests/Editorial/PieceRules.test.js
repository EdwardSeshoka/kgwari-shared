import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EDITORIAL_PIECE_RULES } from "../../dist/editorial/index.js";

const BLOCKS = ["event", "offer", "pairing", "mentions"];

/**
 * The piece rules are published as DATA so a server validator and a client
 * renderer cannot disagree about them. That only helps if the table itself is
 * checked — an unpublished rule at least fails loudly in one place, while a
 * published table with a hole in it is wrong everywhere at once, quietly.
 */
describe("what a piece of each type may carry", () => {
  it(
    "has a rule for every content type",
    function givenTheContentTypes_whenChecked_thenNoneIsUnruled() {
      // Given: a type with no entry is a type nothing validates. The `satisfies`
      // clause catches that at compile time for consumers of this package — this
      // catches it for the generator and the backend, which read the value.
      const ruled = Object.keys(EDITORIAL_PIECE_RULES);

      for (const type of [
        "article",
        "guide",
        "story",
        "new_arrival",
        "event",
        "trial",
        "occasion",
        "season",
        "cause",
        "offer"
      ]) {
        assert.ok(ruled.includes(type), `${type} has no rule`);
      }
      assert.equal(ruled.length, 10);
    }
  );

  it(
    "answers every block for every type, with a boolean",
    function givenEveryRule_whenRead_thenNoBlockIsUndefined() {
      // Given: an absent block reads as `undefined`, and `if (rule.offer)` treats
      // that as forbidden — which is the safe direction by luck rather than by
      // design. Stating all four explicitly is what makes the default deliberate.
      for (const [type, rule] of Object.entries(EDITORIAL_PIECE_RULES)) {
        for (const block of BLOCKS) {
          assert.equal(typeof rule[block], "boolean", `${type}.${block} is not a boolean`);
        }
      }
    }
  );

  it(
    "lets a cause piece carry neither commerce nor wine mentions",
    function givenACausePiece_whenChecked_thenEveryCommercialBlockIsForbidden() {
      // Given: THE rule this table exists for. A piece about a relief fund that
      // also sells you a case is not a cause piece, and a client that renders a
      // buy button wherever it finds one must be handed a type that forbids it.
      assert.deepEqual(EDITORIAL_PIECE_RULES.cause, {
        event: false,
        offer: false,
        pairing: false,
        mentions: false
      });
    }
  );

  it(
    "allows an embedded event on exactly the types that announce one",
    function givenTheEventBlock_whenChecked_thenOnlyEventAndOccasionMayCarryIt() {
      // Given: the event block embeds the whole events-domain entity. A type that
      // may carry one is a type whose piece is ABOUT an evening — anything else
      // carrying it is a second copy of a dinner waiting to disagree with the
      // first.
      const withEvent = Object.entries(EDITORIAL_PIECE_RULES)
        .filter(([, rule]) => rule.event)
        .map(([type]) => type);

      assert.deepEqual(withEvent.sort(), ["event", "occasion"]);
    }
  );
});
