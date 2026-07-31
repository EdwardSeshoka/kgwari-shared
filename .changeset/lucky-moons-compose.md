---
"@edwardseshoka/foundation": minor
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

Add a `Composition` contract, and rename the seed service to a factory.

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
