---
"@edwardseshoka/samples": major
---

feat(samples)!: seeds for the settled surfaces

The contracts for the Masthead, the Note and the Editorial detail shipped with
nothing to render them. This is the seed half.

## The check was green and the seeds were stale

`npm run check:seeds` compared generator output against committed files and
reported "up to date" — while `editorial.json`, `tasting-notes.json` and
`discover-response.json` were **hand-maintained and outside the check
entirely**. It is a consistency check, not a coverage one, and it could not see
that editorial sat on three content types long after six more shipped, or that
the note fixture was two rows carrying no structured reading at all.

Editorial and the notes are now generated, which brings them under `--check`.
The prose stays curated — generated sentences would be worse than none, and a
fixture nobody wants to read is a fixture nobody checks — so the hand-written
sources live in `generator/orig-*.json` beside the curated wines and events.
Only the JOIN is computed.

## What the seeds now carry

**Tasting notes: 2 → 509, with readings.** The register could report scale means,
aroma mentions and colour readings, and nothing in the corpus had ever produced
one — the aggregate could only be seeded, never derived, and the capture screen
the readings were designed for had no data. Notes now answer all seven scales
(including the three added in 7.0), name aromas from the pool their wine's colour
allows, take a colour and a rim reading, record a pour, and about one in twenty
reports a real fault. **A faulted note carries no verdict**, which is the
invariant stated the other way round: a fault never counts against the wine's
record. Roughly one in eight is private, so consumers meet a note that aggregates
without appearing.

**Events: the v2 fields.** `endDateTime`, the venue's IANA `timezone`, a
structured `venue` with its room, `languages`, `admission`, `capacity`/`taken`
with `seatsAvailable` derived from them rather than generated beside them,
`panel`, `lifecycle`, `booking`, `recap` on past evenings, `notesFiled` and
`saveCount`. Curated events are enriched too — the curated-first rule protects
IDS, not field sets, and the one event an editorial piece embeds should not be
the one event with no lifecycle.

**Editorial: cards derived from pieces.** Five detail pieces covering `article`,
`event`, `cause`, `offer` and `season` — with per-claim sources, an `unanswered`
column using all three reasons, per-market offers including one absent with a
stated reason, and claims that answer real wine-record rows through
`claims[].answers[]`. The event piece **embeds the events-domain event**,
resolved against the event seed: an `eventId` that resolves to nothing is now a
build failure rather than a quietly absent block. Cards are derived from pieces,
so a card cannot advertise something its piece no longer says.

**`createDiscover()` is the v2 page.** A member's note as the lede, chosen by
save count; the Latest ledger interleaving notes, pieces and attendance in one
chronological run; "from your cellar tonight"; and the room's standing record.
The v1 doorways and room feed are carried through verbatim — the brief lists
ADDITIONS, and dropping "Find your way in" would be a design decision taken by a
generator.

It briefly shipped as a second fixture beside the v1 snapshot. That was the wrong
shape to leave behind: two discover payloads is two answers to one question, and
a reader gets whichever they find first.

## The register is now counted, not invented

The reconciliation the previous pass left undone. A record claimed 1,480 notes,
the corpus held two, and the register in between was synthesised from the claim —
so the fixture's aggregate could not be checked against anything, and the
fault-exclusion rule had no rows to demonstrate itself on.

Now `buildRecords` derives every register from the note corpus and
`applyNoteCounts` writes the tally back onto the wine. `wine.noteCount` is a
COUNT of the note file rather than a number beside it, and `wine.verdict` is the
one its own notes voted for — a wine nobody has judged has none, because the
verdict comes from members. The totals fell by two orders of magnitude, which is
the correction rather than a regression: the old ones were never counting
anything.

The corpus is a long tail — one flagship at 120 notes, a few at 40-60, most at
one or two, a quarter with none — because a register is meant to look different
at one note, at forty and at a hundred and twenty, and a corpus with the same
depth everywhere can only demonstrate one of those. It now carries a dense
register, a thin one, an empty one, single-reading metrics that name their lone
reader, and the one disagreement section thick enough to open.

**The fault rule is now arithmetic.** 509 notes, 19 faulted, and the registers
sum to exactly 490 — asserted across the whole corpus rather than asserted about
one row.

## Two bugs the fixture had been shipping

`eventType` was drawn from a list containing `"masterclass"` — a value
`WineEventType` has never had — while omitting `"launch"`, which it has. And the
register's aroma TIER was assigned by position (`i < 3` primary, `i < 5`
secondary), so a wine's third-most-mentioned aroma was primary by arithmetic and
`aroma.curedMeat` could be reported as fruit. Tier is a property of the aroma and
is now declared as one. Nothing caught either, because every seed is CAST to its
contract rather than checked against it. Fixed, and `SamplesTests/SeedConformance.test.js` now keeps the promise the
casts make: legal enum members, closed-vocabulary keys drawn from their own
vocabulary, seats equal to capacity minus taken, no booking on an evening that is
off or already over, a recap dated after its own event, and the deprecated flat
venue fields equal to the structured block.

## Breaking

Requires `@edwardseshoka/contracts@^7.0.0`. `socialSamples.tastingNotes` grows
from 2 rows to 509 and `editorialSamples` gains `details`, so any consumer
asserting on fixture LENGTH rather than shape will need updating.

**Every `noteCount` in the catalogue changed**, because it is now a count rather
than a claim — a fixture asserting on a specific one will need rereading. So did
`createDiscover()`, which is the v2 page: a consumer expecting a wine hero and
five sections gets a note hero and eight.

Every seed id referenced from outside the generator is unchanged — verified
against the previous output, all 328 corpus rows and 55 activity ids byte-identical.
