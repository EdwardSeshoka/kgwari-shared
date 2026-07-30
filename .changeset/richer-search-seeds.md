---
"@edwardseshoka/samples": major
---

feature(samples): Expand the seeds so search can actually be tested

26 search rows could not exercise search. Nothing folded, no synonym had a pair,
one currency appeared, and a query returned two rows of the same kind. The corpus
is now **328 rows** — 93 wines, 63 estates, 61 regions, 59 tastings, 52 people —
backed by the five domain seeds that own them.

**Chosen to exercise the index, not to look full.** Real producers, regions and
appellations, because `château`, `Rías Baixas`, `Grüner Veltliner` and
`Weingut Dönnhoff` fold and stem the way real names do and invented ones do not.
The gap that matters is now measurable rather than asserted: `chateau` returns 0
rows where `château` returns 12, and `rhone` returns 0 where `rhône` returns 4.
That is the before/after for OpenSearch's `icu_folding`.

Coverage the seeds now hold deliberately:

- **All six launch currencies** — EUR 46, ZAR 20, GBP 4, USD 4, CAD 3, CHF 2.
  Priced in the producer's own currency, because the currency follows the data.
- **All six launch languages** in `NegotiatedText` — 64 rows across `af`, `de`,
  `en`, `es`, `fr`, `it`, as tasting titles and region exonyms (Bourgogne/Burgundy,
  Toscana/Tuscany, Jerez/Sherry).
- **The awkward cases**: non-vintage wines, tastings with no seat cap, wines with
  no listing, and grape synonym pairs the index mapping declares.

## Breaking

`@edwardseshoka/samples` exports the same functions with the same types, but the
**data behind them changed wholesale** — most ids are new, and every consumer
reading a specific row by id is affected. The 14 originally curated wines keep
their exact ids (`rubicon-2018` and the rest); everything else is new.

## `public-wines.json` is now `wines.json`

`createPublicWines()` becomes `createWines()`, and the file loses the qualifier.

Signing in does not change **which wines exist** — it changes what a member can do
with them and what additional data they see. So "public wines" was never a kind of
wine; it was describing a storage partition that had leaked into the naming. The
catalogue is one catalogue.

The deeper version of this is not fixed here: a member's cellar still stores a
full *copy* of the wine under `USER#<id>` rather than a reference, which is why
the partition exists at all. That is tracked separately — it needs a `CellarEntry`
that references a `wineId` and carries only what is true for that member, which is
what `TransactedMoneyContract` was added for.

## A generator, committed alongside

`generator/` now produces every seed from one curated source, run with
`npm run generate:seeds`.

It exists because the cross-reference is the point — opening a search result must
land on a record that exists — and ~330 rows of that cannot be maintained by
hand. It already caught two failures of exactly that kind: 28 people generated
into the corpus with no record in any domain (the `user_thandi_nkosi` bug at
scale), and `discover/curation.json` losing its hero because `rubicon-2018` was
regenerated out from under a reference that stayed pointing at it.

The generator is deterministic — regenerating without editing the source produces
byte-identical files — and preserves the hand-curated rows verbatim rather than
recreating them.
