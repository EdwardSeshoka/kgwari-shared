import type { WineClaimContract as WineClaimContractShape } from "../trust.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A producer or distributor standing behind a wine record.
 *
 * `name` is `CanonicalText`, not a bare string — a producer's name is the same
 * word in every locale and the carrier says so, rather than leaving each reader
 * to decide whether it may be translated.
 */

export const WineClaimContract = {
  StubFactory: {
    ...defineStub<WineClaimContractShape>({
        kind: "producer",
        name: { source: "canonical", text: "Kanonkop Estate" },
        producerId: "producer_kanonkop",
        claimedAt: "2026-06-23T10:15:30.000Z"}),

    /**
     * A distributor listing, not the producer.
     *
     * The case that used to hide inside a three-value provenance ladder as
     * "listed" — a distributor claim wearing a middle state's clothes. It carries
     * no `producerId`, because a distributor is not one.
     */
    makeDistributor(overrides: Overrides<WineClaimContractShape> = {}): WineClaimContractShape {
      return WineClaimContract.StubFactory.make({
        kind: "distributor",
        name: { source: "canonical", text: "Vinimark" },
        producerId: undefined,
        ...overrides
      });
    }
  }
};
