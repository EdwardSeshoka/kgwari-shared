---
"@edwardseshoka/contracts": minor
---

A way to open one of a member's own lenses — `ResolveLensRequest`.

The cellar index lists a member's lenses and gives every one an id, and
`CellarDoorTargetContract` has a `collection` arm that can point at one. Nothing
could resolve one. `GetCollectionResponse.item` is a
`PublishedCollectionContract`, which is `CollectionContract & { kind:
Exclude<CollectionKind, "lens"> }` — a lens is excluded **by type**, because a
lens is derived and cannot be published: its contents are whatever its rule
returns right now.

So every lens row and every lens door on the new cellar home was a pressable
target with no endpoint behind it.

**Its own request rather than widening the public one.** Relaxing
`GetCollectionResponse.item` to plain `CollectionContract` was the smaller diff
and the worse contract: it would make every consumer of the public collection
endpoint — feeds, share cards, crawlers — newly capable of receiving somebody's
private rule, with only server discipline standing between them and it. The type
is what stands there today, and it keeps standing. This is the same split the
cellar index already makes, one level down: a member's own record is asked for
through her own endpoint.

**Ownership is not expressible in the request, deliberately.** Whose lens it is
comes from the session. There is no `memberId` field, for the same reason
`GetCellarIndexResponse` takes no input at all — a parameter naming the owner is
a parameter that can name somebody else. A lens that does not exist and a lens
belonging to another member are the same answer, `lens: null`: an id nobody can
tell apart is an id nobody can probe with.

**`count` is the whole match set, not `items.length`.** The same rule as
`CellarSectionContract.count`, and it bites harder here, because this number has
to agree with the one the lens's own row showed one click earlier on the cellar
home. The stub's base page is three items against a count of 31 so a consumer
that renders the array length fails rather than passing on a fixture that
happened to fit one page.

**Stops are excluded from `items` by type.** A stop is an occasion on a route
and belongs to that route; a rule returning one would answer a question about a
journey with a row from somebody's itinerary. What is left is the two subjects a
lens is actually written over — wines, and the producers a member follows, which
is the case `CollectionItemContract`'s estate arm already names as "a Lens over
producers … only ever opened by its owner".

`ResolveLensResponse.StubFactory` ships four doubles: the default paged lens,
`makeOverEstates`, `makeMatchingNothing` (a real lens whose rule matches nothing
— not the same as absence, which is why `lens` is sent separately from `items`),
and `makeAbsent`.
