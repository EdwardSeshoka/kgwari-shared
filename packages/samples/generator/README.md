# Seed generator

Regenerates every seed under `src/features/` from one curated source.

```bash
npm run generate:seeds --workspace @edwardseshoka/samples
```

**Why this exists.** The search corpus references `entityId`s owned by four other
domains, and that cross-reference is the point: opening a search result must land
on a record that exists. Maintaining ~330 rows of that by hand does not work —
it is how `user_thandi_nkosi` came to point at nothing, and how 28 more people
did the moment the corpus grew.

## Two rules it enforces

**Curated rows are preserved verbatim.** `orig-*.json` holds the original
hand-written seeds, and they are emitted first and unchanged. Their ids are
referenced from outside — `discover/curation.json` features `rubicon-2018` as its
hero — so regenerating them silently broke the discover hero: the reference
stayed, the record moved. Generated rows are appended around them, never in place
of them.

**Output is deterministic.** The pseudo-random source is seeded with a constant,
so regenerating without editing `data.mjs` produces byte-identical files and an
empty diff.

## What the data is chosen for

Real producers, regions and appellations, because the point is to exercise
search. `château` vs `chateau`, `shiraz` vs `syrah`, `Bourgogne` vs `Burgundy`,
`Grüner Veltliner`, `Rías Baixas` — invented names fold and stem differently and
would prove nothing. Wine names are scoped by country, so a Stellenbosch estate
cannot end up selling a Barolo in rand.

Coverage the seeds deliberately hold: all six launch currencies, all six launch
languages in `NegotiatedText`, non-vintage wines, uncapped tastings, and unlisted
wines with no price.
