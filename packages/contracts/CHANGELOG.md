# @edwardseshoka/contracts

## 5.0.0

### Major Changes

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

## 4.2.0

### Minor Changes

- 7807d30: Add the search contracts and seed corpus.

  `@edwardseshoka/contracts/search` introduces the unified search ledger: one
  `SearchResultContract` row shape covering wines, estates, regions, tastings and
  people, with the facet sent explicitly so clients never own the kind→facet
  table. `SearchResponse` is deliberately the query's **whole** match set —
  faceting is a client concern, and a pre-filtered payload would leave the filter
  index offering only the facet the member is already inside.

  `@edwardseshoka/samples` adds `createSearchCorpus()` and
  `createSearchBrowseGroups()`. The corpus references the same entity ids as the
  catalog, provenance, events and social samples, so a seeded backend and a
  frontend app double resolve results against records that actually exist.

## 4.1.0

### Minor Changes

- 6866050: Enrich discover so the Fade Yield home screen composes end-to-end.

  **contracts** — `EditorialContract` gains an optional `author?: TrustBylineContract`
  (the byline shown on every editorial card: name + verification mark or member
  status + role). Additive; no existing field changes.

  **samples (breaking — curation shape)** — the curation document now drives the
  funnel directly:

  - `CurationSection` is a discriminated union. `region_cards` / `producer_cards`
    are replaced by a single `doorway_cards` section that carries fully-curated
    browse doorways inline (`DiscoverDoorwayContract[]`) — regions, producers,
    curated collections and appellations, each with an editorial title, a curator
    byline and a navigable `target`. Consumers that composed doorways by deriving
    from region/producer refs must read the inline `doorways` instead.
  - Editorial fixtures gain author bylines; two events are added
    (`event_chenin_masterclass` — online / open, no seat cap; `event_cap_classique_brunch`
    — sold out) and the curation references all four, so the events rail and its
    seat states (open · seats-left · sold-out) are seeded.
  - Sections are ordered to the funnel (editorial · doorways · events · room); the
    `discover-response.json` fixture is updated to match (authors + four events).

## 4.0.0

### Major Changes

- e8c658f: Wine World Model + Fade Yield: evolve the shared contracts so the model understands wine globally and expresses the Fade Yield design — verdict words, provenance, trust bylines and member-note counts instead of public numeric scores.

  **Breaking — `contracts`**

  - Remove public numeric scores: `WineRatingContract`, `WineContract.rating`, `AddWineRequest.rating` and `ActivityContract.rating` are gone. Wines carry `verdict`, `provenance`, `source` and `noteCount` instead.
  - `VerdictWord` is a fixed 5-level ordinal scale: Unforgettable · Essential · Worth Revisiting · An Interesting Discovery · Not One I'd Revisit.
  - Three-tier catalog identity — `WineContract.id` is the **vintage** id, `wineLabelId` groups vintages; add `vintage` / `vintageDisplay`; `year` is now a deprecated optional alias.
  - Global origin — add `countryCode`, `appellation`, `color`, `grapeBlend` to wines; `RegionContract` hierarchy (`parentRegionId`, `regionType`, `countryCode`); new `AppellationContract`; `ProducerContract.countryCode`.
  - Unified trust vocabulary — `TrustTier` (professional · producer · distributor), `MemberStatus` (enthusiast → collector), `BusinessPersona` + `personaTier` mapping, and `MemberProfileType = MemberStatus | BusinessPersona` (renames "estate" → "producer"). New `TrustBylineContract`, `ProvenanceState`, `tierForProfile`.
  - Discover surfaces reshaped — `DiscoverSection` drops `regions`/`producers` in favour of `wines` (`WineContract[]`) and `doorways` (`DiscoverDoorwayContract` with a navigable `target`); adds `DiscoverWineHeroContract`, `WineActionContract`, `EditorialSubjectContract`/`EventSubjectContract` targeting, and `EventContract.host`. `WineListingContract` removed.
  - New `TastingNoteContract`, keyed to `wineVintageId` with distinct `tastedAt` / `createdAt`.

  **Breaking — `samples`**

  - Fixtures reshaped to the new contracts (no numeric `rating`), with global seeds (WO Stellenbosch · AOC Pauillac/Champagne · DOCG Barolo · Napa AVA, plus a non-vintage wine), new `appellations` and `tastingNotes` samples, and the discover fixture rebuilt to the Fade Yield funnel (editorial → wines → doorways → events → room).

## 3.0.0

### Major Changes

- 2b1f9d9: Restructure contracts into per-domain subpaths and make discover a composition contract.

  - New subpaths: `/catalog`, `/provenance`, `/editorial`, `/events`, `/social` (plus existing `/discover`, `/member`). `WineContract` and friends move from the package root to `/catalog` — the root now exports only `ApiResponse` and `PaginationContract`.
  - `PaginationDTO` renamed to `PaginationContract`.
  - Discover rewritten to the two-tier `DiscoverContract` (`{ hero, sections }`). The hero is a featured domain entity (`wine | region | editorial`) and sections carry domain-contract arrays. The old card and view-shaped hero types (`RegionCard`, `DiscoverWineHero`, `stats`, `ctas`, etc.) are removed — presentation now lives on the client.

  Breaking: every import path changes. Consumers move `WineContract` to `@edwardseshoka/contracts/catalog`, replace `DiscoverHomeResponse`/cards with `DiscoverContract` + domain contracts, and rename `PaginationDTO`.

## 2.1.0

### Minor Changes

- d46851d: Add member profile contract under the `@edwardseshoka/contracts/member` subpath.

  Exposes `MemberContract`, `MemberProfileType`, `MemberContactMethod`,
  `SaveMemberProfileRequest`, `GetMemberProfileResponse`, and
  `SaveMemberProfileResponse` as the single source of truth for the
  `GET/POST /user/profile` endpoints, shared by the backend Lambda handlers and
  the frontend member-data layer (including the member repository app double).

## 2.0.0

### Major Changes

- 6f63c3b: Packages Restructure Change Set

## 1.2.0

### Minor Changes

- cc5799c: Add Discover Home and public Wines contracts, curation seeds, and seed-to-response mapping helpers.

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

- Added the initial Morara shared contracts package.
