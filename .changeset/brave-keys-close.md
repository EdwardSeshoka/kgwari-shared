---
"@edwardseshoka/contracts": major
---

Close the record vocabularies, and give three localisation facts a wire shape.

**Open key fields: 24 → 3.** The record model's vocabulary was entirely open
strings, which meant the nineteen fields a detail page renders had no declaration
anywhere: a typo was a missing translation at runtime, and nothing could list
what a locale catalogue still owed. With seven launch locales and `af` already
carrying 238 keys to `en`'s 416, an unenumerable set is one nobody can close.

Now closed, one file per vocabulary in `catalog/vocabulary/`:

- `RecordFieldKey` — 19 fields, split by who may answer them (reference,
  estate-private, commercial), because that is the axis the page groups by and it
  makes the claim asymmetry mechanical rather than a rule each client re-implements
- `RecordGroupKey`, `LockedSectionKey`, `EstateSealKey`, `ColourReadingKey`,
  `RecordRoleKey`, `CollectionBadgeKey`
- `MeasurementUnitKey` — placed in `text` beside `Measurement`, not in `catalog`,
  because `text` is layer 0 and may not import a feature. A unit is a rendering
  concern; the boundary rule and the domain agree.
- `TastingWordKey` — **derived** from `TASTING_SCALES` rather than listed again,
  so a rung cannot be added to a metric without becoming a legal word key

The keys derived from a closed key are closed **by construction**, as template
literal types: `labelKey: \`record.group.${RecordGroupKey}\`` type-checks
`record.group.matched` and rejects `record.group.mtached`. They are still carried
on the wire so a client need not compute them, but they can no longer disagree
with the key they came from.

**Three keys stay open, deliberately.** The choice metrics and disagreement
subjects have zero instances — nothing has produced one. Closing a set on zero
instances means inventing one, and an invented vocabulary is worse than an open
string because it looks authoritative. Each says so in place, with a note to
close it when the first instance lands.

**Three fields gained a wire representation** they had never had:

- `RegionContract.exonym` / `.nameLanguage` — whether a place is known by a
  different name in another language, and which language this row carries. A
  region's name is the one catalogue field that is genuinely translatable, and a
  client cannot tell a translation from a fallback without being told.
- `EventContract.titleLanguage` — a tasting title is authored prose, so the
  language it was written in is part of the fact. Guessing "en" is how an
  Afrikaans title gets served as though it were a translation.
- `ProducerContract.foundedYear` — an ordinal the estate meta line renders.

All three existed only inside the seed generator, which is how a real
localisation feature ends up with nowhere to live on the wire.
