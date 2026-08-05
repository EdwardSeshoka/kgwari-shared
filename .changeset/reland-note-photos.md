---
"@edwardseshoka/samples": minor
---

Land the note-photo fix that 14.2.0 documented but did not ship.

This is a re-land, not a new change. The original (267cf17, #79) was reverted in
#80, but the changesets bot had already consumed its changeset into the 14.2.0
version bump — so that release carries the entry and none of the code. Anyone
reading the 14.2.0 changelog to learn whether note photos resolve got the wrong
answer. The 14.2.0 section has been annotated to say so.

What actually changes, now:

Note photos pointed at `https://images.kgwari.test/notes/<id>.jpg`. `.test` is a
reserved TLD and never resolves, so all 127 of them fell back to the placeholder
mesh — the fixture asserted "this note has a photo" and no consumer could ever
see one. Every other image in these seeds, 382 across wines, editorial and
events, is a real url. They now come from the shared `IMAGES` pool.

`alt` was absent on every photo. `MediaRefContract.alt` is `NegotiatedText` —
prose, in a language, written by whoever uploaded the image — and the reason it
is a carrier rather than a string is that a client has to negotiate it. A
fixture where no photo carries one exercises none of that, so every consumer's
alt path shipped untested.

Alt is now present on most and deliberately absent on some: described is what an
image should be, but an upload without a description is what most real ones are,
and it is the row that breaks a client reading `alt.text` without checking. 145
described, 54 not. The text describes the FRAME rather than the wine — the note
already carries the tasting, and an alt repeating it would hand a screen reader
the same prose twice.

Coverage rises from roughly a quarter of notes to two fifths. Both curated notes
gain photos: `note_alexandra_rubicon_2018` described, since the discover hero
features it and it is therefore the row that must exercise url and alt together,
and `note_johan_pinotage_2019` undescribed.

Still deterministic: urls, alt strings and which rows get either are all seeded
off the note key, so `check:seeds` reports the output unchanged on regeneration.
