# @edwardseshoka/fixtures

## 9.0.0

### Major Changes

- a253b92: feature(samples): Expand the seeds so search can actually be tested

  26 search rows could not exercise search. Nothing folded, no synonym had a pair,
  one currency appeared, and a query returned two rows of the same kind. The corpus
  is now **328 rows** — 93 wines, 63 estates, 61 regions, 59 tastings, 52 people —
  backed by the five domain seeds that own them.

  **Chosen to exercise the index, not to look full.** Real producers, regions and
  appellations, because `château`, `Rías Baixas`, `Grüner Veltliner` and
  `Weingut Dönnhoff` fold and stem the way real names do and invented ones do not.
  The gap that matters is now measurable rather than asserted: `chateau` returns 0
  rows where `château` returns 12, and `rhone` returns 0 where `rhône` returns 4.
  That is the before/after for OpenSearch's `icu_folding`.

  Coverage the seeds now hold deliberately:

  - **All six launch currencies** — EUR 46, ZAR 20, GBP 4, USD 4, CAD 3, CHF 2.
    Priced in the producer's own currency, because the currency follows the data.
  - **All six launch languages** in `NegotiatedText` — 64 rows across `af`, `de`,
    `en`, `es`, `fr`, `it`, as tasting titles and region exonyms (Bourgogne/Burgundy,
    Toscana/Tuscany, Jerez/Sherry).
  - **The awkward cases**: non-vintage wines, tastings with no seat cap, wines with
    no listing, and grape synonym pairs the index mapping declares.

  ## Breaking

  `@edwardseshoka/samples` exports the same functions with the same types, but the
  **data behind them changed wholesale** — most ids are new, and every consumer
  reading a specific row by id is affected. The 14 originally curated wines keep
  their exact ids (`rubicon-2018` and the rest); everything else is new.

  ## `public-wines.json` is now `wines.json`

  `createPublicWines()` becomes `createWines()`, and the file loses the qualifier.

  Signing in does not change **which wines exist** — it changes what a member can do
  with them and what additional data they see. So "public wines" was never a kind of
  wine; it was describing a storage partition that had leaked into the naming. The
  catalogue is one catalogue.

  The deeper version of this is not fixed here: a member's cellar still stores a
  full _copy_ of the wine under `USER#<id>` rather than a reference, which is why
  the partition exists at all. That is tracked separately — it needs a `CellarEntry`
  that references a `wineId` and carries only what is true for that member, which is
  what `TransactedMoneyContract` was added for.

  ## A generator, committed alongside

  `generator/` now produces every seed from one curated source, run with
  `npm run generate:seeds`.

  It exists because the cross-reference is the point — opening a search result must
  land on a record that exists — and ~330 rows of that cannot be maintained by
  hand. It already caught two failures of exactly that kind: 28 people generated
  into the corpus with no record in any domain (the `user_thandi_nkosi` bug at
  scale), and `discover/curation.json` losing its hero because `rubicon-2018` was
  regenerated out from under a reference that stayed pointing at it.

  The generator is deterministic — regenerating without editing the source produces
  byte-identical files — and preserves the hand-curated rows verbatim rather than
  recreating them.

## 8.0.0

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

### Patch Changes

- Updated dependencies [6c80b42]
  - @edwardseshoka/contracts@5.0.0

## 7.1.0

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

### Patch Changes

- Updated dependencies [7807d30]
  - @edwardseshoka/contracts@4.2.0

## 7.0.4

### Patch Changes

- 1facd50: Give the four imported wines label images.

  `public-wines.json` carried an `imageUrl` for every South African wine but none
  of the imports (Château Pichon Baron, Vietti Castiglione Barolo, Ridge Monte
  Bello, Larmandier-Bernier Latitude). `imageUrl` is optional in the contract, so
  these resolved to `undefined` and rendered the `MediaPlaceholder` mesh — most
  visibly on Vietti, which sits in "Worth opening now" via its Unforgettable
  verdict. All four now carry a verified image, so every wine in the pool has one.

  The discover app-double fixture (`discover-response.json`) is regenerated from
  the pool by `generateDiscoverFixture.mjs`, so it picks up the new images. The
  regeneration also realigns "Worth opening now" with the current
  `composeDiscover` ranking (verdict rank, then note count) — the committed
  snapshot predated that ordering — bringing the local double back in step with
  what the backend composes.

## 7.0.3

### Patch Changes

- fc2fa49: Reference the two new "This week in wine" reads from the discover plan.

  7.0.2 added the TASTING and NOTE items to the editorial _pool_
  (`editorial.json`), but `composeDiscover` builds each section from the plan's
  `itemRefs` — not from the pool — so the section still resolved to its original
  three and the Read index collapsed to a single row.

  `curation.json`'s `this_week_in_wine` now references all five items (priorities
  1–5). The pool holds what exists; the plan decides what appears — both have to be
  updated together for a new read to reach the page.

