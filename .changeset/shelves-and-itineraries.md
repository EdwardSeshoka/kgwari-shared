---
"@edwardseshoka/contracts": minor
"@edwardseshoka/samples": major
---

feat(collections): one record, four nouns — shelves and itineraries on Discover

Discover has shipped a doorway targeting `collection_cape_bordeaux` since before
collections existed, and nothing resolved it — no contract, no store, no
endpoint. The `collections` folder is the room behind that door, built to the
collection taxonomy rather than to the ledger's guess at it.

## The taxonomy, as contracts

Two axes make the type. **Membership** — did someone enumerate the contents, or
does a rule decide them. **Author** — the member, or editorial. Four types come
out and only four:

|              | Enumerated            | Derived |
|--------------|-----------------------|---------|
| Member-made  | **Shelf** · **Itinerary** | **Lens** |
| Editorial    | **Selection**         | *(the catalogue by facet — browse, not a collection)* |

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
of estates" needs no new concept, only a better noun, because *shelf of estates*
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
