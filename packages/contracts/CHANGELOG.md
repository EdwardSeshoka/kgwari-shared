# @edwardseshoka/contracts

## 9.0.0

### Major Changes

- 24ec1b0: feat(contracts)!: who may publish an evening, and lists you can actually open

  Two changes. The design sheets are unchanged from the pass that added the lens —
  I diffed both and they are byte-identical — so this is the follow-on work.

  ## Only an enthusiast cannot publish

  `canPublishEvents` in `trust`, and `EventVisibility` on the event. An enthusiast
  can create an evening, invite people, take the seats and file the recap; what
  they cannot do is put it on Discover. The restriction is on REACH, not on the
  verb, which is why a private event is a visibility rather than a second type — it
  is a complete event with a smaller room, not an unfinished public one.

  **The rule is stated as a refusal**, and that is deliberate. "Collectors and
  professionals" could be read to exclude producers, and that reading breaks a
  settled design: the editorial model is titled _What Estates Publish_ and its
  event piece embeds an evening an estate is hosting. A producer who could announce
  a dinner but not publish it would be announcing a link to nothing. So the list
  names only `enthusiast`, and a persona added later publishes by default — the
  safer failure, since a new business persona has been verified and an allowlist
  somebody forgot to update would silently take a capability from an account that
  paid for it.

  `PublishedEventContract` makes it structural. The Discover chapter and the
  calendar landing take it, so a private evening reaching an audience is a shape a
  producer cannot construct rather than a filter a server remembers. The detail
  endpoint deliberately takes the WIDER type: a private event has a page, and what
  guards it is authorization on the request. A list is a broadcast; a detail is a
  request for one thing by id, and the two need different guards.

  `SubmitEventRequest` is where the rule runs. An enthusiast asking to publish is
  REFUSED rather than quietly downgraded — a silent downgrade means somebody
  advertises an evening they believe is public and nobody comes.

  ## The lists are fetchable now

  Several surfaces could show a thing and not open it. `CollectionContract` said
  outright that "the ordered list belongs to the collection's own endpoint" and
  that endpoint did not exist — every surface could render a shelf and none could
  open one.

  - **`GetCollectionResponse`** with `CollectionItemContract`, discriminated by
    subject and carrying the domain's own contracts: a shelf's page is a page of
    WINES with their verdicts, not a page of ids and one fetch per row. This is why
    `collections` moved from layer 2 to 3 — the card points at things by id and
    embeds none of them, but the detail cannot.
  - **`GetEventResponse`**, **`GetTastingNoteResponse`** — every surface that lists
    notes or evenings now has something to open onto. A ledger row that cannot be
    tapped is a ledger of dead ends.
  - **`GetMemberResponse`** — the Profile page's own endpoint. `GET /members/me`
    answers "who am I"; this answers "who is this", for a reader who tapped a
    byline. Same contract, server-nulled where it is nobody else's business, rather
    than a second member type that would eventually disagree with the first.
  - **`GetRegionResponse`**, **`GetProducerResponse`**, **`GetAppellationResponse`**
    — the doorways have always pushed at a region or a producer, and neither had a
    room behind it.

  ## Seeds

  Roughly one evening in nine is now an enthusiast's and therefore private, so the
  corpus can catch a surface that forgot to filter — the only bug this rule has.
  Tests assert none reaches the calendar, the Discover chapter or the ledger.

  ## Backend

  `EventVisibility` and `PublishedEvent` with a single `publishedOnly` predicate,
  `canPublishEvents` in `core/domain`, and the guard carried through the composer
  and a dedicated `PublishedEventToContractMapper` — one contained cast whose input
  type is the proof, rather than three at the call sites. The compiler found the
  one place it mattered on the first build. 529/529.

## 8.0.0

### Major Changes

