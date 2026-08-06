---
"@edwardseshoka/contracts": minor
"@edwardseshoka/samples": minor
---

Four shapes the itinerary design needed, and one number that stops a chip reading as a bug.

Drawing the route on all five surfaces turned up four things the contracts could not
express. Every addition here is optional, so nothing already released breaks — and the
one field that DID change shape (`ItineraryStopEventRefContract.title`, bare string to
`NegotiatedText`) was introduced by the itinerary-as-stops major in this same unreleased
run, so no published version ever carried the bare form. The pair ships as one major.

**`ItineraryStopContract.date`, an ISO calendar DAY.** A day and not an instant: two
stops at one estate on one day are told apart by their position in the route, not by
the clock, so sub-day precision buys nothing and costs the whole timezone question
`EventContract.timezone` exists to answer. A member says "the eighteenth", not 09:40
SAST.

It exists because the cellar credits where a bottle was first met, and a wine met on
two routes has two meetings. Without a day, *first* resolves to whichever route was
WRITTEN UP first — so a route documented months late steals credit from the afternoon
that earned it. Optional, because a draft is a list of places before it is a set of
dates; a consumer needing a day and having none falls back to the itinerary's
`createdAt`, and nothing may infer one from a stop's position.

**`ListPlaceProgrammeRequest` / `Response` — what is on at a place.** Add an estate to
a draft and the stop offers the evenings on there, so planning the day and booking it
are one pass. A LOOKUP and never a field: a stop that carried its place's programme
would hold a cache of somebody else's calendar, stale the moment a host moves an
evening and duplicated across every draft naming the same estate. So a stop stores
nothing until one is taken, and then stores the one that was — which is what keeps a
stop referential.

**Forward only, structurally.** There is no `until`, no `before`, and no window — the
only bound a caller may state is where to start, clamped to today. A documented route
names evenings that are over, and a Book button on a past evening is the one thing this
feature must not be able to produce; a symmetrical query would let a client fetch a
documented route's dates and render exactly that. The check a server would otherwise
have to remember is a parameter that does not exist. Response rows are
`ItineraryStopEventRefContract` — the identical shape a stop's `event` takes — so
taking one is a copy rather than a transform.

**`ListCollectionsRequest.mode`.** The itineraries landing reads as two runs, been and
going, and they are two REQUESTS rather than two sections of one response: each run
scrolls on its own, so each needs its own cursor and one response cannot carry two. It
also repairs `lenses` — those chips count what the response holds, so a single response
split by the client would show "Sommeliers · 3" above two runs it is true of neither.
Absent means every route, and always absent for `subject: "wines"`, because a shelf has
no tense.

**`ContributionCountContract.nestedCount`.** A member who wrote nine notes on the tram
and twelve on their own has written twenty-one and will see a chip reading twelve. Both
facts are right — the day is one act, so it is one row — but a bare `12` is
indistinguishable from four notes having gone missing, and that is a support ticket in
the first week. So `count` is rows and `nestedCount` is what exists behind another row,
and a client is expected to SAY something with it rather than print it: "12 · 4 on
routes". A client that renders `count + nestedCount` has undone the rule and put the
tram back in the ledger nine times. Absent, not zero, for every kind except `note` —
nothing else has a container to hide inside.

**The cellar's route projection.** `ListCellarResponse.metOnRoutes` carries a
`CellarRouteProjectionContract`: everything a member tasted on a route, grouped by
route, appearing automatically with nothing to add or confirm. Derived on read, so
there is no second copy of an afternoon to fall out of step.

This is the dangerous idea in the redesign, and it is dangerous in one specific way —
the cellar is the surface that tells a member what they OWN. So the shapes enforce the
line rather than documenting it. Nothing in the projection carries `bottles` (not zero
— absent), nor `paidPrice`, `acquiredAt` or a private note; `wineCount` counts wines
against the cellar's bottles and the two must never be summed; and `items` sits beside
the holdings as a sibling field precisely so a client cannot total one array. If a
member later buys one it is an ordinary `AddCellarEntryRequest` — the route did not put
it there, they did.

`CellarHoldingContract.firstMet` is the other half: provenance beside possession, never
instead of it, derived from the member's own routes so it corrects when a stop is fixed.
`stopOrdinal` is sent rather than counted from the array, because a silent stop pours
nothing — on the tram the wines run 1, 4, 5, and a consumer numbering rows itself sends
a member to the wrong estate.

**Localisation, applied where it was missed.** Two of the new fields shipped as bare
strings and should not have. `ItineraryStopEventRefContract.title` is now
`NegotiatedText` — a tasting title is curated prose, so the language tag rides WITH
the text rather than beside it in a second field, and the legacy `title` +
`titleLanguage` pair that `EventContract` still carries is deliberately not inherited.
`CellarMetWineContract.placeName` is now `CanonicalText`: an estate name is a proper
noun, identical in every locale, and must never be stemmed by the index. The bare
`itineraryTitle` strings stay bare and now say why — the server did not translate
those, it copied them from a card.

`defineStub` caught every one of the ten stub literals that had assumed a bare string,
which is the whole reason the base is a typed parameter.

**Seeds for the routes.** `GetCollectionResponse` had no fixture at all, so every
surface could show a route and none could open one. A new `buildRoutes` stage owns the
stops and runs before `applyNoteCounts`, which matters: the notes written on a route are
real notes, so they join the corpus and count toward their wines' `noteCount` and
registers exactly as standalone notes do. `buildMasthead` filters them out of Latest on
`origin` — one filter, at the top, rather than a rule remembered at each call site.

`collections/collection-details.json` is emitted per collection id, with the `stops` arm
for routes and the `wines` arm for shelves; `estates` stays absent because it is
reachable only from a Lens, which is nobody's to render. `createCollectionDetail` and
`createRouteDetails` are the typed accessors, and the first throws on an unknown id
rather than returning `undefined` — a missing fixture is a bug in the fixture, and
handing back nothing surfaces it as a blank page three layers from the cause.

The cards no longer restate their own arithmetic. `itemCount` is the number of stops and
`contents` counts what is nested inside them, both derived from the stops the detail
holds — including on the curated rows, whose hand-written numbers were the drift this
was built to end. Two assertions had to change as a result, and both were mine: a strip
capped at three entries showed all three stops of a short route, breaching the
handful-never-a-census rule; and "fewer wines than stops reads as a miscount" turned out
to be false, because a route with a lunch and a tram legitimately pours nothing at two
of its five stops.

Stubs ship with all of it: `makeUndated` on the stop, the whole
`PlaceProgrammeContract` factory (including `makeNothingOn`, the answer most estates
give most weekends), `CellarRouteProjectionContract` with skipped ordinals, a delisted
wine and an undated route, `CellarFirstMetContract.makeLaterMeeting` for the
met-twice case, and `ContributionCountContract.makeChipRow` because the chip bug is a
relationship between chips and cannot be seen one chip at a time.
