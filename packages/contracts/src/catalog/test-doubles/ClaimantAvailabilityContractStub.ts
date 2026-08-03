import type { ClaimantAvailabilityContract as ClaimantAvailabilityContractShape } from "../availability.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { ClaimantResponseRecordContract } from "./ClaimantResponseRecordContractStub.js";
import { OfferUnitContract } from "./OfferUnitContractStub.js";

/**
 * The claimant's block: who they are, what they charge, and how to ask.
 *
 * Two rules shape every factory here, and both are about keeping Kgwari out of
 * the sale. The price belongs to the CLAIMANT, not to the page — a community
 * record reads "no price on record" because nobody accountable has quoted one,
 * and availability exists only where a claim does. And a request goes TO the
 * claimant: Kgwari holds no stock and takes no payment.
 *
 * `makePaused()` is the state consumers drop. `acceptsRequests: false` means the
 * claimant has stopped taking requests and **the block still renders** — the
 * price is still a fact, and hiding the whole enclosure would make a paused
 * seller look like an unclaimed record.
 */
export const ClaimantAvailabilityContract = {
  StubFactory: {
    ...defineStub<ClaimantAvailabilityContractShape>({
      claimantName: { source: "canonical", text: "Kanonkop Estate" },
      claimantTier: "producer",
      price: { amountMinorUnits: 89500, currency: "ZAR" },
      unit: OfferUnitContract.StubFactory.make(),
      acceptsRequests: true,
      responseRecord: ClaimantResponseRecordContract.StubFactory.make()
    }),

    /**
     * A distributor's block — commerce, from somebody who did not make the wine.
     *
     * The tier is what the role line is composed FROM ("Distributor · listed this
     * record"); a client that renders a sent sentence instead has one language.
     */
    makeDistributor(
      overrides: Overrides<ClaimantAvailabilityContractShape> = {}
    ): ClaimantAvailabilityContractShape {
      return ClaimantAvailabilityContract.StubFactory.make({
        claimantName: { source: "canonical", text: "Great Domaines" },
        claimantTier: "distributor",
        unit: OfferUnitContract.StubFactory.makeTradeCase(),
        ...overrides
      });
    },

    /**
     * Allocated rather than simply sold — the action reads "request an
     * allocation", which is a different and more accurate promise.
     */
    makeAllocation(
      overrides: Overrides<ClaimantAvailabilityContractShape> = {}
    ): ClaimantAvailabilityContractShape {
      return ClaimantAvailabilityContract.StubFactory.make({
        isAllocation: true,
        price: undefined,
        ...overrides
      });
    },

    /** Requests paused. The block renders; the action does not. */
    makePaused(
      overrides: Overrides<ClaimantAvailabilityContractShape> = {}
    ): ClaimantAvailabilityContractShape {
      return ClaimantAvailabilityContract.StubFactory.make({
        acceptsRequests: false,
        ...overrides
      });
    },

    /**
     * Claimed, with no price quoted and too few requests for a ratio to mean
     * anything.
     *
     * A claim is not a price list — an estate can stand behind its record and
     * still not publish what it charges, and a consumer that requires `price` to
     * render the block hides an accountable claimant.
     */
    makeWithoutPrice(
      overrides: Overrides<ClaimantAvailabilityContractShape> = {}
    ): ClaimantAvailabilityContractShape {
      return ClaimantAvailabilityContract.StubFactory.make({
        price: undefined,
        unit: undefined,
        responseRecord: undefined,
        ...overrides
      });
    }
  }
};
