---
"@edwardseshoka/contracts": minor
"@edwardseshoka/samples": minor
---

The cellar index — a way to ask for a member's own cellar.

There was no such way. `ListCollectionsResponse` is the public feed: it returns
`PublishedCollectionContract[]`, which excludes a Lens **by type**, and its lens row is
the authorship one — sommeliers, members, Kgwari. A member's own home is her shelves,
**her own rules**, what she follows and the routes she has been on, and not one of those
four could come from that endpoint. The frontend has been running on an app double with
the shapes declared locally in `cellar-data` since the design landed.

`GET /cellar/index` → `GetCellarIndexResponse`: a summary, the runs, and the doors above
them. One request, because the page is one page — three round-trips for a masthead, an
index and two doors would let them disagree on a slow connection, and the doors exist
precisely to agree with the index.

**`CellarSummaryContract`** carries the figures and nothing derivable. `bottles`,
`wines` and `estates` cannot be computed from `ListCellarResponse` once holdings page,
and computing them while they happen to fit is how a page starts lying at holding
fifty-one. `keepingSince` is a DATE — "three years deep" is composed at the render edge
against the clock, because a duration is stale on its own anniversary. `priceBand` is
the interquartile band of what she paid, never an average of four bottles, and never
across two currencies since nothing is ever converted. `figuresAvailable` is the whole
reason the suppression threshold is not a client rule: a client that counts to twenty
itself is a second copy of a number that drifts the first time it moves.

**`CellarSectionContract`** is discriminated on `kind`, because the four runs do not
hold the same row. Shelves, lenses and following are ordinary collection cards; routes
carry `ItineraryCollectionContract`, so a plan and a record keep their opposite tenses
instead of every client inferring one from whether anything has been written yet.
`count` describes the SECTION and not the page of it that arrived — the standfirst reads
"15 of your own" while the first page holds ten.

**`CellarDoorContract` is a union, not one shape with optional words.** A door onto a
member's lens carries that lens's own title and rule, denormalised so the two cannot
disagree — the door cannot look the lens up, because the lens may not be on this page.
A door onto the wines she met on routes carries only a number: its row is named the same
thing on every cellar in every locale, which makes its name chrome the client owns, and
a server sending it would be shipping an English sentence to be printed verbatim.

The `requests` arm is a door with a count and nowhere to go. There is no request-ledger
contract and this does not invent one — a ledger is a feature with statuses, replies and
quoted prices, and guessing at it here would produce a shape the real one has to break.

**Route projection reaches the index.** 11.0.0 added `CellarRouteProjectionContract` and
`CellarHoldingContract.firstMet` and gave them nowhere to live on the home page. Routes
are now a section — they are collections she authored — and the wines met on them are a
DOOR, because they are not collections and the index carries no holdings. The projection
itself stays on `ListCellarResponse`, so there is one composer for it and not two.

`CellarSummaryContract.bottles` and the routes door's count are the numbers this whole
group of shapes is most concerned with. They are 34 and 7 in every double, they count
different things, and 41 is not a fact about anything.

**`CollectionContract.rule`** — a lens states what it selects. Present if and only if
`kind === "lens"`, which is why both halves are asserted rather than typed. NOT a
sentence: `"Drinking window includes 2026"` hardcodes English word order, and 2026
through a grouping formatter reads "2 026" in French — a fault this catalogue has
shipped once already, on a wine record's vintage. So the predicate travels as a chrome
key and its operands as carriers, and the render edge composes. The key is deliberately
NOT a closed union, the same call `RegisterChoiceMetricContract` makes: nothing has
produced a member-built lens yet, and a vocabulary invented on zero instances looks
authoritative while being imaginary. A money operand is not expressible and that is
named rather than worked around — `MoneyContract` declares no source, and giving it one
is a `text/` decision.

This resolves the deferral `CollectionContract` has carried since the taxonomy landed.
It is **not** the frozen-from provenance a Shelf keeps after freezing a Lens: one
optional carrying both would make "present" mean either "this rule is running" or "this
rule once ran", which is the distinction freezing exists to draw.

**`CELLAR_INDEX_RULES`** ties the two composers together, exactly as
`ROUTE_CARD_RULES` does. Thirteen rules, each its own named export: a lens states its
rule and nothing else does, a door agrees with the row it opens, a section count
describes the section, an empty run is omitted rather than sent, a suppressed figure line
carries no band, a band is one currency, and the routes door counts wines that were never
folded into bottles. Adding a rule is a minor; declining one is not calling it.

**`RegisterSpreadContract`** — the middle half of a tasting metric, and the median inside
it, as ONE object. The frontend has been synthesising this and reading it through a cast,
and the reason it must not be two optionals is that a band alone leaves a render edge to
mark it with `value`, which is the MEAN: a quartile band under a mean mark is two
statistics on one rail, and on a skewed register the mark lands outside its own middle
half. Never synthesised — a median cannot be derived from a mean and a count.

**`WineRegisterContract.firstFiledAt`** — when the first note landed. `noteCount` alone
cannot tell a register that has been open seven years from a viral week. A date, so the
duration is the render edge's; absent only when there are no notes.

### Seeds

`@edwardseshoka/samples/cellar` — one member's cellar, and hers is Thandi Nkosi's
because she already authors `collection_two_days_in_stellenbosch`. That is what lets the
projection be derived from the same stops the itinerary's detail page renders instead of
being a second account of the same afternoon.

Every figure is computed from the holdings; the generator has no table of them to get
wrong. The fixture deliberately reaches: two holdings drunk-and-kept at `bottles: 0`,
private shelves and lenses that appear on no landing, and a met-on-routes group whose
`items` has two rows and whose `wineCount` is one — the route came back to Meerlust for
dinner and poured the same bottle. One wine she was poured is absent from the projection
entirely, because she went on to buy it.

No existing seed moved: the stage draws only from `spread`, so it re-rolls nothing
downstream.

### What may surprise a consumer

- `cellar` moves from layer 3 to layer 4 in the folder boundary map. It composes
  collections now, and a peer import is the signal that a layer is wrong rather than that
  a rule is inconvenient. Nothing below `spec` reads cellar, so no other arrow moved.
- `RegisterScaleMetricContract.StubFactory.make()` and
  `WineRegisterContract.StubFactory.make()` now return one more field each. A consumer
  asserting on the whole object with `deepEqual` will see it; one reading fields will not.
