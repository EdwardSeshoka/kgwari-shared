import type { LockedSectionContract as LockedSectionContractShape } from "../record.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A section a claim has not bought yet, and the reason it is shut.
 *
 * The two factories are the asymmetry this whole model exists to make legible.
 * On a COMMUNITY record the estate has simply not spoken. On a
 * DISTRIBUTOR-claimed one somebody accountable has arrived and still cannot
 * answer — a claim on commerce is not a claim on the wine. Those are different
 * facts and they read as different sentences, which is why `bodyKey` has two
 * forms and why a consumer that renders one for both tells the second reader
 * something untrue.
 *
 * `params` carries the estate name rather than the copy concatenating it,
 * because a translated fragment either side of a proper noun reads correctly in
 * exactly one language.
 */
export const LockedSectionContract = {
  StubFactory: {
    ...defineStub<LockedSectionContractShape>({
      key: "estateVoice",
      titleKey: "record.locked.estateVoice.title",
      bodyKey: "record.locked.estateVoice.body",
      params: { estateName: "Môrester" },
      needs: "producer"
    }),

    /**
     * The same section on a distributor-claimed record.
     *
     * `needs` stays `"producer"` — that is the point. Somebody has claimed this
     * record and it is still not the somebody who could open this.
     */
    makeUnderDistributorClaim(
      overrides: Overrides<LockedSectionContractShape> = {}
    ): LockedSectionContractShape {
      return LockedSectionContract.StubFactory.make({
        bodyKey: "record.locked.estateVoice.distributorBody",
        ...overrides
      });
    }
  }
};