## 7.0.2

### Patch Changes

- 946fd19: Carry the two new "This week in wine" reads into `editorial.json`.

  7.0.1 added the TASTING and NOTE items to `discover-response.json` only — the
  frozen snapshot the frontend's app-double replays. The backend composes Discover
  from `editorialSamples` (`editorial.json`), so a deployed frontend still saw the
  original three and the Read section's index collapsed to a single row.

  Both fixtures now carry the same five items, with matching ids so they cannot
  drift apart again. Data-only; no contract change.

## 7.0.1

### Patch Changes

- 870d313: Seed doorway card images. The four discover `doorway_cards` — The Swartland
  Table, The Meerlust Cellar, Cape Bordeaux and Barolo DOCG — now carry an
  `imageUrl` in both the `discover-response.json` and `curation.json` fixtures, so
  the "Find your way in" browse cards render photography instead of falling back to
  the mesh placeholder. Data-only; the `DiscoverDoorwayContract` already declared
  `imageUrl` as optional.
- 697ec28: Seed two more "This week in wine" reads. The discover `editorial` section now
  carries five items instead of three — adding a TASTING story ("Six Cinsaults,
  poured blind.") and a NOTE article ("The case for cellaring Chenin.") to
  `discover-response.json`.

  The desktop Read section renders a lead, an image-led feature and a title-only
  index whose last row bottom-aligns with the lead's byline; with only three items
  the index collapsed to a single row and left the column half empty. Data-only —
  no contract change, and both new items use existing `contentType` and byline
  `tier` values.

## 7.0.0

### Major Changes

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

### Patch Changes

- Updated dependencies [6866050]
  - @edwardseshoka/contracts@4.1.0

## 6.0.1

### Patch Changes

- 0188e1c: Fix discover curation refs that pointed at non-existent content. The
  `this_week_in_wine` (editorial) and `the_room` (room activity) sections referenced
  ids that don't exist in the editorial / social fixtures, so composing the discover
  response left those sections empty. Re-point them at the real fixture ids
  (`article_why_2018_stellenbosch` · `guide_field_guide_swartland_chenin` ·
  `article_decanting_how_long`; the three seeded activities), matching the ids the
  `discover-response.json` output fixture already uses.

## 6.0.0

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

### Patch Changes

- Updated dependencies [e8c658f]
  - @edwardseshoka/contracts@4.0.0

## 5.0.0

### Major Changes

- b2cb11d: Discover moves to backend-owned composition.

  - `createDiscover()` now returns a frozen canned `DiscoverContract` snapshot instead of composing one; the `wines` argument is removed. The app-double replays this fixture so the same production mapper runs.
  - Adds per-domain sample exports (`provenanceSamples`, `editorialSamples`, `eventsSamples`, `socialSamples`, and `discoverSamples` for curation) plus the `Curation` types, so each service has its own sample source. The backend composes the real response from this exact sample data; the fixture is a snapshot of that output, kept honest by a backend contract test.
  - Removes the internal `composeDiscover`/`curation` composition — composition logic lives in the backend, only the sample data is shared.

## 4.0.0

### Major Changes

- `createDiscover()` now returns a frozen canned `DiscoverContract` snapshot instead of composing one. The `wines` argument is removed — composition moved to the backend, and the app-double replays this fixture so the same production mapper runs. A backend contract test keeps the fixture in sync with the real composed response.

## 3.0.0

### Major Changes

- 2b1f9d9: Rename `@edwardseshoka/fixtures` to `@edwardseshoka/samples` and expose contract factories instead of raw seeds.

  - The package now exports factories that return domain contracts: `createPublicWines(): WineContract[]` and `createDiscover(overrides?): DiscoverContract`. `createDiscover` composes the same `DiscoverContract` the backend serves; pass `{ wines }` to compose against real catalog data.
  - Raw seed JSON and the old `createDiscoverHomeResponseFromSeeds` / per-fixture exports are no longer part of the public surface; seed data moved from `src/seeds` to private `src/data`.

  Breaking: consumers replace `@edwardseshoka/fixtures` with `@edwardseshoka/samples` and switch from raw seeds to the factory functions.

### Patch Changes

- Updated dependencies [2b1f9d9]
  - @edwardseshoka/contracts@3.0.0

## 2.0.0

### Major Changes

- 40a6a25: Fixtures Major Bump

## 1.2.2

### Patch Changes

- 6f63c3b: Packages Restructure Change Set
- Updated dependencies [6f63c3b]
  - @edwardseshoka/contracts@2.0.0

## 1.2.1

### Patch Changes

- 9c741ff: Fix the published fixtures package dependency on contracts so consumers install the published contracts package instead of looking for a local sibling folder.

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

- Added the initial Morara shared fixtures and seed payloads package.
