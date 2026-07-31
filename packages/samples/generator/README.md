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

```bash
npm run check:seeds --workspace @edwardseshoka/samples
```

`--check` regenerates in memory and compares instead of writing, naming any file
that has drifted. Run it in CI: it is what turns "never hand-edit a generated
seed" from a rule people remember into one the build enforces.

## Wine records

`catalog/wine-records.json` is one record per wine, and the generator is where
the record model lives.

A **reference** row is a pure function of the wine and the source that matched
it, declared once in `REFERENCE_FIELDS` — `estate ← wo`, `alcohol ← label`,
`certificateNumber ← sawis`. Adding a field to `WineRecordContract` is one row in
that table and all 93 records gain it. Nothing in the table can emit an
estate-private row and nothing outside it can emit a reference one, so the
taxonomy holds by construction rather than by review.

An **estate-private** row (soil, yield, fermentation, yeast, new oak, production
run, drink window) is answered only under a producer claim, and is otherwise
emitted with no value and no call to action — the record names what it is waiting
on. Members are never asked to guess these: a guessed yield is noise entering a
record whose whole value is that it does not guess.

A **commercial** row opens to a distributor claim and to nothing else.

`orig-wine-records.json` is the overlay, and holds only what no algorithm can
derive: an estate's own essay and cellarmaster line, its seals, and the most-saved
member note. Everything else about a record is computed. `SamplesTests/
WineRecords.test.js` asserts the invariants over all 93 — including that no value
is ever a bare display string.

## What the data is chosen for

Real producers, regions and appellations, because the point is to exercise
search. `château` vs `chateau`, `shiraz` vs `syrah`, `Bourgogne` vs `Burgundy`,
`Grüner Veltliner`, `Rías Baixas` — invented names fold and stem differently and
would prove nothing. Wine names are scoped by country, so a Stellenbosch estate
cannot end up selling a Barolo in rand.

Coverage the seeds deliberately hold: all six launch currencies, all six launch
languages in `NegotiatedText`, non-vintage wines, uncapped tastings, and unlisted
wines with no price.
