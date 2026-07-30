/**
 * Money on the wire.
 *
 * One rule governs this whole file: **record the amount and the currency as
 * transacted, and never store anything derived from them.** Not a converted
 * value, not a symbol, not a formatted string. A conversion baked in at write
 * time is a claim about an exchange rate that stops being true within days, and
 * it destroys the original fact permanently.
 *
 * The currency a wine is priced in is a property of the DATA, never of the
 * member's locale. A French speaker in Zürich sees a Bordeaux priced in EUR —
 * formatted with Swiss grouping, but still euros. Formatting follows the locale;
 * the currency code follows the product. Conflating those two is the classic
 * "€50 became $50" data-integrity bug, and it is why {@link MoneyContract}
 * always travels as a pair.
 *
 * ## Nobody types minor units
 *
 * Members enter prices — into a cellar record, into a listing — and they type
 * `895,50`, not `89500`. The conversion is a BOUNDARY concern, exactly like NFC
 * normalisation on a search query: the canonical form is what crosses the wire,
 * and turning input into it happens once, at the edge, in one tested place.
 *
 * That place is `parseMoneyAmount` in `@edwardseshoka/foundation`, with
 * `toEditableAmount` as its inverse for pre-filling an edit field. Both are pure
 * and take the locale's separators and the currency's exponent as arguments, so
 * the backend can validate a submitted amount with the same code the client
 * parsed it with. Two properties of that parser matter here:
 *
 * - **It never uses floating point.** `parseFloat("19.99") * 100` is
 *   `1998.9999999999998`; the parser works on the digit string instead, so an
 *   amount is never approximated on its way to becoming canonical.
 * - **It refuses more precision than the currency has** rather than rounding it
 *   away. Silently truncating a third decimal loses someone a cent of real
 *   money, and they never find out.
 *
 * ## What keeps the original original
 *
 * Four things, and all four are needed:
 *
 * 1. **Nothing derived is ever stored.** No converted value, no symbol, no
 *    formatted string, no cached scale. Everything else is computed at read time
 *    from these two fields.
 * 2. **The member picks the currency; the locale never does.** A South African
 *    buying in Bordeaux paid euros, and their phone being set to `en-ZA` must not
 *    turn that into rands. Default the picker sensibly, but always record the
 *    explicit choice.
 * 3. **{@link TransactedMoneyContract.asOf} pins historical amounts in time**, so
 *    a later valuation is a derivation against a stated date rather than a claim
 *    about today.
 * 4. **The parse round-trips.** `toEditableAmount(parse(typed))` returns what the
 *    member typed, for every launch locale and every supported currency —
 *    verified in `MoneyAmountValidation.test.js`. Show them the formatted result
 *    before saving; the echo is the confirmation that nothing was lost.
 */

/**
 * ISO 4217 alphabetic code, uppercase.
 *
 * Deliberately a closed union rather than `string`: every code here is a
 * currency Kgwari actually transacts in, and an unrecognised code reaching a
 * price field is far more likely to be a bug than a new market. The set tracks
 * the launch markets —
 *
 * - `ZAR` — South Africa, the home market
 * - `EUR` — France, Germany, Austria, Italy, Spain, Belgium, Luxembourg
 * - `GBP` — United Kingdom
 * - `CHF` — Switzerland
 * - `CAD` — Canada, incl. Québec
 * - `USD` — United States, and the default for international listings
 *
 * Extend deliberately, the same way {@link ../trust!VerdictWord} is extended.
 * Adding a market means adding its currency here first — which is the point:
 * it makes "we now sell in Japan" a visible, reviewed change rather than a
 * string that silently appears in production data.
 */
export type CurrencyCode = "ZAR" | "EUR" | "GBP" | "CHF" | "CAD" | "USD";

/**
 * An amount of money: an integer in the currency's MINOR units, plus the
 * currency it is denominated in.
 *
 * **`amountMinorUnits` is cents, not rands.** R895,00 is `89500`. €12,50 is
 * `1250`. The field is named for its unit rather than called `amount` because
 * the ambiguity is the bug: an `amount: 895` tells a caller nothing about
 * whether it is 895 rand or 895 cents, and the two differ by a factor of a
 * hundred. Every call site now has to read the unit to use the field.
 *
 * **Why minor units and not a decimal.** Floating point cannot represent 0.1
 * exactly, so money in `number` form accumulates error under arithmetic — the
 * canonical reason every payment system on earth stores integers. An integer
 * count of the smallest indivisible unit has no such problem.
 *
 * **The scale is derived, never stored.** How many minor units make a major one
 * is a property of the currency: 2 for EUR and ZAR, 0 for JPY, 3 for BHD. The
 * client gets it from `Intl.NumberFormat(locale, { style: "currency", currency
 * }).resolvedOptions().maximumFractionDigits` and divides at render time. Do NOT
 * add an `exponent` or `decimals` field here — a stored scale is one more thing
 * that can disagree with the currency code, and the currency code already knows.
 *
 * **No symbol field, ever.** `R`, `€`, `$` are formatting output, and the same
 * currency renders differently by locale (`CAD` is `$` in Canada and `CA$`
 * elsewhere — precisely the disambiguation that makes a stored symbol wrong).
 * The symbol comes from `formatCurrency(amountMinorUnits, currency)` at the
 * presentation edge and nowhere else.
 */
export type MoneyContract = {
  /** Integer, in the currency's smallest unit. R895,00 → `89500`. */
  amountMinorUnits: number;
  currency: CurrencyCode;
};

/**
 * An amount as it was actually transacted, at a point in time.
 *
 * The distinction from a bare {@link MoneyContract} is mutability, and it is
 * load-bearing. A *listed* price is the distributor's current fact and changes
 * freely. A *paid* price is the member's **immutable historical record** — what
 * they paid in Bordeaux is €45 on 12 March 2024, and it stays that forever.
 * Collapsing the two lets a distributor's price change silently rewrite what a
 * member remembers paying.
 *
 * `asOf` is what makes a later valuation honest: converting €45 to rands is a
 * derivation computed at read time against a rate **as of a stated date**, and
 * without the date there is no rate to state.
 */
export type TransactedMoneyContract = MoneyContract & {
  /** UTC ISO 8601 date the amount was transacted. */
  asOf: string;
};

/**
 * The three price concepts, which must never share a field.
 *
 * This exists as a type so the distinction is enforced rather than remembered.
 * All three are money; they differ in whose fact they are, whether they may
 * change, and where they are allowed to appear.
 *
 * | Concept | Whose fact | Mutability | Where it may appear |
 * |---|---|---|---|
 * | `listed` | the distributor's | current, changes freely | search, wine detail, request-a-taste |
 * | `paid` | the member's | **immutable** | cellar only |
 * | `valuation` | derived | recomputed | cellar only, always marked an estimate |
 */
export type PriceKind = "listed" | "paid" | "valuation";
