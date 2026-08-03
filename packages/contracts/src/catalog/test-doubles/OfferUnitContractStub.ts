import type { OfferUnitContract as OfferUnitContractShape } from "../availability.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * What one unit of the offer is — a 750 ml bottle at the cellar door, a
 * six-bottle case from a warehouse.
 *
 * `volume` is a {@link Measurement} and never the string "750 ml": that is a
 * number, a unit and a decimal separator that is a comma for most of this
 * catalogue's members.
 *
 * `minimumBottles` is the claimant's own rule and is THEIRS to enforce. It is
 * carried so the block can state it, not so the client can block a request — a
 * client that refuses to send one has taken a seller's policy and made it
 * Kgwari's.
 */
export const OfferUnitContract = {
  StubFactory: {
    ...defineStub<OfferUnitContractShape>({
      volume: { source: "measurement", value: 750, unitKey: "unit.millilitre" },
      channel: "cellar_door"
    }),

    /** A trade-only case with a minimum the block states and does not enforce. */
    makeTradeCase(overrides: Overrides<OfferUnitContractShape> = {}): OfferUnitContractShape {
      return OfferUnitContract.StubFactory.make({
        channel: "trade_only",
        minimumBottles: 6,
        ...overrides
      });
    },

    /** A magnum, so a consumer's fixtures are not all one format. */
    makeMagnum(overrides: Overrides<OfferUnitContractShape> = {}): OfferUnitContractShape {
      return OfferUnitContract.StubFactory.make({
        volume: { source: "measurement", value: 1500, unitKey: "unit.millilitre" },
        channel: "warehouse",
        ...overrides
      });
    }
  }
};