- 49b510b: feat(contracts)!: the lens, the pushed landings, and lists in the ledger

  The Masthead v2 and The Lens sheets moved a few things around. Most of it the
  collections work already carried — the CollectionRow's anatomy, both chapters,
  the event row's two verbs, the day rules. Three things did not fit.

  ## The lens mechanism — new, and shared

  Four landings need a chip row with per-lens counts, and nothing carried one.
  `ContributionCountContract` counts contribution KINDS for the Profile's writing
  stream; it is not a lens.

  `lenses` is a layer-1 folder because this is ONE mechanism used in several
  places — the Cellar's lenses, the Profile's chips, and all four pushed landings
  — and a second copy of "all" is a second translation of the same word. The
  vocabularies are per list, because a diary is asked WHEN and an archive is asked
  WHO; the two collection landings are asked WHO in the SAME four words, which is
  evidence they are one record with two subjects rather than a coincidence to tidy
  away. There is deliberately no region lens anywhere: geography belongs to the
  doorways, where the contents come from a query.

  **The counts are on the wire because a client cannot compute them.** Not merely
  should not — cannot: the authorship lenses have to tell the house's lists from a
  member's, and a byline gives no structural way to do it. Kgwari is
  `{ name: "Kgwari" }` with no tier, and a member byline with no `status` is the
  same shape. Bucketing on the literal string "Kgwari" is worse than not bucketing
  at all.

  Two rules are enforced by construction rather than remembered: a lens with
  nothing in it is never offered, and **a row where nothing NARROWS is sent
  empty**. The second is subtler than "no lone All" — when only the house has
  published, "All" and "Kgwari" select the same rows, and a second chip that
  changes nothing is as useless as a first one that does. The first implementation
  got this wrong by checking chip count; the test caught it, in both repos.

  ## Lists in the ledger

  `ContributionKind` gains `collection`. It had been parked twice — first for the
  taxonomy, then pending a decision about whether publishing a list is a
  contribution in the way a note is. The Latest design answers it: the ledger is
  cut to carry every kind, and a fixture exercising only notes ships its other
  branches untested.

  **One `collection` kind, not `shelf` and `itinerary`.** The design's rule is
  about the rendered MARK, and `collection.kind` supplies it. Splitting the
  discriminant would make this the only place in the union where the abstract type
  does not carry its own noun — `editorial` already works exactly this way, with
  `contentType` naming article or story — and would need a third member the day a
  Selection is published, which the ledger requires, since the house's lists sort
  by date beside everyone else's. The payload is `PublishedCollectionContract`, so
  a Lens cannot reach a dated stream at all.

  ## The chapter push

  `DiscoverSection` gains `link?: DiscoverChapterLinkContract` on the four types
  that have a landing. This was previously called navigation and left off the wire;
  the design makes it a server fact, because **a chapter that already shows
  everything it is about carries no link** — "From your cellar" is the standing
  example — and only the server knows whether a section was truncated.

  ## Endpoints

  `ListCollectionsRequest`/`Response` (one endpoint, two subjects),
  `ListEventsRequest`/`Response` for the calendar, and
  `ListEditorialRequest`/`Response` for the archive. All three carry the lens row.

  ## Seeds

  `collections.json` was hand-maintained and outside `--check`, the same gap
  editorial and the notes had; it is generated now. Five rows also could not
  exercise an authorship lens — three chips of one or two cannot tell a working
  filter from a broken one — so the corpus grew to fifteen across the three
  buckets, and the four landings ship as fixtures: `shelvesLanding`,
  `itinerariesLanding`, `calendarLanding`, `archiveLanding`.

  The Masthead's chapters carry their pushes, its ledger carries collection rows,
  and the two collection chapters are dealt APART with the article between them —
  three index-row chapters set adjacently read as one long undifferentiated list
  however carefully each is set.

  Two bugs fixed while wiring it: route stops named estates the catalogue does not
  carry, and previews that were a census of their own list rather than a handful.

  ## Backend

  A new `collections` feature (entities and mappers), the lens row in
  `core/domain` with its rules and its own tests, the two chapters and the chapter
  link on `DiscoverGroup`, and the ledger's collection branch. Compiles against
  7.0 and passes 507/507.

  `composeDiscover` still emits the v1 funnel. The types, the mappers and the hero
  branch are ready, so that stays a composition problem rather than a plumbing one.

### Minor Changes

