import type { FieldVerificationContract as FieldVerificationContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * The standing of a matched value under member scrutiny.
 *
 * `confirmations` is a COUNT, never a score and never rendered as one — it
 * exists so a long-unchallenged row can eventually read as settled.
 *
 * `makeDisputed()` is the state consumers get wrong. A disputed value stays
 * VISIBLE while it is contested, because hiding a fact under review is worse
 * than showing one that is being argued about — so a client that treats
 * `disputed` as "render nothing" has inverted the rule.
 */
export const FieldVerificationContract = {
  StubFactory: {
    ...defineStub<FieldVerificationContractShape>({
      confirmations: 34,
      disputed: false,
      confirmedByMe: false
    }),

    /** Under open dispute — and still on screen. */
    makeDisputed(
      overrides: Overrides<FieldVerificationContractShape> = {}
    ): FieldVerificationContractShape {
      return FieldVerificationContract.StubFactory.make({ disputed: true, ...overrides });
    },

    /**
     * Read for a member who has already confirmed. Confirmation is idempotent, so
     * the affordance must render as done rather than as available — a second tap
     * changes nothing and a client that offers it says otherwise.
     */
    makeConfirmedByMe(
      overrides: Overrides<FieldVerificationContractShape> = {}
    ): FieldVerificationContractShape {
      return FieldVerificationContract.StubFactory.make({ confirmedByMe: true, ...overrides });
    },

    /**
     * Read anonymously — `confirmedByMe` is ABSENT, not false.
     *
     * Absent means nobody asked on behalf of a member; false means a member asked
     * and has not confirmed. A signed-out reader seeing "you confirmed this" is
     * the bug this distinction prevents.
     */
    makeAnonymous(
      overrides: Overrides<FieldVerificationContractShape> = {}
    ): FieldVerificationContractShape {
      return FieldVerificationContract.StubFactory.make({
        confirmedByMe: undefined,
        ...overrides
      });
    }
  }
};
