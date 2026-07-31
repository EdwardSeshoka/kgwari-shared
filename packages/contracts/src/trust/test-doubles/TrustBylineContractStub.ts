import type { TrustBylineContract as TrustBylineContractShape } from "../trust.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * Who stands behind a piece of content.
 *
 * `tier` is what earns a verification mark, and its ABSENCE is the meaningful
 * case: a plain member carries no mark at all, which is the invariant the whole
 * trust model rests on. `make()` therefore returns the marked case and
 * {@link TrustBylineContract.StubFactory.makeMember} the unmarked one, so a test
 * asking for "no mark" has to say so.
 */

export const TrustBylineContract = {
  StubFactory: {
    ...defineStub<TrustBylineContractShape>({
        name: "Thandi Mokoena",
        tier: "professional",
        role: "Sommelier"}),

    /** An ordinary member: no tier, so no mark. Only a status word. */
    makeMember(overrides: Overrides<TrustBylineContractShape> = {}): TrustBylineContractShape {
      return TrustBylineContract.StubFactory.make({
        name: "Alexandra Meyer",
        tier: undefined,
        status: "collector",
        role: undefined,
        ...overrides
      });
    }
  }
};
