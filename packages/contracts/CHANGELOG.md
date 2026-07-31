# @edwardseshoka/contracts

## 6.0.0

### Major Changes

- d5e853d: Close the record vocabularies, and give three localisation facts a wire shape.

  **Open key fields: 24 → 3.** The record model's vocabulary was entirely open
  strings, which meant the nineteen fields a detail page renders had no declaration
  anywhere: a typo was a missing translation at runtime, and nothing could list
  what a locale catalogue still owed. With seven launch locales and `af` already
  carrying 238 keys to `en`'s 416, an unenumerable set is one nobody can close.

  Now closed, one file per vocabulary in `catalog/vocabulary/`:

  - `RecordFieldKey` — 19 fields, split by who may answer them (reference,
    estate-private, commercial), because that is the axis the page groups by and it
    makes the claim asymmetry mechanical rather than a rule each client re-implements
  - `RecordGroupKey`, `LockedSectionKey`, `EstateSealKey`, `ColourReadingKey`,
    `RecordRoleKey`, `CollectionBadgeKey`
  - `MeasurementUnitKey` — placed in `text` beside `Measurement`, not in `catalog`,
    because `text` is layer 0 and may not import a feature. A unit is a rendering
    concern; the boundary rule and the domain agree.
  - `TastingWordKey` — **derived** from `TASTING_SCALES` rather than listed again,
    so a rung cannot be added to a metric without becoming a legal word key

  The keys derived from a closed key are closed **by construction**, as template
  literal types: `labelKey: \`record.group.${RecordGroupKey}\``type-checks`record.group.matched`and rejects`record.group.mtached`. They are still carried
  on the wire so a client need not compute them, but they can no longer disagree
  with the key they came from.

  **Three keys stay open, deliberately.** The choice metrics and disagreement
  subjects have zero instances — nothing has produced one. Closing a set on zero
  instances means inventing one, and an invented vocabulary is worse than an open
  string because it looks authoritative. Each says so in place, with a note to
  close it when the first instance lands.

  **Three fields gained a wire representation** they had never had:

  - `RegionContract.exonym` / `.nameLanguage` — whether a place is known by a
    different name in another language, and which language this row carries. A
    region's name is the one catalogue field that is genuinely translatable, and a
    client cannot tell a translation from a fallback without being told.
  - `EventContract.titleLanguage` — a tasting title is authored prose, so the
    language it was written in is part of the fact. Guessing "en" is how an
    Afrikaans title gets served as though it were a translation.
  - `ProducerContract.foundedYear` — an ordinal the estate meta line renders.

  All three existed only inside the seed generator, which is how a real
  localisation feature ends up with nowhere to live on the wire.

- d5e853d: Add `noteCount` to `MemberContract`, so members can be projected into search.

  **Breaking:** `noteCount` is required, so anything constructing a
  `MemberContract` must supply it. Records written before this field existed need
  no migration — a missing value reads as `0`, which is a true statement about a
  member who has written no notes, not a stand-in for "unknown".

  Search's `PERSON` row needs a `{ kind: "noteCount", count }` meta line, and a
  projection cannot run an aggregate over the social table while writing a row.
  The count is therefore denormalised onto the member record, matching
  `Producer.wineCount` and `Region.wineCount`, which exist for the same reason.

  Members are searchable by default — the product follows the reach model of a
  social network rather than an opt-in directory. The projected row stays thin
  (name, profile type, note count): enough to render a result and route to a
  profile, never contact details, address or coordinates.

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