- 49b510b: feat(collections): one record, four nouns — shelves and itineraries on Discover

  Discover has shipped a doorway targeting `collection_cape_bordeaux` since before
  collections existed, and nothing resolved it — no contract, no store, no
  endpoint. The `collections` folder is the room behind that door, built to the
  collection taxonomy rather than to the ledger's guess at it.

  ## The taxonomy, as contracts

  Two axes make the type. **Membership** — did someone enumerate the contents, or
  does a rule decide them. **Author** — the member, or editorial. Four types come
  out and only four:

  |             | Enumerated                | Derived                                               |
  | ----------- | ------------------------- | ----------------------------------------------------- |
  | Member-made | **Shelf** · **Itinerary** | **Lens**                                              |
  | Editorial   | **Selection**             | _(the catalogue by facet — browse, not a collection)_ |

  "Collection" is the abstract base — `membership · author · subject · visibility`
  — and it **stays in the code and leaves the interface**. The member never holds
  the word; they hold four concrete nouns, and `shelf` is the one that translates
  from real life.

  `kind` is on the wire even though it is a function of the axes, for the reason
  `SearchFacet` states in this same package: capability is the reader's question,
  and deriving it from two other fields is a table every client would have to own.
  `membership` is therefore NOT sent — two fields that must agree are two fields
  that eventually will not.

  ## Subject is a field, not a type

  `subject: "wines" | "estates"`. That is the whole economy of it — "a collection
  of estates" needs no new concept, only a better noun, because _shelf of estates_
  is nonsense. Regions and vintages are absent on purpose: a region is a facet, so
  "Swartland + Piekenierskloof" is a RULE over wines and lands in `lens`, correctly
  losing ordering and publishing on the way.

  **There is no mixed subject, and the preview strip is where that is enforced.**
  `CollectionPreviewItemContract` carries an id, a caption and maybe an image, and
  **no kind of its own** — the collection's `subject` says what its contents are.
  A mixed collection is therefore inexpressible rather than merely discouraged.
  Wines and stories and evenings together is the SAVE mechanism: different verb,
  different object, and letting a shelf hold a story collapses the two one-way.

  The subject also does display work — it decides what a cover is made of
  (overlapping labels, or monogram plates for estates) and what the sub-line
  counts. Which is why there is no separate `wineCount`: a collection has exactly
  one subject and cannot be part one thing and part another.

  ## A lens can never be published, and the type says so

  `PublishedCollectionContract` is `CollectionContract` with `lens` excluded, and
  both Discover bands carry it. **A published thing's contents are only ever
  changed by a person** — a published lens would keep changing after publication
  without its author touching it, so a stranger following it and the member whose
  name is on it would both be looking at something neither has seen.

  The way there is to FREEZE the lens: the rule runs once, the result is
  enumerated, and the rule is discarded (a wines lens yields a Shelf, an estates
  lens an Itinerary). One-directional, with the rule surviving only as inert
  provenance — keep it attached and somebody asks for "refresh from rule", which
  rebuilds a live rule inside a shelf and is exactly the cycle the invariant
  forbids.

  So "no lens in a feed" is not a policy a server remembers to apply. It is a shape
  a producer cannot construct.

  ## Two Discover bands, cut by subject

  `DiscoverSection` gains `shelves` and `itineraries`, both carrying
  `PublishedCollectionContract[]`. A section type on this screen selects a
  TREATMENT, and the treatment follows the subject — so a Shelf and a Selection
  share the `shelves` band (same subject, same cover, same sub-line; what tells
  them apart is the byline) while estates get their own.

  This does not undo the trust model's merge of regions and collections into "Find
  your way in". That merged the ENTRANCES: a doorway's contents come from a query,
  and a region has its wines whether or not anybody arranged them. These were
  enumerated by a person and are derivable from nothing — which is why the card
  shows what is inside where a doorway shows a photo and a promise.

  ## Also

  - **`visibility` is not on the wire.** A card that reaches a reader has already
    passed the gate. A member's own index needs private rows and therefore needs a
    member-scoped contract, exactly as `CellarTonightRowContract` is member-scoped
    — it does not need this one loosened.
  - **No `items`.** The card carries a strip; the ordered list belongs to the
    collection's own endpoint, which does not exist yet.
  - **No frozen-from provenance.** Real, and owed — but it belongs to the cellar's
    sheet where a member reads it, and inventing its shape from the card's side
    would repeat the mistake this taxonomy just corrected.
  - **`SavableKind` gained `collection` and `producer`.** Following a collection IS
    saving it — no separate follow model, because a list you follow stays live the
    way a saved live unit does. `producer` is what the "Estates you follow" lens is
    derived from.
  - **`ContributionKind` still has no `collection`**, and the doc comment now says
    why the reason changed: the taxonomy has landed, so what remains open is a
    LEDGER question — whether publishing a list is a contribution the way a note or
    a story is. That is a decision, not a hunch, and adding the kind on a hunch is
    a major to remove.

  ## Tests

  `Collections/CollectionCard` asserts what a type cannot — mostly absences. That
  no published double carries `visibility` or `items`; that a preview entry carries
  no kind, so mixing is unwritable; that no card carries a second count; that an
  itinerary supplies no artwork (an estate has no label, and a fixture that handed
  it one would ship the monogram path untested); that a lens is unfollowable; and
  that editorial's byline is a name with no mark.

  ## Samples — BREAKING

  **The curation gained two sections**, `collection_shelves` and
  `collection_itineraries`, referencing the collections pool rather than inlining
  their content the way doorways do: a doorway has no life outside the plan, a
  collection has an author who edits it, and an inlined copy would still say nine
  bottles the day a tenth arrived. **A backend reading this curation must learn
  both section types before it can parse the document at all** — that is the major.

  Five collections seed them — two Shelves, one Selection, two Itineraries, and no
  Lens, because a lens is nobody's to render. The collector-authored
  `collection_cape_bordeaux` is the instructive one: it exists so the curation's
  long-dangling doorway finally resolves, and it is deliberately in **neither**
  band. The house pointing a doorway at one specific list is editorial judgement; a
  band filling itself is reach, and only the second is a tiered capability.

  `SamplesTests/Collections` resolves every strip entry against the pool its
  SUBJECT names — which is what catches a miscast collection, the failure the
  taxonomy was written to prevent.

