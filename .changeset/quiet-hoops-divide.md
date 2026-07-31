---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

Group seeds by feature, and fix the one dependency that pointed the wrong way.

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
