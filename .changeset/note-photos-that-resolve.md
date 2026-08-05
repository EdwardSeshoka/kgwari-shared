---
"@edwardseshoka/samples": minor
---

Give tasting-note photos urls that resolve, alt text that exists, and both
branches of `alt` a row to stand on.

Note photos were pointed at `https://images.kgwari.test/notes/<id>.jpg`. `.test`
is a reserved TLD and never resolves, so all 127 of them fell back to the
placeholder mesh: the fixture asserted "this note has a photo" and no consumer
could ever see one. Every other image in these seeds — 382 of them, across
wines, editorial and events — is a real url. The photos now come from the same
shared `IMAGES` pool.

**`alt` was absent everywhere, on every photo.** `MediaRefContract.alt` is
`NegotiatedText` — prose, in a language, written by whoever uploaded the image —
and the whole reason it is a carrier rather than a bare string is that a client
has to negotiate it. A fixture where no photo carries one exercises none of
that, and every consumer's alt path shipped untested.

So alt is now present on most photos and deliberately ABSENT on some. Described
is what an image should be, which makes it the common case here; but an upload
without a description is what most real ones are, and it is the row that breaks
a client reading `alt.text` without checking. Both branches now have rows —
145 described, 54 not.

The alt text describes the FRAME, not the wine: what is in the picture, not what
the bottle tasted like. The note already carries the tasting, and an alt that
repeated it would hand a screen reader the same prose twice.

Coverage rises from roughly a quarter of notes to two fifths. The two curated
notes gain photos as well — `note_alexandra_rubicon_2018` described, because it
is the note the discover hero features and therefore the row that has to
exercise url and alt together, and `note_johan_pinotage_2019` undescribed.

Generated deterministically as ever: the urls, the alt strings and which rows
get either are all seeded off the note key, so regenerating without editing the
generator still produces byte-identical files.
