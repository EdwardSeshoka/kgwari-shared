/**
 * What the room actually paid — the market band, aggregated.
 *
 * ## Why this is not `WineContract.price`
 *
 * That field is a DISTRIBUTOR'S LISTING: one seller's current asking price, a
 * commercial fact they publish and change at will. This is what members
 * reported paying, across shops, auctions, cellar doors and en primeur, over a
 * stated window. They answer different questions — "what does this cost to buy
 * from them today" versus "what does this wine go for" — and a reader deciding
 * whether a shelf price is fair needs the second one, which no seller can
 * supply.
 *
 * ## Where the numbers come from, and what must never happen to them
 *
 * Every input is a {@link ../cellar!CellarEntryContract.paidPrice} — a
 * {@link ../money!TransactedMoneyContract}, immutable, dated, and **owned by the
 * member**. That provenance sets the entire design of this contract:
 *
 * **A price never appears on the note.** It never has and it does not start
 * here. The privacy rule for price is structural — price is a cellar fact and
 * notes are a room fact, and the two domains cannot see each other (see
 * {@link ../social!SubmitTastingNoteRequest.paidPrice}). What this contract
 * publishes is an AGGREGATE with no member attached to any figure in it, which
 * is the only form in which a member's private number may leave their cellar.
 *
 * **Never converted.** One band per currency, and Kgwari converts nothing — the
 * same rule {@link ../editorial!EditorialOfferMarketContract} runs on. A wine
 * bought for R650 in Stellenbosch and €48 in Lyon has two market bands, not one
 * blended figure computed against a rate we picked on a day we chose. Blending
 * them would also destroy the more useful fact: the same bottle costs
 * different money in different markets, and that IS the answer for a member
 * deciding where to buy.
 *
 * ## Why a band and not an average
 *
 * Two reasons, and the second is the one that matters.
 *
 * A mean is wrong on this data. Wine prices are skewed hard by the tail — one
 * member's auction bottle at eight times the shelf price drags a mean somewhere
 * no member has ever paid, and reports it as typical. Percentiles do not move
 * when one number is extreme, so the band is percentiles.
 *
 * A MINIMUM AND MAXIMUM would be worse than either. The lowest and highest
 * figures in the set are each exactly one member's private price, republished
 * verbatim — the aggregate would leak the two data points it most needs to
 * protect. {@link PaidPriceBandContract} carries no extremes for that reason.
 *
 * ## The withholding rule
 *
 * Below a sample floor there is no band, and the field is ABSENT with a stated
 * reason rather than present and thin. A "band" over three purchases identifies
 * three members' spending to anyone who can count, and it is not a market price
 * in any case.
 *
 * The floor is SERVER POLICY and is deliberately not on the wire — the same
 * choice {@link WineRegisterContract} makes about its own thresholds, for the
 * same reason: a client holding the number is a client that must ship to change
 * editorial judgement. {@link PaidPriceAbsenceReason} is what a client renders,
 * and it is enough to say something true.
 */

import type { CurrencyCode, MoneyContract } from "../money/index.js";

/**
 * Why a currency has no band.
 *
 * Absence is a statement here exactly as it is on the record — an empty price
 * section that says nothing is the one thing a reader cannot act on.
 *
 *  - `too_few`     Purchases exist, but not enough to publish without exposing
 *                  the members behind them. The honest reading of a thin set,
 *                  and NOT the same as nobody having bought it.
 *  - `none_filed`  No member has recorded paying for this wine in this currency.
 *  - `too_old`     Purchases exist but all of them fall outside
 *                  {@link MarketPriceContract.window}. A price from 2016 is a
 *                  historical fact, not what the wine goes for.
 */
export type PaidPriceAbsenceReason = "too_few" | "none_filed" | "too_old";

/**
 * What members paid, in ONE currency.
 *
 * The three figures are percentiles of the purchases in this currency inside the
 * window — not the cheapest and dearest anybody reported. See the module header
 * for why extremes are absent by design rather than by omission.
 */
export type PaidPriceBandContract = {
  currency: CurrencyCode;
  /**
   * The 25th percentile — "you can find it for about this".
   *
   * Present exactly when {@link typical} is. A band is published whole or not at
   * all: a client that had to handle a median with no shoulders would be
   * rendering a single number and calling it a range.
   */
  low: MoneyContract;
  /**
   * The MEDIAN, and the one figure to render if there is room for only one.
   *
   * Deliberately not called `average`, because it is not one and the word would
   * invite somebody to compute a mean and put it here. See the module header.
   */
  typical: MoneyContract;
  /** The 75th percentile — "expect to pay up to about this". */
  high: MoneyContract;
  /**
   * How many recorded purchases the band is drawn from.
   *
   * Carried for the same reason {@link ColourReadingContract} carries its
   * reading count: a figure from eleven purchases and one from nine hundred are
   * different claims, and a page that shows both identically is overstating the
   * first. It is a count of PURCHASES, never a list of them, and never enough to
   * identify anyone.
   */
  sampleSize: number;
};

/**
 * The market picture for one vintage.
 *
 * `bands` is per currency and `absent` is per currency, and a currency appears
 * in exactly one of them. Both are populated: a member in Zürich looking at a
 * wine with a strong ZAR band and no CHF purchases should be told that nobody
 * has filed a Swiss price, not shown a rand figure they cannot use and did not
 * ask for.
 */
export type MarketPriceContract = {
  /** The vintage these prices are for. A price is never a label-level fact. */
  wineVintageId: string;
  /**
   * The period the purchases fall in — ISO-8601 instants, `from` inclusive,
   * `to` exclusive.
   *
   * On the wire rather than implied, because "what it goes for" has a shelf
   * life and a client cannot say which one the server chose. A band over the
   * last two years and a band over all time are different claims, and only the
   * server knows which it computed.
   *
   * Dated on {@link ../money!TransactedMoneyContract.asOf} — when the money
   * moved — never on when the row was written. A member filing a 2019 purchase
   * today has reported a 2019 price.
   */
  window: { from: string; to: string };
  /** One per currency with enough purchases behind it. May be empty. */
  bands: PaidPriceBandContract[];
  /**
   * Currencies asked about and not answered, each with its reason.
   *
   * Enumerable-while-empty, the rule the wine record runs on: a currency the
   * server considered and could not report is a fact worth stating, and
   * dropping it silently is how a page implies nobody drinks this wine in
   * France.
   */
  absent?: { currency: CurrencyCode; reason: PaidPriceAbsenceReason }[];
};

/**
 * Response body of the market-price endpoint. `null` when the vintage does not
 * exist — distinct from a `MarketPriceContract` with no bands, which is a wine
 * nobody has filed a price for.
 */
export type GetMarketPriceResponse = {
  item: MarketPriceContract | null;
};
