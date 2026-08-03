import type { MarketPriceContract as MarketPriceContractShape } from "../pricing.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { PaidPriceBandContract } from "./PaidPriceBandContractStub.js";

/**
 * The market picture for one vintage — what the room actually paid.
 *
 * Not {@link WineContract.price}, which is one distributor's current asking
 * price. This answers the other question, the one no seller can: what does this
 * wine go for.
 *
 * ## The two factories that matter
 *
 * `makeWithheld()` — a currency with purchases behind it and no band, because
 * there were too few to publish without exposing the members behind them. The
 * floor is server policy and never on the wire; the client gets a REASON and
 * that is enough to say something true. A consumer that treats a missing band as
 * "nobody drinks this here" reports `too_few` as `none_filed`.
 *
 * `makeUnpriced()` — bands empty, every currency accounted for in `absent`. The
 * enumerable-while-empty rule the wine record runs on: a currency the server
 * considered and could not report is a fact worth stating.
 */
export const MarketPriceContract = {
  StubFactory: {
    ...defineStub<MarketPriceContractShape>({
      wineVintageId: "wine_rubicon-2018",
      window: { from: "2024-08-03T00:00:00.000Z", to: "2026-08-03T00:00:00.000Z" },
      bands: [
        PaidPriceBandContract.StubFactory.make(),
        PaidPriceBandContract.StubFactory.makeEuro()
      ],
      absent: [{ currency: "CHF", reason: "none_filed" }]
    }),

    /**
     * Bought in Switzerland, but by too few members to publish.
     *
     * `too_few` and `none_filed` sit side by side here on purpose — they are
     * different facts and a client that renders both as "no price" has thrown
     * away the distinction the reason code exists to carry.
     */
    makeWithheld(overrides: Overrides<MarketPriceContractShape> = {}): MarketPriceContractShape {
      return MarketPriceContract.StubFactory.make({
        bands: [PaidPriceBandContract.StubFactory.make()],
        absent: [
          { currency: "CHF", reason: "too_few" },
          { currency: "EUR", reason: "none_filed" },
          { currency: "GBP", reason: "too_old" }
        ],
        ...overrides
      });
    },

    /** Nobody has filed a price in any currency. Stated, not silent. */
    makeUnpriced(overrides: Overrides<MarketPriceContractShape> = {}): MarketPriceContractShape {
      return MarketPriceContract.StubFactory.make({
        bands: [],
        absent: [
          { currency: "ZAR", reason: "none_filed" },
          { currency: "EUR", reason: "none_filed" }
        ],
        ...overrides
      });
    }
  }
};
