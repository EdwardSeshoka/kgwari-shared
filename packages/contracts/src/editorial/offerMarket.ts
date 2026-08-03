import type { MoneyContract } from "../money/index.js";

/**
 * The offer in ONE market.
 *
 * Per market because a price is not a global fact: the same case is a different
 * number, in a different currency, with different availability in Cape Town and
 * in Lyon. **Kgwari converts nothing** — a converted price is a rate we invented,
 * on a day we picked, presented as the estate's.
 */
export type EditorialOfferMarketContract = {
  /** ISO 3166-1 alpha-2. */
  countryCode: string;
  /** The price in this market. Absent exactly when {@link absenceReason} is present. */
  price?: MoneyContract;
  /**
   * Why there is no price here. Absence is a statement — the same rule the wine
   * record runs on — and "no price" without a reason is the one thing a reader
   * cannot act on.
   */
  absenceReason?: "not_released" | "sold_out" | "trade_only" | "not_distributed";
  /** True when only the host's own list may buy it. */
  clubOnly?: boolean;
};
