# @edwardseshoka/foundation

## 3.3.0

### Minor Changes

- d5e853d: Add a `Composition` contract, and rename the seed service to a factory.

  **`Composition<Sources, Output>`** joins `Mapper`, `Validator` and `UseCase` in
  foundation. A mapper turns one thing into one other thing and may fail because
  its input can be malformed; a composition assembles several things into one that
  did not exist before.

  It is **deliberately not failable**, and that is the contract's whole statement:
  composition degrades rather than rejects. A missing source means an absent
  section, not an error — a discover page with no events is a valid discover page.
  Making it failable would hand every caller a `Result` they can do nothing with
  except render the empty page composing would have given them anyway. Anything
  that genuinely can fail is a `Mapper` or a `Validator` and should be one.

  `Composition.present()` captures the shape every composition written so far has
  needed — build the list with a `null` where a section is empty, then drop them —
  which encodes the rule that runs through this codebase: **an absent section beats
  an empty one.**

  The contract is split across two files — `CompositionInterface.ts` for what a
  composition IS, `Composition.ts` for the helpers — matching the
  `<X>UseCaseInterface.ts` / `<X>UseCase.ts` convention the feature packages
  already follow and foundation had not.

  **Configuration goes in the constructor, inputs go in `compose`.** That is what
  makes this a class contract rather than an object literal like `Mapper`: which
  market a catalogue is read from is decided once per request, while which wines
  are in it changes every call. Folding both into one bundle made every call site
  restate a setting that never varies.

  **Breaking:** `groupIntoCollections(wines, options)` is now
  `new WineCollectionsComposition(homeMarket).compose({ wines })`.

  It takes `WineContract[]` directly. An interim version was generic over anything
  wine-shaped, so a backend entity and a wire contract could both be passed without
  either importing the other — but that flexibility had no user. The frontend never
  builds a collection (it hardcodes `collections: []` and holds the type only to
  consume one), which leaves two callers, and both can hold a `WineContract`.

  It also cost two bugs, each from mis-declaring "the loosest shape a caller might
  hold": `location` was required and absent on four wines, then `isFeatured` was
  required and optional on the wire — meaning `WineContract` never satisfied the
  constraint written for it. Invisible at runtime; only a type-checked call site
  caught it.

  The deeper reason is that **a collection is a response shape, not a domain
  concept**. "Featured Picks" is a way of presenting a catalogue, so composing at
  the contract level is the correct layering rather than a concession — and it
  implies the backend's `WineCollection` entity and `listPublicCollections`
  repository method should go, with the grouping moving to the presentation edge.

  **Breaking:** `CatalogSeedService` is now `CatalogSeedFactory`. The taxonomy
  reserves "Service" for the HTTP edge that speaks DTOs, and nothing in it makes a
  call — it builds objects from static JSON. The old name described what its output
  looked like rather than what it did; by that reasoning every constructor is a
  service. Its methods still mirror the API, because "what does `GET /wines`
  return?" is the question a reader arrives with.

  `contracts` now depends on `foundation`. It is a type-only import, erased at
  compile time, and foundation carries no dependencies of its own, so the cost to
  consumers is nothing.

## 3.2.0

### Minor Changes

- 6c80b42: feature(search): make search rows localisable

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
  _role_ for a person. That last one mattered: `"Sommelier"` and `"Enthusiast"` are
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
    record rather than current fact. A _listed_ price changes freely; a _paid_
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

## 3.1.0

### Minor Changes

- d575080: Add a `Validator` contract, and own the verification-code rule under it.

  `Validator` joins `Mapper` and `UseCase` as a foundation contract: `validate`
  returns a `Result` rather than a boolean, so a rejection carries _why_. Failures
  are returned, never thrown, and a validator reports every issue it found rather
  than stopping at the first — one problem at a time makes a caller fix, resubmit,
  and be told about the next. Each issue has a stable machine-readable `code`
  (switchable, unaffected by copy changes), a developer-facing `message`, and an
  optional `path` for values inside composites. Valid values come back
  _normalized_, so callers use what the validator returned rather than what they
  passed in. `Validator.accepts` reduces it to a boolean where the reason genuinely
  does not matter.

  Two validators ship on it:

  - `VerificationCodeValidator` — codes `empty`, `notDigits`, `wrongLength`, plus
    `VERIFICATION_CODE_LENGTH` and `VERIFICATION_CODE_PATTERN` for schema
    libraries that want a regex. The length is fixed by AWS Cognito's managed
    `EMAIL_OTP` challenge (`USER_AUTH`), which issues eight digits — not the six
    of the older self-signup confirmation code. Neither end of the wire owns that
    number, and both had guessed it independently and wrongly: the app rendered a
    six-slot field that truncated real codes, and the API validated `/^\d{6}$/`,
    rejecting every real code before Cognito was ever consulted. Email sign-in
    could not succeed in either direction.
  - `EmailValidator` — codes `empty`, `malformed`, normalizing to a trimmed,
    lower-cased address.

  `validateEmail` keeps its signature and behaviour, now expressed through
  `EmailValidator`.

## 3.0.0

### Major Changes

- 444bd2e: Trim `Mapper` to its core: `map` and `flatMap`.

  `Mapper.map(input)` (the interface method) returns a `Result` — failures are returned, not thrown. `Mapper.flatMap(mapper, input)` returns the output directly for non-failable mappers (`Failure = never`, type-gated). Failable callers handle the returned `Result` themselves (`if (!result.success) throw result.error`), keeping the failure decision at the call site.

  Breaking: the `map` (nullable overload), `mapOptional`, `mapOrThrow`, `flatMapOptional`, and `mapOptionalOrThrow` namespace helpers are removed.

## 2.0.0

### Major Changes

- a5a8dd3: `Mapper.map` now returns the output directly for non-failable mappers.

  A `Mapper<Input, Output>` (the default `Failure = never`) returns `Output` from `map`, with no `Result` wrapper and nothing to unwrap; a failable `Mapper<Input, Output, SomeError>` still returns `Result<Output, SomeError>`. `Mapper.mapOrThrow(mapper, input)` continues to return `Output` uniformly for both.

  Breaking: non-failable mapper implementations return their output directly instead of `{ success: true, data }`, and the `map` / `mapOptional` / `flatMap` / `flatMapOptional` / `mapOptionalOrThrow` namespace helpers are removed (call `.map()` directly, or `mapOrThrow`).

## 1.2.1

### Patch Changes

- 6f63c3b: Packages Restructure Change Set

## 1.2.0

### Minor Changes

- 77e85e5: Add dependency-free shared email validation.

## 1.1.0

### Minor Changes

- 7cfa663: Introduce publishing script

## 1.0.0

### Major Changes

- 030694a: Establish the first stable shared package releases.

  This promotes the shared contracts, fixtures, and foundation packages to the
  `1.x` line so app repositories can consume backward-compatible minor and patch
  updates with a semver range like `^1.0.0`, while future breaking changes remain
  manual app upgrades.

## 0.1.0

### Initial release

- Added the initial Morara shared foundation utilities package.
