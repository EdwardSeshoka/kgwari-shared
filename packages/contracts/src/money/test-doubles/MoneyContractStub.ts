import type { MoneyContract as MoneyContractShape } from "../money.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A price as transacted: a canonical integer amount, and the currency it was
 * transacted IN — never the reader's currency.
 *
 * The default is R895,00 expressed as 89500. Minor units are the canonical form,
 * and a stub that used major units would let a reader divide twice and still pass
 * every assertion, because 895 and 8.95 are both plausible-looking prices.
 */

export const MoneyContract = {
  StubFactory: {
    ...defineStub<MoneyContractShape>({
        amountMinorUnits: 89500,
        currency: "ZAR"}),

    /**
     * A zero-decimal currency. JPY's exponent is 0, so 89500 is ¥89,500 and not
     * ¥895 — the one case that catches a reader dividing by a hardcoded 100.
     */
    makeZeroDecimal(overrides: Overrides<MoneyContractShape> = {}): MoneyContractShape {
      return MoneyContract.StubFactory.make({
        currency: "USD",
        amountMinorUnits: 4999,
        ...overrides
      });
    }
  }
};
