---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

Rebuild the wine record around who can answer a field, and make provenance
binary.

**Breaking:** `ProvenanceState` is now `"community" | "claimed"`. It was
`"community" | "listed" | "verified"`, which folded two independent axes into
one field: whether anyone accountable has claimed the record (binary) and how
much the community has said about it (a continuum, and not a provenance question
at all). `"listed"` was never a third provenance — it was a distributor claim
wearing a middle state's clothes, and it moves to `WineContract.claimedBy.kind`.
`provenance` is now a projection of `claimedBy` and is never written
independently of it.

Sample wines migrate accordingly: `verified` → claimed by a producer, `listed` →
claimed by a distributor, `community` unchanged. Anything switching on
`"verified"` or `"listed"` must read `claimedBy.kind` instead — including the
backend's own copy of the union in `packages/core/domain/trust.ts` and the
`wine.provenance === "listed"` branch in the discover hero mapper.

**The record model.** A wine's facts do not start empty. Estate, region, ward,
vintage, varietal, alcohol, closure and format are matched from Wine of Origin,
the back label and the SAWIS register at ingest, and are present from the first
second a record exists. The previous model treated the record as a progress bar
the crowd fills in, which framed a matched record as an empty one. What an
unclaimed record lacks is not knowledge — it is a voice.

New `WineRecordContract` (a separate fetch from the card shape, so ninety-odd
fields never ride along in a list) groups its rows by `RecordFieldKind` — who
*can* answer:

- `reference` — matched at ingest, always has a value, and the member's job is
  to **confirm or dispute** it, never to fill it in
- `estate_private` — only the producer holds it, so it is enumerable while
  empty: the page names what it is waiting on and offers no call to action,
  because a member guessing the yield is noise entering a record whose whole
  value is that it does not guess
- `commercial` — a distributor claim opens these and only these

That makes the claim asymmetry mechanical rather than a rule each client
reimplements: a producer claim answers the estate-private rows and opens the
estate's voice; a distributor claim opens commerce and leaves the voice shut.

Also new: `WineRegisterContract` (the community aggregate — the only layer that
moves with note count, with thresholds expressed as absent fields rather than
numbers clients compare against), `ClaimantAvailabilityContract` (price leaves
Kgwari's chrome for the claimant's block, with a response record), confirm and
dispute requests, and `cellarCount` / `saveCount` on wines plus `saveCount` and
`languageTag` on tasting notes.

**Text moves out of `search`.** `CanonicalText`, `ChromeText` and
`NegotiatedText` were never a search concept — the same three-way distinction
governs a record's ninety fields, its register of tasting words and an estate's
essay. They now live in `@edwardseshoka/contracts/text` alongside two new
carriers, `Measurement` and `YearRange`, and are re-exported from `search`
unchanged so existing importers keep resolving.

The record obeys the rule those types exist for: no field is a display string.
Field identity travels as a chrome key, values as measurements and year ranges,
closed vocabularies (aromas, tasting descriptors, colour readings) as chrome
keys, and only genuinely authored prose as negotiated text with the language it
landed on. `"14.21 %"` is a number, a unit and a decimal separator that is a
comma for most of this catalogue's members; `"73 % put it at worth knowing or
better"` is a percentage, an enum and English word order. Both are now sent as
data.

**Records are generated, not authored.** `catalog/wine-records.json` now comes
out of `generator/generate.mjs` with the rest of the seeds — one record per wine
rather than a hand-written few, with the field-to-source mapping declared once in
a table. Adding a reference field to the contract is one row there instead of 93
edits, and the taxonomy holds by construction: the table cannot emit an
estate-private row and nothing outside it can emit a reference one. Only what no
algorithm can derive is authored, in `generator/orig-wine-records.json` — an
estate's own essay and seals, and the most-saved member note.

`npm run check:seeds` regenerates in memory and fails on any drift, so a
hand-edit to a generated seed breaks the build instead of surviving to
production. `SamplesTests/WineRecords.test.js` asserts the model's invariants
over all 93 records, including that no value is ever a bare display string.

Keeping the register's vocabularies as keys is also what makes them searchable:
the index holds `aroma.fynbosSmoke` and the member sees their own language, so
browsing by aroma works in every locale without the index carrying one
translated word — the same mechanism that already makes verdict browsing work.
`SearchBrowseItemContract` needs no change to support it.
