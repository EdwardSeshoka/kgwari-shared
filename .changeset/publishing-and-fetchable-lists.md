---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

feat(contracts)!: who may publish an evening, and lists you can actually open

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
settled design: the editorial model is titled *What Estates Publish* and its
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
