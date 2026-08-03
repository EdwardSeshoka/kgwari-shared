import type { PaidPriceBandContract as PaidPriceBandContractShape } from "../pricing.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * What members paid, in ONE currency — percentiles, never extremes.
 *
 * The three figures are the 25th, the median and the 75th. They are NOT the
 * cheapest and dearest anybody reported, and that is a privacy decision rather
 * than a statistical one: a minimum and a maximum are each exactly one member's
 * private price republished verbatim, so a band built from extremes would leak
 * the two data points it most needs to protect.
 *
 * `typical` is deliberately not called `average`. It is a median, and the word
 * "average" would invite somebody to compute a mean and put it here — which is
 * wrong on this data, because one auction bottle at eight times the shelf price
 * drags a mean somewhere no member has ever paid.
 *
 * A band is published WHOLE or not at all, so there is no factory for a median
 * without shoulders: that shape would be a single number calling itself a range.
 */
export const PaidPriceBandContract = {
  StubFactory: {
    ...defineStub<PaidPriceBandContractShape>({
      currency: "ZAR",
      low: { amountMinorUnits: 72000, currency: "ZAR" },
      typical: { amountMinorUnits: 89500, currency: "ZAR" },
      high: { amountMinorUnits: 115000, currency: "ZAR" },
      sampleSize: 148
    }),

    /**
     * The same wine in another market — a SECOND band, never a conversion.
     *
     * Kgwari converts nothing. That a bottle costs different money in different
     * markets is not noise to be blended away; it is the answer for a member
     * deciding where to buy.
     */
    makeEuro(overrides: Overrides<PaidPriceBandContractShape> = {}): PaidPriceBandContractShape {
      return PaidPriceBandContract.StubFactory.make({
        currency: "EUR",
        low: { amountMinorUnits: 4200, currency: "EUR" },
        typical: { amountMinorUnits: 4800, currency: "EUR" },
        high: { amountMinorUnits: 6100, currency: "EUR" },
        sampleSize: 31,
        ...overrides
      });
    },

    /**
     * A band from eleven purchases.
     *
     * Published, but thin — and `sampleSize` is the only thing that says so. A
     * page rendering this identically to the 148-purchase band overstates it,
     * which is the same reason a colour reading carries its reading count.
     */
    makeThinlySampled(
      overrides: Overrides<PaidPriceBandContractShape> = {}
    ): PaidPriceBandContractShape {
      return PaidPriceBandContract.StubFactory.make({ sampleSize: 11, ...overrides });
    }
  }
};