- d5e853d: Rebuild the wine record around who can answer a field, and make provenance
  binary.

  **Breaking:** `ProvenanceState` is now `"community" | "claimed"`. It was
  `"community" | "listed" | "verified"`, which folded two independent axes into
  one field: whether anyone accountable has claimed the record (binary) and how
  much the community has said about it (a continuum, and not a provenance question
  at all). `"listed"` was never a third provenance — it was a distributor claim
  wearing a middle state's clothes, and it moves to `WineContract.claimedBy.kind`.
  `provenance` is now a projection of `claimedBy` and is never written
  independently of it.

  Sample wines migrate accordingly: `verified` → claimed by a producer, `listed` →
  claimed by a distributor, `community` unchanged. Anything switching on
  `"verified"` or `"listed"` must read `claimedBy.kind` instead — including the
  backend's own copy of the union in `packages/core/domain/trust.ts` and the
  `wine.provenance === "listed"` branch in the discover hero mapper.

  **The record model.** A wine's facts do not start empty. Estate, region, ward,
  vintage, varietal, alcohol, closure and format are matched from Wine of Origin,
  the back label and the SAWIS register at ingest, and are present from the first
  second a record exists. The previous model treated the record as a progress bar
  the crowd fills in, which framed a matched record as an empty one. What an
  unclaimed record lacks is not knowledge — it is a voice.

  New `WineRecordContract` (a separate fetch from the card shape, so ninety-odd
  fields never ride along in a list) groups its rows by `RecordFieldKind` — who
  _can_ answer:

  - `reference` — matched at ingest, always has a value, and the member's job is
    to **confirm or dispute** it, never to fill it in
  - `estate_private` — only the producer holds it, so it is enumerable while
    empty: the page names what it is waiting on and offers no call to action,
    because a member guessing the yield is noise entering a record whose whole
    value is that it does not guess
  - `commercial` — a distributor claim opens these and only these

  That makes the claim asymmetry mechanical rather than a rule each client
  reimplements: a producer claim answers the estate-private rows and opens the
  estate's voice; a distributor claim opens commerce and leaves the voice shut.

  Also new: `WineRegisterContract` (the community aggregate — the only layer that
  moves with note count, with thresholds expressed as absent fields rather than
  numbers clients compare against), `ClaimantAvailabilityContract` (price leaves
  Kgwari's chrome for the claimant's block, with a response record), confirm and
  dispute requests, and `cellarCount` / `saveCount` on wines plus `saveCount` and
  `languageTag` on tasting notes.

  **Text moves out of `search`.** `CanonicalText`, `ChromeText` and
  `NegotiatedText` were never a search concept — the same three-way distinction
  governs a record's ninety fields, its register of tasting words and an estate's
  essay. They now live in `@edwardseshoka/contracts/text` alongside two new
  carriers, `Measurement` and `YearRange`, and are re-exported from `search`
  unchanged so existing importers keep resolving.

  The record obeys the rule those types exist for: no field is a display string.
  Field identity travels as a chrome key, values as measurements and year ranges,
  closed vocabularies (aromas, tasting descriptors, colour readings) as chrome
  keys, and only genuinely authored prose as negotiated text with the language it
  landed on. `"14.21 %"` is a number, a unit and a decimal separator that is a
  comma for most of this catalogue's members; `"73 % put it at worth knowing or
better"` is a percentage, an enum and English word order. Both are now sent as
  data.

  **Records are generated, not authored.** `catalog/wine-records.json` now comes
  out of `generator/generate.mjs` with the rest of the seeds — one record per wine
  rather than a hand-written few, with the field-to-source mapping declared once in
  a table. Adding a reference field to the contract is one row there instead of 93
  edits, and the taxonomy holds by construction: the table cannot emit an
  estate-private row and nothing outside it can emit a reference one. Only what no
  algorithm can derive is authored, in `generator/orig-wine-records.json` — an
  estate's own essay and seals, and the most-saved member note.

  `npm run check:seeds` regenerates in memory and fails on any drift, so a
  hand-edit to a generated seed breaks the build instead of surviving to
  production. `SamplesTests/WineRecords.test.js` asserts the model's invariants
  over all 93 records, including that no value is ever a bare display string.

  Keeping the register's vocabularies as keys is also what makes them searchable:
  the index holds `aroma.fynbosSmoke` and the member sees their own language, so
  browsing by aroma works in every locale without the index carrying one
  translated word — the same mechanism that already makes verdict browsing work.
  `SearchBrowseItemContract` needs no change to support it.

- d5e853d: Group seeds by feature, and fix the one dependency that pointed the wrong way.

  **`@edwardseshoka/samples` gains per-feature subpaths** — `/catalog`,
  `/provenance`, `/editorial`, `/events`, `/social`, `/search`, `/discover` —
  mirroring the ones `contracts` already had. Previously there was a single root
  export, so importing one wine pulled every domain's fixtures in behind it and
  nothing stopped a catalog module quietly depending on a social one. The root
  export remains for the seed script and the generator, which legitimately need
  all of them at once.

  **`WineOriginSystemContract` moved from `catalog` to `provenance`.** It is a
  certification scheme that appellations are granted under, and provenance owns
  appellations — catalog's own `WineAppellationRefContract` describes itself as "a
  denormalized reference… the full record lives in provenance". So provenance
  reaching into catalog for the scheme its own appellations are defined by was an
  inversion, and the only cycle-shaped edge in the graph. It is still re-exported
  from `catalog` for callers that expect it there.

  The contract folders are now cleanly layered:

  ```
  money · text · trust · provenance     depend on nothing
  catalog · search · editorial · events · member · social
  discover                              the aggregator
  ```

  **`groupIntoCollections` added to `catalog`**, replacing composition that lived
  in the backend. It is generic over a structural minimum, so the backend's `Wine`,
  the frontend's own model and `WineContract` all satisfy it without any of them
  importing another's types. Two bugs are fixed in the move: the collection titles,
  subtitles, descriptions and badge labels were composed in English on the server,
  and now travel as a chrome key plus params; and the home-market collection
  matched a hardcoded South African region list, which is wrong once `fr-FR`, `de`,
  `it` and `es` are launch locales — it now takes a `homeMarket` country code,
  defaulting to `ZA`.

  **`VERDICTS` added to `trust`** — the best-to-worst ordering was a doc comment
  here and a runtime array in the backend, which is two declarations of one fact
  that every verdict-ranking feature depends on.

### Patch Changes

- Updated dependencies [d5e853d]
  - @edwardseshoka/foundation@3.3.0

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
