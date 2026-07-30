---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
"@edwardseshoka/foundation": minor
---

feature(search): make search rows localisable

Search rows carried display text the server had already composed in English. That
is fine for one locale and unfixable in five, so it is corrected before the
backend indexes anything — after the index holds English `meta` strings, the same
change costs a reindex plus a coordinated client release.

**`SearchResultContract.meta`: composed string → `SearchResultMeta` descriptor.**
The old field held `"Est. 1693 · 6 wines"`, `"24 July · 4 seats left"`,
`"88 notes"` — three separate faults in one field. It concatenated translated
fragments, which assumes English word order; it hardcoded English plural rules,
where other launch locales have up to six forms; and `"24 July"` is a formatted
date, which no wire contract may carry. `meta` is now a discriminated union of the
data the line is composed from (`vintage`, `estate`, `region`, `tasting`,
`noteCount`), with the tasting case carrying UTC ISO 8601 `startsAt`. The client
renders each case through one full-sentence ICU key, which handles word order and
plurals together.

**`producer` → `eyebrow`, now a text-source union.** Renamed because "producer"
described only the wine case; the field also holds a region for an estate and a
*role* for a person. That last one mattered: `"Sommelier"` and `"Enthusiast"` are
`BusinessPersona` and `MemberStatus` values, so sending them as words hardcoded
English into every person row. Row text is now explicitly one of three sources —
`CanonicalText` (a proper noun, invariant across locales), `ChromeText` (a closed
enum the client renders from its own catalog), or `NegotiatedText` (server-
localised content, carrying the BCP 47 tag it actually came back in so a fallback
can be badged rather than passed off as a translation). `title` uses the same
building blocks, minus the chrome case — no entity is named by an enum.

**`SearchBrowseItemContract`:** `count` is a number rather than a pre-formatted
`"312"`, since a string cannot be grouped per locale. `query` is now required,
where it used to default to `label` — that default stopped being expressible once
a label could be a chrome key, because the member sees "Inoubliable" while the
index holds `Unforgettable`. Stating the query explicitly is what lets browsing by
verdict work in every locale without the index carrying one translated verdict
word.

**Responses** now echo `contentLanguage` (per `Content-Language`), and `/search`
carries a `truncated` flag against the new exported `SEARCH_RESULT_LIMIT` — the
client derives result counts from what arrives, so a silently capped set would
report the cap as the answer. `SEARCH_SUGGEST_LIMIT` is exported and pinned to 4
for a different reason: type-ahead density is a product decision, and 4 is what
the search screen was designed around — the frontend's stand-in had already
picked it locally, where the server could not see it. The two client-side
obligations that no type can enforce — send
`Accept-Language`, send NFC-normalised query text — are documented at the top of
`requests.ts`.

Sample search seeds are reshaped to match.

## Money: a new `@edwardseshoka/contracts/money` module

`MoneyContract` lived in `catalog/wine.ts` as `{ amount: number; currency: "ZAR" |
"USD" | "EUR" | "GBP" }`, and it had a live unit bug. `amount` did not say
whether it meant rands or cents — and the seeds meant **rands** (`{ amount: 895 }`
= R895) while the frontend's `formatCurrency(amountMinorUnits, …)` divides by the
currency's scale. Anything routed through the real formatter rendered **R8,95**.
It had not surfaced only because the single render site,
`WineDetailRouteView.tsx`, prints `` `${price.amount} ${price.currency}` `` —
"895 ZAR", with no symbol, grouping or locale at all.

Money now lives in its own module, because cellar, events and search all price
things and a money type inside `catalog` invites each of them to declare their
own:

- **`amount` → `amountMinorUnits`.** The rename is the fix: `amount: 895` tells a
  caller nothing, and the two readings differ by 100×. Every call site now has to
  read the unit. Integer minor units also avoids float error, which is why every
  payment system stores them.
- **The scale is derived, never stored.** 2 for EUR/ZAR, 0 for JPY, 3 for BHD —
  the currency code already knows, so there is deliberately no `exponent` field
  to disagree with it.
- **No symbol field, ever.** `CAD` renders `$` in Canada and `CA$` elsewhere;
  that disambiguation is exactly what a stored symbol destroys.
- **`CurrencyCode`** widened from four codes to the launch markets: `ZAR`, `EUR`,
  `GBP`, `CHF`, `CAD`, `USD`. Still a closed union — an unrecognised code in a
  price field is far likelier to be a bug than a new market.
- **`TransactedMoneyContract`** adds `asOf` for amounts that are historical
  record rather than current fact. A *listed* price changes freely; a *paid*
  price is immutable. `PriceKind` names the three concepts so they cannot
  collapse into one field.

`catalog` re-exports both types, so `@edwardseshoka/contracts/catalog` importers
keep resolving — but the shape changed, hence the major.

**Search rows carry `listedPrice?: MoneyContract`** — named for the concept, not
`price`, so a distributor's listing can never be mistaken for what a member paid.
Absent means "not listed", never free and never unknown.

**`SearchResultMeta` gains a `nonVintage` case.** The seed surfaced it: a
non-vintage Champagne has no year, and omitting `meta` would make it
indistinguishable from a row whose vintage nobody recorded. NV is a statement
about the wine, and it is chrome — "NV", "sans millésime", "senza annata".

## Money entry: `parseMoneyAmount` in `@edwardseshoka/foundation`

Minor units are right for storage and wrong for typing — members enter `895,50`,
not `89500`. The conversion is now one tested boundary, alongside the existing
validators.

`parseMoneyAmount(text, { separators, exponent, allowNegative })` returns a
`ValidationResult<number>` of minor units; `toEditableAmount` is the inverse, for
pre-filling an edit field with a plain decimal (no symbol, no grouping — those
fight the next keystroke). `MoneyAmountValidator(options)` wraps it in the
standard `Validator` shape so it composes with `Validator.accepts` and
`Validator.describe`.

Two decisions worth knowing:

- **No floating point, anywhere.** `parseFloat("19.99") * 100` is
  `1998.9999999999998`, and `Math.round` only hides that the approach is unsound.
  The parse splits the digit string at the decimal separator, pads the fraction
  to the currency's exponent and concatenates — so no amount is ever
  approximated. There is a test asserting exactly this.
- **No `Intl`, so the backend can use it.** Separators and exponent are
  arguments, derived by the caller (`Intl.NumberFormat(locale).formatToParts` —
  `Intl` has no parser, per localization §7.3). Foundation stays importable from
  domain and backend code, and a submitted amount can be re-validated server-side
  with the same function that parsed it.

It handles what members actually type: currency symbols, every Unicode space
(including the U+202F narrow no-break space French grouping really uses — an
ASCII-space-only strip is a real bug), non-Latin digits, and short fractions
(`895,5` → `89550`, not `89505`). It refuses what is ambiguous rather than
guessing: two decimal separators, more precision than the currency holds (`JPY`
takes none), negatives on a price, and amounts beyond safe-integer range.

23 unit tests, plus a verified format→edit→parse round-trip across all seven
launch locale tags × ZAR/EUR/USD/JPY — 28 cases, zero drift.

Seeds updated throughout: catalog and discover prices converted to minor units
(14 and 6 objects), search wine rows given their catalog listing, and the EUR/USD
catalog wines pulled into the search corpus so the seed exercises more than one
currency — one row is deliberately left unlisted to cover absence.