## 7.0.0

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

## 6.2.0

### Minor Changes

- e9d21b4: Refine and extend the contract test doubles.

  Adds a shared `defineStub` helper under `test-doubles/` and builds the existing stub factories on top of it, so every stub takes the same `Overrides<T>` shape (overrides that may explicitly remove a field under `exactOptionalPropertyTypes`).

  Adds stub factories and new `test-doubles` export subpaths for the domains that were missing them:

  - `./money/test-doubles` — `MoneyContract`, `TransactedMoneyContract`
  - `./trust/test-doubles` — `TrustBylineContract`, `WineClaimContract`
  - `./provenance/test-doubles` — `RegionContract`, `AppellationContract`, `ProducerContract`
  - `./social/test-doubles` — `ActivityContract`, `TastingNoteContract`
  - `./editorial/test-doubles` — `EditorialContract`
  - `./events/test-doubles` — `EventContract`
  - `./discover/test-doubles` — `DiscoverContract`, `DiscoverDoorwayContract`, `DiscoverWineHeroContract`
  - `./text/test-doubles` — `LocalizedText`

  Existing stub call signatures are unchanged.

## 6.1.0

### Minor Changes

- 53b7935: feature(contracts): ship the two missing test doubles

  Every contract a consumer holds should have a double shipped from the same
  package as the contract, so a field that moves breaks the consumer at compile
  time. Two did not, and both gaps had already cost something.

  **`@edwardseshoka/contracts/member/test-doubles` — new export.** The source
  directory existed and was empty; nothing has ever been published from it, so
  every consumer wrote its own member fixture. The frontend's copy is what
  `MemberContract.noteCount` becoming required in 6.0.0 landed on: nothing pointed
  at the hand-written stub, so the gap surfaced only when that repo upgraded — two
  majors and several weeks later. `MemberContract.StubFactory` now offers `make()`
  (an onboarded enthusiast, every nullable field explicitly `null` because `null`
  is what the wire carries), `makeEstate()` (a verified business account with its
  business fields populated together — a persona without a `businessName` is a
  state onboarding does not produce) and `makeOnboarding()` (signed up, nothing
  filled in, `noteCount: 0` rather than absent, since a member who has written
  nothing has written nothing).

  **`SearchBrowseGroupContract.StubFactory` — added to the existing
  `search/test-doubles`.** `SearchResultContract` shipped a double when search rows
  became localisable; its browse-group companion did not. The consequence was
  visible in the frontend, which carried a hand-written one still declaring `id`
  plus `labelKey` and a pre-formatted `count: "312"` long after the contract had
  collapsed the first two into one closed `key` and made the third a number.

  The three factories are chosen to cover the three text sources a way-in label can
  have, because that is the distinction the shape exists to carry: `make()` is the
  region group (canonical proper nouns), `makeVerdict()` is chrome — and is the
  case that proves `query` cannot default to the label, since the member reads
  "Inoubliable" while the index holds `Unforgettable` — and `makeCountry()` is
  negotiated, an exonym carrying the language it actually came back in.

  Purely additive: no existing type or export changes.

