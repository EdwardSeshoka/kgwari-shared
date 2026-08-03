---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

feat(contracts)!: the five settled surfaces, in one revision

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
