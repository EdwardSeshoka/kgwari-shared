import type { WineCollectionContract as WineCollectionContractShape } from "../collections.js";
import { WineContract } from "./WineContractStub.js";

/**
 * A collection as it travels on the wire.
 *
 * Note what is NOT here: no `title`, `subtitle`, `description` or `badge.label`.
 * The contract carries a chrome `key` and the client renders all four words from
 * its own catalog. A frontend DTO still declaring those four is how this stub
 * earns its place — it cannot be written wrongly without failing to compile.
 */
export const WineCollectionContract = {
  StubFactory: {
    make(overrides: Partial<WineCollectionContractShape> = {}): WineCollectionContractShape {
      return {
        key: "featured_picks",
        badgeKey: "badge.featured",
        wines: [WineContract.StubFactory.make()],
        ...overrides
      };
    },

    /** The market collection, which carries the country it was read from. */
    makeHomeMarket(overrides: Partial<WineCollectionContractShape> = {}): WineCollectionContractShape {
      return WineCollectionContract.StubFactory.make({
        key: "home_market_icons",
        badgeKey: undefined,
        params: { countryCode: "ZA" },
        ...overrides
      });
    }
  }
};
