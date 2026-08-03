# @edwardseshoka/fixtures

## 11.0.0

### Major Changes

- b704475: feat(contracts)!: the five settled surfaces, in one revision

  One coordinated pass over the Masthead, the Note, the Profile, the Editorial
  detail and the Record Model, so the vocabulary they share — contributions,
  saves, verdicts, readings — is defined once and every breaking change rides a
  single major instead of arriving five times.

  ## BREAKING

  **The verdict register is four rungs.** `"Not One I'd Revisit"` is gone from
  `VerdictWord` and `VERDICTS`. It was retired in the register design for an
  editorial reason rather than a technical one: every other rung says what a wine
  IS worth, while the fifth said only what a member would not do again — a fact
  about an evening, not about a bottle, and a bottom for a worded scale to sort
  toward. A wine somebody did not care for is a wine with a note and no verdict,
  which `TastingNoteContract.verdict` has always allowed. Consumers holding the
  retired word must map it to **no verdict**, never to the new bottom rung: "An
  Interesting Discovery" is a compliment. Exhaustive matches and any backend
  ranking that re-derived the order are the consumers.

  `SearchResultContract.StubFactory.makeWithUnrenderableVerdict` survives and
  matters more than before — an index is not a type, so rows projected before the
  removal keep the old word until they are reprojected.

  **`EditorialContentType` gained six members** — event · trial · occasion ·
  season · cause · offer, alongside the existing four. A `switch` over the old set
  now misses six, which is the intended failure: rendering an `offer` as an
  `article` drops the price table silently.

  **The closed vocabularies moved out of `catalog`** to a top-level `vocabulary`
  folder (layer 1), with `@edwardseshoka/contracts/catalog` re-exporting every one
  of them — so importers are unaffected. `CATALOG_CHROME_KEYS` is renamed
  `VOCABULARY_CHROME_KEYS`, with the old name kept as a deprecated alias. The move
  is what makes the rest possible: aroma, scale and colour keys are answered on a
  member's NOTE and aggregated into a wine's register, and living inside `catalog`
  they were unreachable from `social` without one feature importing a peer. A
  vocabulary only the aggregate could name was a vocabulary nobody could write to.

  **`EventContract.venueName` and `.location` are deprecated** in favour of a
  structured `venue`, and equal `venue.name.text` / `venue.city.text` as aliases.

  ## Added

  **`ContributionContract`** (new `contributions` folder) — the discriminated
  `note | editorial | tasting` union behind two surfaces that needed the same
  interleave and had no way to express it: Discover's Latest ledger and the
  Profile's Writing stream, which is the same corpus with a `memberId` on it.
  `ActivityContract` could not carry it — its `wine` is required and its
  `RoomActivityType` is a vocabulary about what a member did with a bottle, not
  about what they added. There is deliberately **no `collection` kind**: member
  collections belong to the cellar's taxonomy along with itineraries and lenses,
  and that pass has not landed. The ledger ships without them.

  **Save, as one verb** — `saveCount?` on `ActivityContract`, `EventContract` and
  `EditorialContract` (joining `TastingNoteContract`, `WineContract` and the
  record), plus a generic `SaveRequest`/`SaveResponse`. Counts belong beside each
  unit; the mutation is generic because four endpoints for one verb is four places
  to implement idempotence differently. Reserving a seat is NOT a save: it hands
  off to the host at their own address via `EventBookingContract`, because Kgwari
  never takes the booking.

  **The note's structured readings** — `NoteReadingsContract` on
  `TastingNoteContract` and on the new `SubmitTastingNoteRequest`, keyed by exactly
  the vocabularies the register serves. The register could report scale means,
  aroma mentions and colour readings and nothing carried them per note: an
  aggregate with no wire shape for its own input, which is a system that can only
  be seeded. With it come the vocabulary additions the capture design needed —
  `sweetness`, `noseIntensity` and `colourDepth` scales; `RIM_READINGS` split red
  and white; a pour vocabulary (sighted/blind, decant, glass, temperature as a
  `Measurement`); and `BOTTLE_CONDITIONS` carrying the invariant that **a fault
  never counts against the wine's record** — faulted notes are excluded from every
  register aggregation as server policy, with `FAULT_CONDITIONS` derived by
  exclusion so a fault added later is disqualifying by default.

  The write contract REQUIRES `verdict` where the read contract does not: a reader
  must handle a verdict-less note, a writer must not create one. It also accepts
  `paidPrice`, which never lands on the note — the server splits the submission and
  routes it to the member's cellar entry, because price privacy here is structural
  (two domains that cannot see each other) rather than a flag one bug from being
  public.

  **The editorial detail contract** — `EditorialDetailContract` with per-claim
  sources (`firsthand | panel | reported`, no counts ever), an `unanswered` column
  whose `answer` is never null (`declined`, `no_reply` and `not_sought` are three
  different facts), per-market offers with an absence reason and no currency
  conversion, pairings with a byline, and `EDITORIAL_PIECE_RULES` publishing which
  blocks each type may legally carry — a cause piece with a commercial block is a
  validation error, not a field a client hides.

  An event piece **embeds the events-domain `EventContract`** rather than restating
  its clock and capacity: one dinner, two surfaces. `EventContract` gained the v2
  fields to make that true — `endDateTime`, IANA `timezone` (the venue's, never the
  reader's), structured `venue` with its room, `languages`, `admission`,
  `capacity`/`taken` as integers, `panel`, a mostly-derived `lifecycle` (with
  `announced` and `cancelled` recorded, because no clock implies them), `recap`
  with its own byline and `filedAt`, `booking`, and `notesFiled` read at render.

  **The editorial reverse index, both ends** — `EditorialClaimContract.answers[]`
  (wine + record field key) and `RecordFieldContract.answeredBy`, so a record row
  cites the writing that established it instead of showing a bare Estate tag.

  **Discover's tonight payloads** — a `note` hero variant ("From the room", so the
  front page opens in a member's own words), `CellarTonightRowContract` (the
  member-scoped, windowed join nothing could make: `noteCount` is lifetime and no
  other section is member-scoped), and `TonightStatsContract` — four counts and a
  window, no percentages and no composed sentences.

  **`MediaRefContract`** (new `media` folder) — a url with alt text as
  `NegotiatedText`, because alt text is prose written by a person in a language and
  a bare string leaves an accessibility requirement with nowhere to live. Carries
  `MemberContract.avatar` and the note's `photo`. Existing `imageUrl` fields are
  not migrated.

  **On `MemberContract`** — `avatar`, plus `storyCount` and `tastingsAttendedCount`
  beside `noteCount`, for the reason already stated there: a profile heading and a
  filter chip cannot run an aggregate while projecting a member row, and notes
  outnumber stories seventy to one, so one total would be a number about notes
  wearing a label about writing. All three are excluded from
  `PatchMemberProfileRequest`.

  **Endpoints given shapes** — `ListContributionsRequest`/`Response` (both
  consumers), `ListWineNotesResponse` for the detail page's room column,
  `SuggestRecordFieldCorrectionRequest`/`Response` (the third verb, which goes to
  the claimant rather than onto the record), and `GetEditorialDetailResponse`.

  **A temperature unit.** `MEASUREMENT_UNITS` gained `unit.celsius` and
  `unit.fahrenheit` — the pour block records a serving temperature and there was no
  unit to denominate it in. Both scales rather than one canonical unit, because
  18 °C and 64 °F are the same temperature but not the same fact: one is what the
  member typed and the other is a rounding of it.

  ## Test doubles

  Every contract added here ships a double, and the ones whose contracts grew were
  extended rather than left describing the old shape:

  - **New** — `MediaRefContract` (described, undescribed, no dimensions),
    `ContributionContract` (all three variants, each `defineStub`'d against its own
    narrowed union member so `kind` and payload cannot be mismatched),
    `NoteReadingsContract` (full, sparse, faulted, blind),
    `EditorialDetailContract` (article with claims, event, cause, offer),
    `DiscoverNoteHeroContract`, `CellarTonightRowContract`, `TonightStatsContract`.
  - **Extended** — `EventContract` gained `makeAnnounced` / `makeCancelled` /
    `makeWithRecap` for the v2 fields; `TastingNoteContract` gained
    `makeWithReadings` / `makePrivate`; `MemberContract` gained `makeWriter` and now
    states `avatar: null` explicitly, like every other nullable on that stub.
  - `SearchResultContract.makeWithUnrenderableVerdict` now casts, since the word it
    models is no longer in the union — which is the point of it.

  **The Record Model gets doubles at last.** `catalog` shipped 2 for ~20 contracts
  — the deep document behind every wine detail page had no published fixture, so
  each consumer wrote its own, which is the condition that cost two majors when
  `MemberContract.noteCount` became required. It now ships 22 doubles and 76
  factories, organised around the states that actually differ rather than around
  the types: `WineRecordContract` (community · producer-claimed ·
  distributor-claimed · unwritten-about · read-for-a-member · anonymous),
  `WineRegisterContract` (dense · thin · empty · with-disagreement),
  `RecordFieldContract` (reference · pending · estate-answered · commercial ·
  editorially-cited · disputed · unverified import), plus
  `ClaimantAvailabilityContract`, `EstateVoiceContract`, `FeaturedNoteContract`,
  `LockedSectionContract`, the register metrics, and `MarketPriceContract` /
  `PaidPriceBandContract` for the market-price contracts that landed alongside.

  `RegisterChoiceMetricContract` gets one too, despite nothing producing a choice
  metric yet — a consumer switching on `shape` has two branches and only one had
  ever been exercised.

  ## Tests

  Contracts went from 53 to 103. New suites cover the parts of this change that are
  rules rather than shapes, plus three exported derivations that had no test at all:

  - `Catalog/RecordModel` — the model's own invariants, asserted for the first time
    rather than only stated in doc comments: that only a producer claim opens the
    estate's voice; that a distributor-claimed record keeps the section LOCKED with
    a different body (the single easiest thing to get wrong); that an unanswered
    row is still a named row; that verification is offered on reference rows and
    nothing else; that a disputed value stays on screen; that thresholds reach the
    client as absence and never as numbers; that a verdict distribution now has
    four entries; and that market bands are per currency, published whole, never
    converted, and never carry extremes.

  - `Trust/Verdicts` — the four rungs, their order, the retired word's absence, and
    that `indexOf` answers -1 for it rather than a rank a consumer might sort on.
  - `Editorial/PieceRules` — every content type ruled, every block a boolean, and
    the cause piece that may carry nothing commercial.
  - `Vocabulary/RecordKeys` — `recordGroupLabelKey`, `recordGroupNoteKey` and the
    locked-section builders, including that a distributor claim yields a DIFFERENT
    body key from a community record.
  - `TestDoubles/DefineStub` — including that an override may REMOVE a field, which
    is the behaviour the helper exists for.
  - `TestDoubles/PublishedStubs` — sweeps every barrel generically, so a double
    added later is covered without anybody remembering to. It calls all 60-odd
    factories, not just `make()`.
  - `Catalog/WineCollectionsComposition` — the note-count tiebreak (ties are now the
    norm at four rungs) and the dedupe, neither of which had coverage.
  - `Catalog/Vocabulary` — the rim split, and that every condition except a clean
    bottle derives as a fault.

  ## Housekeeping

  Each contract now lives in its own file with the barrel re-exporting, so
  `editorial/detail.ts` and `events/event.ts` are one model each rather than ten.
  `packages/samples/test/discover.test.js` moved to `SamplesTests/Discover.test.js`
  — the one test file whose name did not start with a capital.

  ## Samples

  Seeds regenerated against the four-rung register. `records.mjs` had restated the
  verdict order as a literal beside its own `VERDICTS` import — two declarations of
  one ordinal scale, and the copy went stale the moment the rung was retired. It
  now derives the order and the bucket count from `VERDICTS`.

### Patch Changes

- Updated dependencies [b704475]
  - @edwardseshoka/contracts@7.0.0

## 10.0.0

### Major Changes

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
- Updated dependencies [d5e853d]
- Updated dependencies [d5e853d]
- Updated dependencies [d5e853d]
- Updated dependencies [d5e853d]
  - @edwardseshoka/contracts@6.0.0

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
