---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

feat(contracts)!: the lens, the pushed landings, and lists in the ledger

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
