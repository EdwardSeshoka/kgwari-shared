import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defineStub } from "../../dist/test-doubles/index.js";

/**
 * `defineStub` is the one piece of behaviour in the doubles layer, and every
 * stub in the package is built on it. Its compile-time job — checking the base
 * literal against the contract — is verified by the compiler. Its RUNTIME job is
 * not, and it has exactly one interesting rule: an override may remove a field,
 * which is the thing `Partial<T>` cannot express and the reason this helper
 * exists at all.
 */
describe("the stub helper", () => {
  const factory = defineStub({ id: "1", name: "Rubicon", vintage: 2018 });

  it(
    "returns the base when nothing is overridden",
    function givenNoOverrides_whenMade_thenTheBaseComesBack() {
      assert.deepEqual(factory.make(), { id: "1", name: "Rubicon", vintage: 2018 });
    }
  );

  it(
    "replaces only what an override names",
    function givenOneOverride_whenMade_thenTheRestIsUntouched() {
      // Given: a stub that reset unnamed fields would make every test restate the
      // whole contract, which is how hand-written fixtures start.
      assert.deepEqual(factory.make({ vintage: 2019 }), {
        id: "1",
        name: "Rubicon",
        vintage: 2019
      });
    }
  );

  it(
    "lets an override REMOVE a field, not merely change it",
    function givenAnExplicitUndefined_whenMade_thenTheFieldIsGone() {
      // Given: the interesting tests take something away — a member with no
      // region, an event with no date, a note with no verdict. Under
      // `exactOptionalPropertyTypes` a `Partial<T>` cannot say that, which is why
      // `Overrides<T>` admits `undefined` and this behaviour is load-bearing.
      const made = factory.make({ vintage: undefined });

      assert.equal(made.vintage, undefined);
      assert.equal(made.name, "Rubicon");
    }
  );

  it(
    "hands back a fresh object every time",
    function givenTwoCalls_whenOneIsMutated_thenTheOtherIsUnaffected() {
      // Given: a shared base leaking between tests is the classic fixture bug —
      // one test's mutation becomes another's mysterious failure, in file order.
      const first = factory.make();
      first.name = "Something else";

      assert.equal(factory.make().name, "Rubicon");
    }
  );
});
