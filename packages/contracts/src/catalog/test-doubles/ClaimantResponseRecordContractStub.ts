import type { ClaimantResponseRecordContract as ClaimantResponseRecordContractShape } from "../availability.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * How the claimant answers requests — accountability applied to commerce.
 *
 * The rest of the record insists on knowing who stands behind a fact; this
 * insists on knowing whether they answer when spoken to. **A claimant who does
 * not answer should look like one**, which is why `makeUnresponsive()` exists
 * and why a client must not hide a poor ratio.
 *
 * `typicalResponseHours` is a DURATION, not a phrase. The client turns it into
 * "two days", "twee dae" or "deux jours" with its own plural rules and decides
 * for itself whether hours or days is the natural unit at that magnitude — a
 * server sending "usually within two days" has hardcoded English.
 */
export const ClaimantResponseRecordContract = {
  StubFactory: {
    ...defineStub<ClaimantResponseRecordContractShape>({
      requestsReceived: 11,
      requestsAnswered: 9,
      typicalResponseHours: 41
    }),

    /** Asked often, answers rarely. The block still renders it. */
    makeUnresponsive(
      overrides: Overrides<ClaimantResponseRecordContractShape> = {}
    ): ClaimantResponseRecordContractShape {
      return ClaimantResponseRecordContract.StubFactory.make({
        requestsReceived: 24,
        requestsAnswered: 2,
        typicalResponseHours: undefined,
        ...overrides
      });
    },

    /**
     * Answers fast enough that hours is the honest unit.
     *
     * The client decides that, not the server — which is the case this factory
     * exists to exercise: 3 and 41 must both render naturally from one field.
     */
    makeFast(
      overrides: Overrides<ClaimantResponseRecordContractShape> = {}
    ): ClaimantResponseRecordContractShape {
      return ClaimantResponseRecordContract.StubFactory.make({
        typicalResponseHours: 3,
        ...overrides
      });
    }
  }
};