- 53b7935: Add the cellar contract — the shape a member's holdings travel in.

  There was none, so the backend was declaring `CellarHoldingContract` locally
  while splitting the catalogue from the cellar: the one place still reaching its
  own conclusion about what a client reads, which is exactly what the search
  projections were just moved here to stop.

  **Its own module, not part of `catalog`.** A catalogue is one shared set of wines;
  a cellar is one member's holdings. They were the same backend interface until
  recently — seven methods told apart only by the adjective "public" — and the
  adjective was load-bearing because two concepts shared one seam. Putting the
  cellar inside `catalog` would re-merge in the contract what the split separated.

  New at `@edwardseshoka/contracts/cellar`:

  - `CellarEntryContract` — a **reference plus the member's own facts**
    (`wineId`, `bottles`, `paidPrice`, `acquiredAt`, `note`), never a copy of the
    wine. A cellar row used to duplicate the whole wine, so every catalogue
    correction left a stale copy behind in each cellar holding it.
  - `CellarHoldingContract` — the entry plus the resolved wine, nested rather than
    flattened so `entry.bottles` and `wine.name` say whose fact each one is at the
    point of use. `wine` is nullable: a holding outlives its catalogue entry, and
    dropping it would delete a member's record because somebody edited a catalogue.
  - `ListCellarResponse`, `GetCellarEntryResponse`, `AddCellarEntryRequest`,
    `AddCellarEntryResponse`.

  `paidPrice` is the first consumer of `TransactedMoneyContract`, which was written
  for exactly this and had none. A paid price is the member's immutable historical
  record, so it must not share a field with the distributor's current listing.

  `acquiredAt` is deliberately separate from `paidPrice.asOf` rather than a
  duplicate of it: wine bought en primeur is paid for on release and delivered two
  or three vintages later, so one date cannot state both. A gift has an
  `acquiredAt` and no price, which is the other reason the date does not simply
  ride along on the money.

  Test doubles at `@edwardseshoka/contracts/cellar/test-doubles`, with the variants
  that carry the _why_ — `makeEnPrimeur()` (the two dates genuinely differ),
  `makeGifted()` (no price), `makeDrunk()` (zero bottles is a holding, not an
  absent one) and `makeDelisted()` (the wine is gone, the bottles are not).

  `AddWineRequest` / `AddWineResponse` are deprecated. `POST /wines` meant "put a
  wine in my cellar", which is why it accepted `name`, `estate`, `region` and
  `imageUrl` — a member filing their own idea of what a wine is. That is
  `AddCellarEntryRequest` against `POST /cellar` now, and it takes a `wineId`.

- 53b7935: Correct the member contract's routes, and give `PATCH /members/me` a request type.

  The docblocks described `/user/profile` while the backend and frontend both use
  `/members/me`. Reported as "one of the two is wrong"; neither was. The member
  resource moved to `/members/me`, and `GET /user/profile` survives as a deprecated
  **read-only alias** so already-shipped clients keep working. The contract was
  simply documenting the retired address.

  The write side was worse than stale. `SaveMemberProfileRequest` documented
  `POST /user/profile`, a route that no longer exists in any form: it took a whole
  profile, so it could only express "replace everything", and a client that omitted
  a field silently reset it — a member editing their taste note lost their address.

  New:

  - `PatchMemberProfileRequest` — the body `PATCH /members/me` accepts. Derived as
    `Partial<Omit<MemberContract, "userId" | "createdAt" | "noteCount" |
"profileType">>` rather than restated, so a field added to the profile is
    patchable without anyone remembering, and a removed one cannot linger. Verified
    key-for-key against the backend's zod schema: 16 fields, exact match. `null`
    clears a value and omission leaves it alone — a distinction a full-body PUT
    cannot express.
  - `PatchMemberProfileResponse` — the updated `MemberContract`. The whole member
    comes back rather than `{ success: true }`, because server-owned fields
    (`noteCount`, a system-assigned `profileType`) can change as a side effect and
    an acknowledgement leaves the client holding a stale copy it believes is
    current.

  `SaveMemberProfileRequest` and `SaveMemberProfileResponse` are deprecated, and
  `GetMemberProfileResponse` now names `/members/me` with the alias explained.

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
