---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

Add the contrast section, and date every editorial card.

Two gaps the Masthead's frontend build found — both cases where a client could
only have filled the hole by doing work the server owns.

**`DiscoverSection` gains `contrast`** — "Two ways of seeing": readings of ONE
bottle that do not agree. It carries the `wine` once, over all of them, and its
`items` are `TastingNoteContract`s whose own `wine` is therefore redundant.

It looks derivable from the room feed — group by wine, find two different
verdicts — and it is not. Which bottle is worth showing a disagreement about,
and which two of its readings to set against each other, is a judgement over the
whole corpus; a client holds one page of it and would surface whichever pair its
page happened to contain. At least two items, or the section is not sent.

**`EditorialContract.publishedAt` is now required**, matching
`EditorialDetailContract`. The archive files by date, rules itself into months
and shows the date on the row, and none of that is reachable from a card that
only carries it one fetch deeper — a client rendering the card got a dateless
row and no error to explain it.

BREAKING for both: every producer of an editorial card must now send
`publishedAt`. Consumers switching exhaustively over `DiscoverSection` will see
the new arm; readers already skip a `type` they do not know, so nothing needs to
draw it before it can ship.
